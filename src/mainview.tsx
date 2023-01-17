import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IObservableMap, ObservableMap } from '@jupyterlab/observables';
import { User } from '@jupyterlab/services';

import { JSONValue } from '@lumino/coreutils';

import * as React from 'react';
import * as Color from 'd3-color';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast
} from 'three-mesh-bvh';

import { v4 as uuid } from 'uuid';
import {
  AxeHelper,
  IDict,
  IDisplayShape,
  IJcadObjectDocChange,
  IJupyterCadClientState,
  IJupyterCadDoc,
  IJupyterCadModel,
  IMainMessage,
  IWorkerMessage,
  MainAction,
  WorkerAction
} from './types';

import { ContextMenu } from '@lumino/widgets';
import { JSONObject } from '@lumino/coreutils';
import { CommandRegistry } from '@lumino/commands';
import { MapChange } from '@jupyter/ydoc';
import { FloatingAnnotation } from './annotation/view';

// Apply the BVH extension
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const DARK_BG_COLOR = 'linear-gradient(rgb(0, 0, 42), rgb(82, 87, 110))';
const LIGHT_BG_COLOR = 'radial-gradient(#efeded, #8f9091)';

const DEFAULT_MESH_COLOR = new THREE.Color('#434442');
const SELECTED_MESH_COLOR = new THREE.Color('#AB5118');

interface IProps {
  view: ObservableMap<JSONValue>;
  context: DocumentRegistry.IContext<IJupyterCadModel>;
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

    this._resizeTimeout = null;
    this.props.view.changed.connect(this._onViewChanged, this);

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
      this._model = this._context.model;
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

      this._model.sharedObjectsChanged.connect(
        this._onSharedObjectsChanged,
        this
      );
      this._model.sharedOptionsChanged.connect(
        this._onSharedOptionsChanged,
        this
      );
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
    this.props.view.changed.disconnect(this._onViewChanged, this);
    this._controls.dispose();
    this._postMessage({
      action: WorkerAction.CLOSE_FILE,
      payload: {
        fileName: this._context.path
      }
    });
    this._model.themeChanged.disconnect(this._handleThemeChange, this);
    this._model.sharedOptionsChanged.disconnect(
      this._onSharedOptionsChanged,
      this
    );
    this._model.sharedObjectsChanged.disconnect(
      this._onSharedObjectsChanged,
      this
    );
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

  sceneSetup = (): void => {
    if (this.divRef.current !== null) {
      this._camera = new THREE.PerspectiveCamera(90, 2, 0.1, 1000);
      this._camera.position.set(8, 8, 8);
      this._camera.up.set(0, 0, 1);

      this._scene = new THREE.Scene();

      this._scene.add(new THREE.AmbientLight(0xffffff, 0.8)); // soft white light

      const light = new THREE.SpotLight(0xffffff, 0.2);
      light.castShadow = true;
      light.shadow.radius = 32;
      light.shadow.mapSize.width = 128;
      light.shadow.mapSize.height = 128;

      this._camera.add(light);

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
      // Find the first intersection with a visible object
      for (const intersect of intersects) {
        if (!intersect.object.visible) {
          continue;
        }

        return {
          mesh: intersect.object as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.MeshBasicMaterial
          >,
          position: intersect.point
        };
      }
    }

    return null;
  }

