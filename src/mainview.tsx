import * as React from 'react';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { v4 as uuid } from 'uuid';
import { JupyterCadModel } from './model';

import {
  IMainMessage,
  IWorkerMessage,
  WorkerAction,
  MainAction,
  IDisplayShape
} from './types';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
const DARK_BG = 'linear-gradient(rgb(0, 0, 42), rgb(82, 87, 110))';
const LIGHT_BG = 'radial-gradient(#efeded, #8f9091)';
const BG_COLOR = { 'JupyterLab Dark': DARK_BG, 'JupyterLab Light': LIGHT_BG };
interface IProps {
  context: DocumentRegistry.IContext<JupyterCadModel>;
}

interface IStates {
  id: string;
  bgColor: string;
  loading: boolean;
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

    this.state = {
      id: uuid(),
      bgColor: LIGHT_BG,
      loading: true
    };

    this._context = props.context;
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
        this.handleThemeChange(arg.newValue);
      });
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
  }

  handleThemeChange = (newTheme: string): void => {
    this.setState(old => ({ ...old, bgColor: BG_COLOR[newTheme] }));
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
        0x888888,
        0x888888
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

      const light2 = new THREE.DirectionalLight(0xffffff);
      light2.castShadow = true;
      light2.shadow.camera.top = 200;
      light2.shadow.camera.bottom = -200;
      light2.shadow.camera.left = -200;
      light2.shadow.camera.right = 200;
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
      // var controls = new TrackballControls(this.camera, this.renderer.domElement);
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.target.set(
        this._scene.position.x,
        this._scene.position.y,
        this._scene.position.z
      );
      this._controls = controls;
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
        this.postMessage({
          action: WorkerAction.LOAD_FILE,
          payload: {
            fileName: this._context.path,
            content: this._model!.toString()
          }
        });
      }
    }
  };

  private shapeToMesh = (payload: IDisplayShape['payload']) => {
    const { faceList } = payload;

    const mainObject = new THREE.Group();
    mainObject.name = 'shape';

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
        colors.push(face.face_index, globalFaceIndex, 0);
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
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const boxSizeVec = new THREE.Vector3();
    bbox.getSize(boxSizeVec);
    this._refLength = Math.max(boxSizeVec.x, boxSizeVec.y, boxSizeVec.z);

    this._camera.lookAt(this._scene.position);
    this._camera.position.set(
      2 * this._refLength,
      2 * this._refLength,
      2 * this._refLength
    );
    this._camera.far = 40 * this._refLength;
    this._gridHelper.scale.multiplyScalar(this._refLength / 5);
    for (let index = 0; index < this._sceneAxe.length; index++) {
      this._sceneAxe[index].scale.multiplyScalar(this._refLength / 5);
    }

    const model = new THREE.Mesh(geometry, material);
    model.castShadow = true;
    model.name = 'Model Faces';
    mainObject.add(model);
    this._scene.add(mainObject);
    this.setState(old => ({ ...old, loading: false }));
    console.log('Generation Complete!');
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
        <div
          ref={this.divRef}
          style={{
            width: '100%',
            height: 'calc(100%)',
            background: this.state.bgColor //"radial-gradient(#efeded, #8f9091)"
          }}
        />
      </div>
    );
  }

  private divRef = React.createRef<HTMLDivElement>(); // Reference of render div

  private _context: DocumentRegistry.IContext<JupyterCadModel>;
  private _model?: JupyterCadModel = undefined;
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
}
