import { DocumentRegistry } from '@jupyterlab/docregistry';

import * as React from 'react';

import * as Color from 'd3-color';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast
} from 'three-mesh-bvh';

import { v4 as uuid } from 'uuid';
import { JupyterCadModel } from './model';
import { User } from '@jupyterlab/services';
import {
  IDict,
  IDisplayShape,
  IJupyterCadClientState,
  IMainMessage,
  IWorkerMessage,
  MainAction,
  WorkerAction
} from './types';

// Apply the BVH extension
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const DARK_BG_COLOR = 'linear-gradient(rgb(0, 0, 42), rgb(82, 87, 110))';
const LIGHT_BG_COLOR = 'radial-gradient(#efeded, #8f9091)';
const DARK_GRID_COLOR = 0x4f6882;
const LIGHT_GRID_COLOR = 0x888888;

const DEFAULT_MESH_COLOR = new THREE.Color('#434442');
const SELECTED_MESH_COLOR = new THREE.Color('#AB5118');

interface IProps {
  context: DocumentRegistry.IContext<JupyterCadModel>;
}

interface IStates {
  id: string; // ID of the component, it is used to identify which component
  //is the source of awareness updates.
  loading: boolean;
  lightTheme: boolean;
  remoteUser?: User.IIdentity;
}

/**
 * The result of mesh picking, contains the picked mesh and the 3D position of the pointer.
 */
interface IPickedResult {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  position: THREE.Vector3;
}