  startAnimationLoop = (): void => {
    this._requestID = window.requestAnimationFrame(this.startAnimationLoop);

    this._controls.update();

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

    const guidata = this._model.sharedModel.getOption('guidata');

    if (selection) {
      // Deselect old selection
      if (this._selectedMesh) {
        let originalColor = DEFAULT_MESH_COLOR;
        if (
          guidata &&
          guidata[this._selectedMesh.name] &&
          guidata[this._selectedMesh.name]['color']
        ) {
          const rgba = guidata[this._selectedMesh.name]['color'] as number[];
          originalColor = new THREE.Color(rgba[0], rgba[1], rgba[2]);
        }

        this._selectedMesh.material.color = originalColor;
      }

      // Set new selection
      if (selection.mesh === this._selectedMesh) {
        this._selectedMesh = null;
      } else {
        // TODO Support selecting edges?
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
        this._selectedMesh.material.color = SELECTED_MESH_COLOR;
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

    const guidata = this._model.sharedModel.getOption('guidata');

    this._meshGroup = new THREE.Group();
    Object.entries(payload).forEach(([objName, data]) => {
      const { faceList, edgeList } = data;

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

      const objdata = guidata ? guidata[objName] : null;

      let color = DEFAULT_MESH_COLOR;
      let visible = true;
      if (objdata) {
        if (Object.prototype.hasOwnProperty.call(objdata, 'color')) {
          const rgba = objdata['color'] as number[];
          color = new THREE.Color(rgba[0], rgba[1], rgba[2]);
        }
        if (Object.prototype.hasOwnProperty.call(objdata, 'visibility')) {
          visible = objdata['visibility'];
        }
      }

      // Compile the connected vertices and faces into a model
      // And add to the scene
      // We need one material per-mesh because we will set the uniform color independently later
      // it's too bad Three.js does not easily allow setting uniforms independently per-mesh
      const material = new THREE.MeshPhongMaterial({
        color,
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

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.name = objName;
      mesh.visible = visible;

      if (this._selectedMesh?.name === objName) {
        this._selectedMesh = mesh;
        mesh.material.color = SELECTED_MESH_COLOR;
      }

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
        const edgesMesh = new THREE.Line(edgeGeometry, edgeMaterial);
        edgesMesh.name = 'edge';

        mesh.add(edgesMesh);
      });
      if (this._meshGroup) {
        this._meshGroup.add(mesh);
      }
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
    sender: IJupyterCadModel,
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
      const guidata = this._model.sharedModel.getOption('guidata');

      // Deselect old selection
      if (this._selectedMesh) {
        let originalColor = DEFAULT_MESH_COLOR;
        if (
          guidata &&
          guidata[this._selectedMesh.name] &&
          guidata[this._selectedMesh.name]['color']
        ) {
          const rgba = guidata[this._selectedMesh.name]['color'] as number[];
          originalColor = new THREE.Color(rgba[0], rgba[1], rgba[2]);
        }

        this._selectedMesh.material.color = originalColor;
      }

      if (remoteState.selected.value) {
        const selected = this._meshGroup?.getObjectByName(
          remoteState.selected.value
        );
        if (selected) {
          this._selectedMesh = selected as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.MeshBasicMaterial
          >;
          this._selectedMesh.material.color = SELECTED_MESH_COLOR;
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

  private _onSharedObjectsChanged(
    _: IJupyterCadDoc,
    change: IJcadObjectDocChange
  ): void {
    if (change.objectChange) {
      this._postMessage({
        action: WorkerAction.LOAD_FILE,
        payload: {
          fileName: this._context.path,
          content: this._model.getContent()
        }
      });
    }
  }

  private _onSharedOptionsChanged(
    sender: IJupyterCadDoc,
    change: MapChange
  ): void {
    const guidata = sender.getOption('guidata') as JSONObject | undefined;

    if (guidata) {
      for (const objName in guidata) {
        if (
          Object.prototype.hasOwnProperty.call(guidata[objName], 'visibility')
        ) {
          const obj = this._meshGroup?.getObjectByName(objName);
          const objGuiData = guidata[objName];
          if (obj && objGuiData) {
            obj.visible = objGuiData['visibility'];
          }
        }
      }
    }
  }

  private _onViewChanged(
    sender: ObservableMap<JSONValue>,
    change: IObservableMap.IChangedArgs<JSONValue>
  ): void {
    if (change.key === 'axes') {
      this._sceneAxe?.removeFromParent();
      const axe = change.newValue as AxeHelper | undefined;

      if (change.type !== 'remove' && axe && axe.visible) {
        this._sceneAxe = new THREE.AxesHelper(axe.size);
        this._scene.add(this._sceneAxe);
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

  private _context: DocumentRegistry.IContext<IJupyterCadModel>;
  private _model: IJupyterCadModel;
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
  private _sceneAxe: THREE.Object3D | null; // Array of  X, Y and Z axe
  private _controls: OrbitControls; // Threejs control
  private _resizeTimeout: any;
  private _collaboratorPointers: IDict<THREE.Mesh>;
  private _pointerGeometry: THREE.SphereGeometry;
  private _contextMenu: ContextMenu;
}
