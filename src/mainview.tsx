import { DocumentRegistry } from '@jupyterlab/docregistry';
import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { v4 as uuid } from 'uuid';

import { JupyterCadModel } from './model';
import {
  IDict,
  IDisplayShape,
  IMainMessage,
  IWorkerMessage,
  MainAction,
  Position,
  WorkerAction
} from './types';

type THEME_TYPE = 'JupyterLab Dark' | 'JupyterLab Light';
const DARK_THEME: THEME_TYPE = 'JupyterLab Dark';
const LIGHT_THEME: THEME_TYPE = 'JupyterLab Light';

const BG_COLOR = {
  [DARK_THEME]: 'linear-gradient(rgb(0, 0, 42), rgb(82, 87, 110))',
  [LIGHT_THEME]: 'radial-gradient(#efeded, #8f9091)'
};
const GRID_COLOR = {
  [DARK_THEME]: 0x4f6882,
  [LIGHT_THEME]: 0x888888
};

interface IProps {
  context: DocumentRegistry.IContext<JupyterCadModel>;
}

interface IStates {
  id: string;
  loading: boolean;
  theme: THEME_TYPE;
}

export class MainView extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setDrawRange(0, 3 * 10000);
    this._refLength = 0;
    this._sceneAxe = [];
    // this.shapeGroup = new THREE.Group();
    // this.sceneScaled = false;
    // this.computedScene = {};
    // this.progressData = { time_step: -1, data: {} };
    this._resizeTimeout = null;
    const theme = ((window as any).jupyterlabTheme ||
      LIGHT_THEME) as THEME_TYPE;
    this.state = {
      id: uuid(),
      theme,
      loading: true
    };

    this._context = props.context;
    this._cameraClients = {};
    this._context.ready.then(() => {
      this._model = this._context.model as JupyterCadModel;

      this._worker = this._model.getWorker();
      this._messageChannel = new MessageChannel();
      this._messageChannel.port1.onmessage = msgEvent => {
        this.messageHandler(msgEvent.data);
      };
      this.postMessage(
        { action: WorkerAction.REGISTER, payload: { id: this.state.id } },
        this._messageChannel.port2
      );
      this._model.themeChanged.connect((_, arg) => {
        this.handleThemeChange(arg.newValue as THEME_TYPE);
      });
      this._model.cameraChanged.connect(this._onCameraChanged);
    });
  }
  componentDidMount(): void {
    window.addEventListener('resize', this.handleWindowResize);
    this.generateScene();
  }

  componentDidUpdate(oldProps: IProps, oldState: IStates): void {
    this.resizeCanvasToDisplaySize();
  }

  componentWillUnmount(): void {
    window.cancelAnimationFrame(this._requestID);
    window.removeEventListener('resize', this.handleWindowResize);
    this._controls.dispose();
    this.postMessage({
      action: WorkerAction.CLOSE_FILE,
      payload: {
        fileName: this._context.path
      }
    });
  }

  handleThemeChange = (newTheme: THEME_TYPE): void => {
    this.setState(old => ({ ...old, theme: newTheme }));
  };
  handleWindowResize = () => {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      this.forceUpdate();
    }, 500);
  };

  addSceneAxe = (dir: THREE.Vector3, color: number): void => {
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 20;
    const arrowHelperX = new THREE.ArrowHelper(
      dir,
      origin,
      length,
      color,
      0.4,
      0.2
    );
    this._scene.add(arrowHelperX);
    const positions = [
      origin.x,
      origin.y,
      origin.z,
      length * dir.x,
      length * dir.y,
      length * dir.z
    ];

    const lineColor = new THREE.Color(color);
    const colors = [
      lineColor.r,
      lineColor.g,
      lineColor.b,
      lineColor.r,
      lineColor.g,
      lineColor.b
    ];
    const geo = new LineGeometry();
    geo.setPositions(positions);
    geo.setColors(colors);
    const matLine = new LineMaterial({
      linewidth: 1.5, // in pixels
      vertexColors: true
    });
    matLine.resolution.set(800, 600);
    const line = new Line2(geo, matLine);
    this._sceneAxe.push(arrowHelperX, line);
    this._scene.add(line);
  };

  sceneSetup = (): void => {
    if (this.divRef.current !== null) {
      this._camera = new THREE.PerspectiveCamera(90, 2, 0.1, 1000);
      this._camera.position.set(8, 8, 8);
      this._camera.up.set(0, 0, 1);

      this._scene = new THREE.Scene();
      const size = 40;
      const divisions = 40;
      this._gridHelper = new THREE.GridHelper(
        size,
        divisions,
        GRID_COLOR[this.state.theme],
        GRID_COLOR[this.state.theme]
        // 0x888888,
        // 0x888888
      );
      this._gridHelper.geometry.rotateX(Math.PI / 2);

      this._scene.add(this._gridHelper);
      this.addSceneAxe(new THREE.Vector3(1, 0, 0), 0x00ff00);
      this.addSceneAxe(new THREE.Vector3(0, 1, 0), 0xff0000);
      this.addSceneAxe(new THREE.Vector3(0, 0, 1), 0xffff00);

      const lights: Array<any> = [];
      lights[0] = new THREE.AmbientLight(0x404040); // soft white light
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);

      this._scene.add(lights[0]);
      this._camera.add(lights[1]);

      const light2 = new THREE.SpotLight(0xffffff, 1);
      light2.castShadow = true;
      // light2.shadow.camera.top = 200;
      // light2.shadow.camera.bottom = -200;
      // light2.shadow.camera.left = -200;
      // light2.shadow.camera.right = 200;
      light2.shadow.radius = 32;
      light2.shadow.mapSize.width = 128;
      light2.shadow.mapSize.height = 128;

      this._camera.add(light2);

      this._scene.add(this._camera);

      this._renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });
      // this._renderer.setPixelRatio(window.devicePixelRatio);
      this._renderer.setClearColor(0x000000, 0);
      this._renderer.setSize(500, 500, false);
      this.divRef.current.appendChild(this._renderer.domElement); // mount using React ref

      const controls = new OrbitControls(
        this._camera,
        this._renderer.domElement
      );
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.target.set(
        this._scene.position.x,
        this._scene.position.y,
        this._scene.position.z
      );
      this._controls = controls;

      const canvas = this._renderer.domElement;
      canvas.addEventListener('mousedown', event => {
        this._mouseDown = true;
      });
      canvas.addEventListener('mouseup', event => {
        this._mouseDown = false;
      });
      canvas.addEventListener('mouseleave', event => {
        this._model.syncCamera(undefined);
      });
      ['wheel', 'mousemove'].forEach(evtName => {
        canvas.addEventListener(
          evtName as any,
          (event: MouseEvent | WheelEvent) => {
            this._model.syncCamera({
              offsetX: event.offsetX,
              offsetY: event.offsetY,
              x: this._camera.position.x,
              y: this._camera.position.y,
              z: this._camera.position.z
            });
          }
        );
      });
    }
  };
  startAnimationLoop = (): void => {
    this._requestID = window.requestAnimationFrame(this.startAnimationLoop);
    this._controls.update();
    this._renderer.clearDepth();
    this._renderer.render(this._scene, this._camera);
  };

  resizeCanvasToDisplaySize = (): void => {
    if (this.divRef.current !== null) {
      this._renderer.setSize(
        this.divRef.current.clientWidth,
        this.divRef.current.clientHeight,
        false
      );
      this._camera.aspect =
        this.divRef.current.clientWidth / this.divRef.current.clientHeight;
      this._camera.updateProjectionMatrix();
    }
  };

  generateScene = (): void => {
    this.sceneSetup();
    this.startAnimationLoop();
    this.resizeCanvasToDisplaySize();
  };

  messageHandler = (msg: IMainMessage): void => {
    switch (msg.action) {
      case MainAction.DISPLAY_SHAPE: {
        this.shapeToMesh(msg.payload);
        break;
      }
      case MainAction.INITIALIZED: {
        if (!this._model) {
          return;
        }
        const render = () => {
          this.postMessage({
            action: WorkerAction.LOAD_FILE,
            payload: {
              fileName: this._context.path,
              content: this._model.getContent()
            }
          });
        };
        this._model.sharedModelChanged.connect(render);
        render();
      }
    }
  };

  private shapeToMesh = (payload: IDisplayShape['payload']) => {
    const old = this._scene.getObjectByName('shape');
    if (old) {
      this._scene.remove(old);
    }

    const mainObject = new THREE.Group();
    mainObject.name = 'shape';
    Object.entries(payload).forEach(([objName, data]) => {
      const { faceList, edgeList } = data;
      const vertices: Array<any> = [];
      const normals: Array<any> = [];
      const triangles: Array<any> = [];
      const uvs: Array<any> = [];
      const colors: Array<any> = [];
      let vInd = 0;
      let globalFaceIndex = 0;
      faceList.forEach(face => {
        // Copy Vertices into three.js Vector3 List
        vertices.push(...face.vertex_coord);
        normals.push(...face.normal_coord);
        uvs.push(...face.uv_coord);

        // Sort Triangles into a three.js Face List
        for (let i = 0; i < face.tri_indexes.length; i += 3) {
          triangles.push(
            face.tri_indexes[i + 0] + vInd,
            face.tri_indexes[i + 1] + vInd,
            face.tri_indexes[i + 2] + vInd
          );
        }

        // Use Vertex Color to label this face's indices for raycast picking
        for (let i = 0; i < face.vertex_coord.length; i += 3) {
          colors.push(0, globalFaceIndex, 0);
        }

        globalFaceIndex++;
        vInd += face.vertex_coord.length / 3;
      });

      // Compile the connected vertices and faces into a model
      // And add to the scene
      const material = new THREE.MeshPhongMaterial({
        color: '#434442',
        side: THREE.DoubleSide,
        wireframe: false,
        flatShading: false,
        shininess: 40
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setIndex(triangles);
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      geometry.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(normals, 3)
      );
      geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
      );
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(uvs, 2));

      const model = new THREE.Mesh(geometry, material);
      model.castShadow = true;
      model.name = objName;

      const edgeMaterial = new THREE.LineBasicMaterial({
        linewidth: 10,
        color: 'black'
      });
      edgeList.forEach(edge => {
        const edgeGeometry = new THREE.BufferGeometry();
        const edgeVertices = new Float32Array(edge.vertices.length);
        for (let index = 0; index < edge.vertices.length; index++) {
          edgeVertices[index] = edge.vertices[index];
        }
        edgeGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(edgeVertices, 3, false)
        );
        edgeGeometry.setIndex(edge.faces);
        const mesh = new THREE.Line(geometry, edgeMaterial);
        mesh.quaternion.set(
          edge.quat[0],
          edge.quat[1],
          edge.quat[2],
          edge.quat[3]
        );
        mesh.position.set(edge.pos[0], edge.pos[1], edge.pos[2]);
        model.add(mesh);
      });

      mainObject.add(model);
    });
    const boundingGroup = new THREE.Box3();
    boundingGroup.setFromObject(mainObject);

    const boxSizeVec = new THREE.Vector3();
    boundingGroup.getSize(boxSizeVec);

    const oldRefLength = this._refLength || 1;
    this._refLength =
      Math.max(boxSizeVec.x, boxSizeVec.y, boxSizeVec.z) / 5 || 1;

    this._camera.lookAt(this._scene.position);
    if (oldRefLength !== this._refLength) {
      this._camera.position.set(
        10 * this._refLength,
        10 * this._refLength,
        10 * this._refLength
      );
      this._camera.far = 200 * this._refLength;
      this._gridHelper.scale.multiplyScalar(this._refLength / oldRefLength);
      for (let index = 0; index < this._sceneAxe.length; index++) {
        this._sceneAxe[index].scale.multiplyScalar(
          this._refLength / oldRefLength
        );
      }
    }
    this._scene.add(mainObject);
    this.setState(old => ({ ...old, loading: false }));
  };

  private postMessage = (
    msg: Omit<IWorkerMessage, 'id'>,
    port?: MessagePort
  ) => {
    if (this._worker) {
      const newMsg = { ...msg, id: this.state.id };
      if (port) {
        this._worker.postMessage(newMsg, [port]);
      } else {
        this._worker.postMessage(newMsg);
      }
    }
  };

  private _onCameraChanged = (
    sender: JupyterCadModel,
    clients: Map<number, any>
  ): void => {
    clients.forEach((client, key) => {
      if (this._context.model.getClientId() !== key) {
        const id = key.toString();
        const mouse = client.mouse as Position;
        if (mouse && this._cameraClients[id]) {
          if (mouse.offsetX > 0) {
            this._cameraClients[id]!.style.left = mouse.offsetX + 'px';
          }
          if (mouse.offsetY > 0) {
            this._cameraClients[id]!.style.top = mouse.offsetY + 'px';
          }
          if (!this._mouseDown) {
            this._camera.position.set(mouse.x, mouse.y, mouse.z);
          }
        } else if (mouse && !this._cameraClients[id]) {
          const el = document.createElement('div');
          el.className = 'jpcad-camera-client';
          el.style.left = mouse.offsetX + 'px';
          el.style.top = mouse.offsetY + 'px';
          el.style.backgroundColor = client.user.color;
          el.innerText = client.user.name;
          this._cameraClients[id] = el;
          this._cameraRef.current?.appendChild(el);
        } else if (!mouse && this._cameraClients[id]) {
          this._cameraRef.current?.removeChild(this._cameraClients[id]!);
          this._cameraClients[id] = undefined;
        }

        // if (client.mouse) {
        //   const cameraPos = client.mouse as Position;
        //   if (el) {
        //     el.style.left = cameraPos.offsetX + 'px';
        //     el.style.top = cameraPos.offsetY + 'px';
        //   } else {
        //     const newEl = document.createElement('div');
        //     newEl.className = 'jpcad-camera-client';
        //     newEl.style.left = cameraPos.offsetX + 'px';
        //     newEl.style.top = cameraPos.offsetY + 'px';
        //     newEl.style.backgroundColor = client.user.color;
        //     newEl.innerText = client.user.name;
        //     this._cameraClients[id] = el;
        //     this._cameraRef.current?.appendChild(newEl);
        //   }
        // } else {
        //   if (el) {
        //     this._cameraRef.current?.removeChild(el);
        //     this._cameraClients[id] = undefined;
        //   }
        // }
      }
    });
  };

  render(): JSX.Element {
    return (
      <div
        style={{
          width: '100%',
          height: 'calc(100%)'
        }}
      >
        <div
          className={'jpcad-Spinner'}
          style={{ display: this.state.loading ? 'flex' : 'none' }}
        >
          {' '}
          <div className={'jpcad-SpinnerContent'}></div>{' '}
        </div>
        <div ref={this._cameraRef}></div>
        <div
          ref={this.divRef}
          style={{
            width: '100%',
            height: 'calc(100%)',
            background: BG_COLOR[this.state.theme] //"radial-gradient(#efeded, #8f9091)"
          }}
        />
      </div>
    );
  }

  private divRef = React.createRef<HTMLDivElement>(); // Reference of render div
  private _cameraRef = React.createRef<HTMLDivElement>();

  private _context: DocumentRegistry.IContext<JupyterCadModel>;
  private _model: JupyterCadModel;
  private _worker?: Worker = undefined;
  private _messageChannel?: MessageChannel;

  private _scene: THREE.Scene; // Threejs scene
  private _camera: THREE.PerspectiveCamera; // Threejs camera
  private _renderer: THREE.WebGLRenderer; // Threejs render
  private _requestID: any = null; // ID of window.requestAnimationFrame
  private _geometry: THREE.BufferGeometry; // Threejs BufferGeometry
  private _refLength: number; // Length of bounding box of current object
  private _gridHelper: THREE.GridHelper; // Threejs grid
  private _sceneAxe: (THREE.ArrowHelper | Line2)[]; // Array of  X, Y and Z axe
  private _controls: any; // Threejs control
  private _resizeTimeout: any;
  private _mouseDown = false;
  private _cameraClients: IDict<HTMLElement | undefined>;
}