export class MainView extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setDrawRange(0, 3 * 10000);
    this._refLength = 0;
    this._sceneAxe = [];

    this._resizeTimeout = null;

    const lightTheme =
      document.body.getAttribute('data-jp-theme-light') === 'true';

    this.state = {
      id: uuid(),
      lightTheme,
      loading: true
    };

    this._pointer = new THREE.Vector2();

    this._context = props.context;
    this._collaboratorPointers = {};
    this._context.ready.then(() => {
      this._model = this._context.model as JupyterCadModel;

      this._worker = this._model.getWorker();
      this._messageChannel = new MessageChannel();
      this._messageChannel.port1.onmessage = msgEvent => {
        this.messageHandler(msgEvent.data);
      };
      this._postMessage(
        { action: WorkerAction.REGISTER, payload: { id: this.state.id } },
        this._messageChannel.port2
      );
      this._model.themeChanged.connect(this._handleThemeChange);
      this._model.clientStateChanged.connect(this._onClientSharedStateChanged);
    });
    if (this._raycaster.params.Line) {
      this._raycaster.params.Line.threshold = 0.1;
    }
  }

  componentDidMount(): void {
    window.addEventListener('resize', this._handleWindowResize);
    this.generateScene();
  }

  componentDidUpdate(oldProps: IProps, oldState: IStates): void {
    this.resizeCanvasToDisplaySize();
  }

  componentWillUnmount(): void {
    window.cancelAnimationFrame(this._requestID);
    window.removeEventListener('resize', this._handleWindowResize);
    this._controls.dispose();
    this._postMessage({
      action: WorkerAction.CLOSE_FILE,
      payload: {
        fileName: this._context.path
      }
    });
    this._model.themeChanged.disconnect(this._handleThemeChange);
    this._model.clientStateChanged.disconnect(this._onClientSharedStateChanged);
  }

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
        this.state.lightTheme ? LIGHT_GRID_COLOR : DARK_GRID_COLOR,
        this.state.lightTheme ? LIGHT_GRID_COLOR : DARK_GRID_COLOR
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

      this._renderer.domElement.addEventListener(
        'pointermove',
        this._onPointerMove.bind(this)
      );
      this._renderer.domElement.addEventListener(
        'mouseup',
        this._onClick.bind(this)
      );

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

      this._controls.addEventListener('change', () => {
        this._model.syncCamera(
          {
            position: this._camera.position.toArray([]),
            rotation: this._camera.rotation.toArray([]),
            up: this._camera.up.toArray([])
          },
          this.state.id
        );
      });
    }
  };

  _pick(): IPickedResult | null {
    if (this._meshGroup === null || !this._meshGroup.children) {
      return null;
    }

    this._raycaster.setFromCamera(this._pointer, this._camera);

    const intersects = this._raycaster.intersectObjects(
      this._meshGroup.children
    );

    if (intersects.length > 0) {
      return {
        mesh: intersects[0].object as THREE.Mesh<
          THREE.BufferGeometry,
          THREE.MeshBasicMaterial
        >,
        position: intersects[0].point
      };
    }

    return null;
  }

  startAnimationLoop = (): void => {
    this._requestID = window.requestAnimationFrame(this.startAnimationLoop);

    this._controls.update();

    // Set color for selected meshes
    if (this._meshGroup !== null) {
      (
        this._meshGroup.children as THREE.Mesh<
          THREE.BufferGeometry,
          THREE.MeshBasicMaterial
        >[]
      ).forEach(mesh => {
        mesh.material.color = DEFAULT_MESH_COLOR;
      });
    }
    if (this._selectedMesh) {
      this._selectedMesh.material.color = SELECTED_MESH_COLOR;
    }

    this._renderer.setRenderTarget(null);

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
        this._shapeToMesh(msg.payload);
        break;
      }
      case MainAction.INITIALIZED: {
        if (!this._model) {
          return;
        }
        const render = () => {
          this._postMessage({
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

  private _onPointerMove(e: MouseEvent) {
    const rect = this._renderer.domElement.getBoundingClientRect();

    this._pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const picked = this._pick();
    if (picked) {
      this._model.syncPointer(picked.position);
    } else {
      this._model.syncPointer(undefined);
    }
  }

  private _onClick(e: MouseEvent) {
    const selection = this._pick();

    if (selection) {
      if (selection.mesh === this._selectedMesh) {
        this._selectedMesh = null;
      } else {
        if (selection.mesh.name.startsWith('edge')) {
          this._selectedMesh = selection.mesh.parent as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.MeshBasicMaterial
          >;
        } else {
          this._selectedMesh = selection.mesh;
        }
      }

      if (this._selectedMesh) {
        this._model.syncSelectedObject(this._selectedMesh.name, this.state.id);
      } else {
        this._model.syncSelectedObject(undefined, this.state.id);
      }
    }
  }

  private _shapeToMesh = (payload: IDisplayShape['payload']) => {
    if (this._meshGroup !== null) {
      this._scene.remove(this._meshGroup);
    }

    this._meshGroup = new THREE.Group();
    Object.entries(payload).forEach(([objName, data]) => {
      const { faceList, edgeList, jcObject } = data;
      if (!jcObject.visible) {
        return;
      }
      const vertices: Array<any> = [];
      const normals: Array<any> = [];
      const triangles: Array<any> = [];

      let vInd = 0;
      if (faceList.length === 0) {
        return;
      }
      faceList.forEach(face => {
        // Copy Vertices into three.js Vector3 List
        vertices.push(...face.vertexCoord);
        normals.push(...face.normalCoord);

        // Sort Triangles into a three.js Face List
        for (let i = 0; i < face.triIndexes.length; i += 3) {
          triangles.push(
            face.triIndexes[i + 0] + vInd,
            face.triIndexes[i + 1] + vInd,
            face.triIndexes[i + 2] + vInd
          );
        }

        vInd += face.vertexCoord.length / 3;
      });

      // Compile the connected vertices and faces into a model
      // And add to the scene
      // We need one material per-mesh because we will set the uniform color independently later
      // it's too bad Three.js does not easily allow setting uniforms independently per-mesh
      const material = new THREE.MeshPhongMaterial({
        color: DEFAULT_MESH_COLOR,
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
      geometry.computeBoundsTree();

      const model = new THREE.Mesh(geometry, material);
      model.castShadow = true;
      model.name = objName;

      const edgeMaterial = new THREE.LineBasicMaterial({
        linewidth: 5,
        color: 'black'
      });
      edgeList.forEach(edge => {
        const edgeVertices = new THREE.Float32BufferAttribute(
          edge.vertexCoord,
          3
        );
        const edgeGeometry = new THREE.BufferGeometry();
        edgeGeometry.setAttribute('position', edgeVertices);
        const mesh = new THREE.Line(edgeGeometry, edgeMaterial);
        mesh.name = 'edge';

        model.add(mesh);
      });

      this._meshGroup!.add(model);
    });
    const boundingGroup = new THREE.Box3();
    boundingGroup.setFromObject(this._meshGroup);

    const boxSizeVec = new THREE.Vector3();
    boundingGroup.getSize(boxSizeVec);

    const oldRefLength = this._refLength || 1;
    this._refLength =
      Math.max(boxSizeVec.x, boxSizeVec.y, boxSizeVec.z) / 5 || 1;
    this._updatePointers();
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
    this._scene.add(this._meshGroup);
    this.setState(old => ({ ...old, loading: false }));
  };

  private _postMessage = (
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

  private _updatePointers(): void {
    const newGeometry = new THREE.SphereGeometry(this._refLength / 10, 32, 32);
    if (this._localPointer) {
      this._localPointer.geometry = newGeometry;
    }
    for (const clientId in this._collaboratorPointers) {
      this._collaboratorPointers[clientId].geometry = newGeometry;
    }
  }

  private _createPointer(user: User.IIdentity): THREE.Mesh {
    let clientColor: Color.RGBColor | null = null;

    if (user.color.startsWith('var')) {
      clientColor = Color.color(
        getComputedStyle(document.documentElement).getPropertyValue(
          user.color.slice(4, -1)
        )
      ) as Color.RGBColor;
    } else {
      clientColor = Color.color(user.color) as Color.RGBColor;
    }

    const material = new THREE.MeshBasicMaterial({
      color: clientColor
        ? new THREE.Color(clientColor.r, clientColor.g, clientColor.b)
        : 'black'
    });
    const pointerGeometry = new THREE.SphereGeometry(
      this._refLength / 10,
      32,
      32
    );
    const mesh = new THREE.Mesh(pointerGeometry, material);
    return mesh;
  }

  private _onClientSharedStateChanged = (
    sender: JupyterCadModel,
    clients: Map<number, IJupyterCadClientState>
  ): void => {
    const remoteUser = this._model.localState?.remoteUser;
    if (remoteUser) {
      const remoteState = clients.get(remoteUser);
      if(!remoteState){
        return
      }
      if (remoteState.user?.username !== this.state.remoteUser?.username) {
        this.setState(old => ({ ...old, remoteUser: remoteState.user }));
      }
      // Sync selected
      if (remoteState.selected.value) {
        const selected = this._meshGroup?.getObjectByName(
          remoteState.selected.value
        );
        if (selected) {
          this._selectedMesh = selected as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.MeshBasicMaterial
          >;
        }
      }
      // Sync camera
      const remoteCamera = remoteState.camera;
      if (remoteCamera?.value) {
        const { position, rotation, up } = remoteCamera.value;
        this._camera.position.set(position[0], position[1], position[2]);
        this._camera.rotation.set(rotation[0], rotation[1], rotation[2]);
        this._camera.up.set(up[0], up[1], up[2]);
      }

      // Sync pointer
      if (this._localPointer) {
        this._localPointer.visible = false;
      }
      const pointer = remoteState.pointer?.value;
      if (!this._collaboratorPointers[remoteUser]) {
        // Getting user color

        this._collaboratorPointers[remoteUser] = this._createPointer(
          remoteState.user
        );
        this._scene.add(this._collaboratorPointers[remoteUser]);
      }

      const collaboratorPointer = this._collaboratorPointers[remoteUser];

      if (pointer) {
        collaboratorPointer.visible = true;
        collaboratorPointer.position.copy(
          new THREE.Vector3(pointer[0], pointer[1], pointer[2])
        );
      } else {
        collaboratorPointer.visible = false;
      }
    } else {
      this.setState(old => ({ ...old, remoteUser: undefined }));

      Object.values(this._collaboratorPointers).forEach(
        p => (p.visible = false)
      );
      const localState = this._model.localState!;
      const pointer = localState.pointer?.value;
      if (!this._localPointer) {
        this._localPointer = this._createPointer(localState.user);
        this._scene.add(this._localPointer);
      }
      if (pointer) {
        this._localPointer.visible = true;
        this._localPointer.position.copy(
          new THREE.Vector3(pointer[0], pointer[1], pointer[2])
        );
      } else {
        this._localPointer.visible = false;
      }
    }
  };

  private _handleThemeChange = (): void => {
    const lightTheme =
      document.body.getAttribute('data-jp-theme-light') === 'true';
    this.setState(old => ({ ...old, lightTheme }));
  };

  private _handleWindowResize = (): void => {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      this.forceUpdate();
    }, 500);
  };

  render(): JSX.Element {
    return (
      <div
        className="jcad-Mainview"
        style={{
          border: this.state.remoteUser
            ? `solid 3px ${this.state.remoteUser.color}`
            : 'unset'
        }}
      >
        <div
          className={'jpcad-Spinner'}
          style={{ display: this.state.loading ? 'flex' : 'none' }}
        >
          {' '}
          <div className={'jpcad-SpinnerContent'}></div>{' '}
        </div>
        {this.state.remoteUser?.display_name ? (
          <div
            style={{
              position: 'absolute',
              top: 1,
              right: 3,
              background: this.state.remoteUser.color
            }}
          >
            {`Following ${this.state.remoteUser.display_name}`}
          </div>
        ) : null}

        <div
          ref={this.divRef}
          style={{
            width: '100%',
            height: 'calc(100%)',
            background: this.state.lightTheme ? LIGHT_BG_COLOR : DARK_BG_COLOR
          }}
        />
      </div>
    );
  }

  private divRef = React.createRef<HTMLDivElement>(); // Reference of render div

  private _context: DocumentRegistry.IContext<JupyterCadModel>;
  private _model: JupyterCadModel;
  private _worker?: Worker = undefined;
  private _messageChannel?: MessageChannel;

  private _pointer: THREE.Vector2;
  private _selectedMesh: THREE.Mesh<
    THREE.BufferGeometry,
    THREE.MeshBasicMaterial
  > | null = null;

  private _meshGroup: THREE.Group | null = null; // The list of ThreeJS meshes

  private _scene: THREE.Scene; // Threejs scene
  private _camera: THREE.PerspectiveCamera; // Threejs camera
  private _raycaster = new THREE.Raycaster();
  private _renderer: THREE.WebGLRenderer; // Threejs render
  private _requestID: any = null; // ID of window.requestAnimationFrame
  private _geometry: THREE.BufferGeometry; // Threejs BufferGeometry
  private _refLength: number; // Length of bounding box of current object
  private _gridHelper: THREE.GridHelper; // Threejs grid
  private _sceneAxe: (THREE.ArrowHelper | Line2)[]; // Array of  X, Y and Z axe
  private _controls: any; // Threejs control
  private _resizeTimeout: any;
  // private _mouseDown = false;
  private _collaboratorPointers: IDict<THREE.Mesh>;
  private _localPointer?: THREE.Mesh;
}
