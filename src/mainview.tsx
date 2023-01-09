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
  IJupyterCadDoc,
  IJupyterCadDocChange,
  IMainMessage,
  IWorkerMessage,
  MainAction,
  WorkerAction
} from './types';

import { ContextMenu } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';
import { MapChange } from '@jupyter/ydoc';
import { FloatingAnnotation } from './annotation/view';

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
  remoteUser?: User.IIdentity | null;
  annotations: IDict;
  firstLoad: boolean;
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
    this._sceneAxe = [];

    this._resizeTimeout = null;

    const lightTheme =
      document.body.getAttribute('data-jp-theme-light') === 'true';

    this.state = {
      id: uuid(),
      lightTheme,
      loading: true,
      annotations: {},
      firstLoad: true
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
      this._model.themeChanged.connect(this._handleThemeChange, this);
      this._model.sharedModelChanged.connect(this._onSharedModelChanged, this);
      this._model.clientStateChanged.connect(
        this._onClientSharedStateChanged,
        this
      );
      this._model.sharedMetadataChanged.connect(
        this._onSharedMetadataChanged,
        this
      );
    });
    if (this._raycaster.params.Line) {
      this._raycaster.params.Line.threshold = 0.1;
    }
  }

  componentDidMount(): void {
    window.addEventListener('resize', this._handleWindowResize);
    this.generateScene();
    this.addContextMenu();
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
    this._model.themeChanged.disconnect(this._handleThemeChange, this);
    this._model.sharedModelChanged.disconnect(this._onSharedModelChanged, this);
    this._model.clientStateChanged.disconnect(
      this._onClientSharedStateChanged,
      this
    );
    this._model.sharedMetadataChanged.disconnect(
      this._onSharedMetadataChanged,
      this
    );
  }

  addContextMenu = (): void => {
    const commands = new CommandRegistry();
    commands.addCommand('add-annotation', {
      execute: () => {
        const currentId = this._model.getClientId();
        const localPointer = this._collaboratorPointers[currentId];
        const position = localPointer?.position;
        if (position) {
          this._model.addMetadata(
            `annotation_${uuid()}`,
            JSON.stringify({
              position: [position.x, position.y, position.z],
              label: 'New annotation',
              contents: []
            })
          );
        }
      },
      label: 'Add annotation',
      isEnabled: () => true
    });
    this._contextMenu = new ContextMenu({ commands });
    this._contextMenu.addItem({
      command: 'add-annotation',
      selector: 'canvas',
      rank: 1
    });
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
      this._renderer.domElement.addEventListener('mouseup', e => {
        this._updateAnnotation({ updateDisplay: 1, updatePosition: true });
        this._onClick.bind(this)(e);
      });
      this._renderer.domElement.addEventListener('mousedown', e => {
        this._updateAnnotation({ updateDisplay: 0 });
      });

      this._renderer.domElement.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();
        this._contextMenu.open(e);
      });

      const controls = new OrbitControls(
        this._camera,
        this._renderer.domElement
      );
      // controls.rotateSpeed = 1.0;
      // controls.zoomSpeed = 1.2;
      // controls.panSpeed = 0.8;
      controls.target.set(
        this._scene.position.x,
        this._scene.position.y,
        this._scene.position.z
      );
      this._controls = controls;

      this._controls.addEventListener('change', () => {
        this._updateAnnotation({ updatePosition: true });

        // Not syncing camera state if following someone else
        if (this._model.localState?.remoteUser) {
          return;
        }

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
        this._postMessage({
          action: WorkerAction.LOAD_FILE,
          payload: {
            fileName: this._context.path,
            content: this._model.getContent()
          }
        });
      }
    }
  };

  private _projectVector = (
    vector: [number, number, number]
  ): [number, number] => {
    const copy = new THREE.Vector3(vector[0], vector[1], vector[2]);
    const canvas = this._renderer.domElement;
    copy.project(this._camera);
    const newCoor: [number, number] = [0, 0];
    newCoor[0] = (0.5 + copy.x / 2) * canvas.width;
    newCoor[1] = (0.5 - copy.y / 2) * canvas.height;
    return newCoor;
  };

  private _updateAnnotation = (options: {
    updatePosition?: boolean;
    updateDisplay?: number;
  }) => {
    Object.keys(this.state.annotations).forEach(key => {
      const el = document.getElementById(key);
      if (el) {
        if (
          options.updatePosition &&
          (el.style.opacity !== '0' || options.updateDisplay !== undefined)
        ) {
          const annotation = this._model.annotationModel.getAnnotation(key);
          let newPos: [number, number] | undefined;
          if (annotation?.position) {
            newPos = this._projectVector(annotation.position);
          } else {
            newPos = [0, 0];
          }
          el.style.top = `${newPos[1]}px`;
          el.style.left = `${newPos[0]}px`;
        }
        if (options.updateDisplay !== undefined) {
          el.style.opacity = options.updateDisplay.toString();
        }
      }
    });
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

    // Update the reflength
    if (this._refLength === null && this._meshGroup.children.length) {
      const boxSizeVec = new THREE.Vector3();
      boundingGroup.getSize(boxSizeVec);

      this._refLength =
        Math.max(boxSizeVec.x, boxSizeVec.y, boxSizeVec.z) / 5 || 1;
      this._updatePointers(this._refLength);
      this._camera.lookAt(this._scene.position);

      this._camera.position.set(
        10 * this._refLength,
        10 * this._refLength,
        10 * this._refLength
      );
      this._camera.far = 200 * this._refLength;
    }

    // Reset reflength if there are no objects
    if (!this._meshGroup.children.length) {
      this._refLength = null;
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

  private _updatePointers(refLength): void {
    this._pointerGeometry = new THREE.SphereGeometry(refLength / 10, 32, 32);

    for (const clientId in this._collaboratorPointers) {
      this._collaboratorPointers[clientId].geometry = this._pointerGeometry;
    }
  }

  private _createPointer(user: User.IIdentity): THREE.Mesh {
    let clientColor: Color.RGBColor | null = null;

    if (user.color?.startsWith('var')) {
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
        ? new THREE.Color(
            clientColor.r / 255,
            clientColor.g / 255,
            clientColor.b / 255
          )
        : 'black'
    });

    return new THREE.Mesh(this._pointerGeometry, material);
  }
  private _onSharedMetadataChanged = (
    _: IJupyterCadDoc,
    changes: MapChange
  ) => {
    const newState = { ...this.state.annotations };
    changes.forEach((val, key) => {
      if (!key.startsWith('annotation')) {
        return;
      }
      const data = this._model.sharedModel.getMetadata(key);
      let open = true;
      if (this.state.firstLoad) {
        open = false;
      }

      if (data && (val.action === 'add' || val.action === 'update')) {
        const jsonData = JSON.parse(data);
        jsonData['open'] = open;
        newState[key] = jsonData;
      } else if (val.action === 'delete') {
        delete newState[key];
      }
    });

    this.setState(old => ({ ...old, annotations: newState, firstLoad: false }));
  };

  private _onClientSharedStateChanged = (
    sender: JupyterCadModel,
    clients: Map<number, IJupyterCadClientState>
  ): void => {
    const remoteUser = this._model.localState?.remoteUser;

    // If we are in following mode, we update our camera and selection
    if (remoteUser) {
      const remoteState = clients.get(remoteUser);
      if (!remoteState) {
        return;
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
      } else {
        this._selectedMesh = null;
      }

      // Sync camera
      const remoteCamera = remoteState.camera;
      if (remoteCamera?.value) {
        const { position, rotation, up } = remoteCamera.value;
        this._camera.position.set(position[0], position[1], position[2]);
        this._camera.rotation.set(rotation[0], rotation[1], rotation[2]);
        this._camera.up.set(up[0], up[1], up[2]);
      }
    } else {
      // If we are unfollowing a remote user, we reset our camera to its old position
      if (this.state.remoteUser !== null) {
        this.setState(old => ({ ...old, remoteUser: null }));
        const camera = this._model.localState?.camera?.value;

        if (camera) {
          const position = camera.position;
          const rotation = camera.rotation;
          const up = camera.up;

          this._camera.position.set(position[0], position[1], position[2]);
          this._camera.rotation.set(rotation[0], rotation[1], rotation[2]);
          this._camera.up.set(up[0], up[1], up[2]);
        }
      }
    }

    // Displaying collaborators pointers
    clients.forEach((clientState, clientId) => {
      const pointerPosition = clientState.pointer?.value;

      if (!this._collaboratorPointers[clientId]) {
        const pointer = this._createPointer(clientState.user);

        this._collaboratorPointers[clientId] = pointer;
        this._scene.add(pointer);
      }

      const collaboratorPointer = this._collaboratorPointers[clientId];

      if (pointerPosition) {
        collaboratorPointer.visible = true;
        collaboratorPointer.position.copy(
          new THREE.Vector3(
            pointerPosition[0],
            pointerPosition[1],
            pointerPosition[2]
          )
        );
      } else {
        collaboratorPointer.visible = false;
      }
    });
  };

  private _onSharedModelChanged(
    sender: JupyterCadModel,
    change: IJupyterCadDocChange
  ): void {
    if (change.objectChange) {
      let visible = false;

      change.objectChange.forEach(change => {
        if (change.key === 'visible') {
          visible = true;
          const obj = this._meshGroup?.getObjectByName(change.name);
          if (obj) {
            obj.visible = change.newValue?.visible ?? false;
          }
        }
      });

      if (!visible) {
        this._postMessage({
          action: WorkerAction.LOAD_FILE,
          payload: {
            fileName: this._context.path,
            content: this._model.getContent()
          }
        });
      }
    }
  }

  private _handleThemeChange = (): void => {
    const lightTheme =
      document.body.getAttribute('data-jp-theme-light') === 'true';
    this.setState(old => ({ ...old, lightTheme }));
  };

  private _handleWindowResize = (): void => {
    clearTimeout(this._resizeTimeout);
    this._resizeTimeout = setTimeout(() => {
      this.forceUpdate();
      this._updateAnnotation({ updatePosition: true });
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
        {Object.entries(this.state.annotations).map(([key, value]) => {
          const initialPosition = this._projectVector(value.position);
          return (
            <div
              key={key}
              id={key}
              style={{
                left: initialPosition[0],
                top: initialPosition[1]
              }}
              className={'jcad-Annotation-Wrapper'}
            >
              <FloatingAnnotation
                itemId={key}
                model={this._model.annotationModel}
                open={value.open}
              />
            </div>
          );
        })}

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
  private _refLength: number | null = null; // Length of bounding box of current object
  private _gridHelper: THREE.GridHelper; // Threejs grid
  private _sceneAxe: (THREE.ArrowHelper | Line2)[]; // Array of  X, Y and Z axe
  private _controls: OrbitControls; // Threejs control
  private _resizeTimeout: any;
  private _collaboratorPointers: IDict<THREE.Mesh>;
  private _pointerGeometry: THREE.SphereGeometry;
  private _contextMenu: ContextMenu;
}
