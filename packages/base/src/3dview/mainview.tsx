import { MapChange } from '@jupyter/ydoc';
import {
  IAnnotation,
  IDict,
  IDisplayShape,
  IJupyterCadClientState,
  IJupyterCadDoc,
  IJupyterCadModel,
  IPostOperatorInput,
  IPostResult,
  ISelection
} from '@jupytercad/schema';
import { IObservableMap, ObservableMap } from '@jupyterlab/observables';
import { User } from '@jupyterlab/services';
import { CommandRegistry } from '@lumino/commands';
import { JSONValue } from '@lumino/coreutils';
import { ContextMenu } from '@lumino/widgets';
import * as Color from 'd3-color';
import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper';

import { FloatingAnnotation } from '../annotation';
import { getCSSVariableColor, throttle } from '../tools';
import {
  AxeHelper,
  CameraSettings,
  ClipSettings,
  ExplodedView
} from '../types';
import { FollowIndicator } from './followindicator';
import {
  BasicMesh,
  DEFAULT_EDGE_COLOR,
  DEFAULT_EDGE_COLOR_CSS,
  DEFAULT_LINEWIDTH,
  DEFAULT_MESH_COLOR,
  DEFAULT_MESH_COLOR_CSS,
  IPickedResult,
  IPointer,
  SELECTED_LINEWIDTH,
  BOUNDING_BOX_COLOR,
  BOUNDING_BOX_COLOR_CSS,
  SELECTION_BOUNDING_BOX,
  buildShape,
  computeExplodedState,
  projectVector,
  IMouseDrag
} from './helpers';
import { MainViewModel } from './mainviewmodel';
import { Spinner } from './spinner';
interface IProps {
  viewModel: MainViewModel;
}

const CAMERA_NEAR = 1e-6;
const CAMERA_FAR = 1e27;

// The amount of pixels a mouse move can do until we stop considering it's a click
const CLICK_THRESHOLD = 5;

interface IStates {
  id: string; // ID of the component, it is used to identify which component
  //is the source of awareness updates.
  loading: boolean;
  remoteUser?: User.IIdentity | null;
  annotations: IDict<IAnnotation>;
  firstLoad: boolean;
  wireframe: boolean;
}

interface ILineIntersection extends THREE.Intersection {
  pointOnLine?: THREE.Vector3;
}

export class MainView extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setDrawRange(0, 3 * 10000);

    this._mainViewModel = this.props.viewModel;
    this._mainViewModel.viewSettingChanged.connect(this._onViewChanged, this);
    this._model = this._mainViewModel.jcadModel;
    this._pointer = new THREE.Vector2();
    this._collaboratorPointers = {};
    this._model.themeChanged.connect(this._handleThemeChange, this);

    this._mainViewModel.jcadModel.sharedOptionsChanged.connect(
      this._onSharedOptionsChanged,
      this
    );
    this._mainViewModel.jcadModel.clientStateChanged.connect(
      this._onClientSharedStateChanged,
      this
    );
    this._mainViewModel.jcadModel.sharedMetadataChanged.connect(
      this._onSharedMetadataChanged,
      this
    );
    this._mainViewModel.renderSignal.connect(this._requestRender, this);
    this._mainViewModel.workerBusy.connect(this._workerBusyHandler, this);

    this._raycaster.params.Line2 = { threshold: 50 };

    this.state = {
      id: this._mainViewModel.id,
      loading: true,
      annotations: {},
      firstLoad: true,
      wireframe: false
    };
  }

  componentDidMount(): void {
    window.addEventListener('resize', this._handleWindowResize);
    this.generateScene();
    this.addContextMenu();
    this._mainViewModel.initWorker();
    this._mainViewModel.initSignal();
    window.addEventListener('jupytercadObjectSelection', (e: Event) => {
      const customEvent = e as CustomEvent;

      if (customEvent.detail.mainViewModelId === this._mainViewModel.id) {
        this.lookAtPosition(customEvent.detail.objPosition);
      }
    });
  }

  componentDidUpdate(oldProps: IProps, oldState: IStates): void {
    this.resizeCanvasToDisplaySize();
  }

  componentWillUnmount(): void {
    window.cancelAnimationFrame(this._requestID);
    window.removeEventListener('resize', this._handleWindowResize);
    this._mainViewModel.viewSettingChanged.disconnect(
      this._onViewChanged,
      this
    );
    this._controls.dispose();

    this._model.themeChanged.disconnect(this._handleThemeChange, this);
    this._model.sharedOptionsChanged.disconnect(
      this._onSharedOptionsChanged,
      this
    );

    this._mainViewModel.jcadModel.clientStateChanged.disconnect(
      this._onClientSharedStateChanged,
      this
    );
    this._mainViewModel.jcadModel.sharedMetadataChanged.disconnect(
      this._onSharedMetadataChanged,
      this
    );

    this._mainViewModel.renderSignal.disconnect(this._requestRender, this);
    this._mainViewModel.workerBusy.disconnect(this._workerBusyHandler, this);
    this._mainViewModel.dispose();
  }

  addContextMenu = (): void => {
    const commands = new CommandRegistry();
    commands.addCommand('add-annotation', {
      execute: () => {
        if (!this._pointer3D) {
          return;
        }

        const position = new THREE.Vector3().copy(
          this._pointer3D.mesh.position
        );

        // If in exploded view, we scale down to the initial position (to before exploding the view)
        if (this._explodedView.enabled) {
          const explodedState = computeExplodedState({
            mesh: this._pointer3D.mesh,
            boundingGroup: this._boundingGroup,
            factor: this._explodedView.factor
          });

          position.add(
            explodedState.vector.multiplyScalar(-explodedState.distance)
          );
        }

        this._mainViewModel.addAnnotation({
          position: [position.x, position.y, position.z],
          label: 'New annotation',
          contents: [],
          parent: this._pointer3D.parent.name
        });
      },
      label: 'Add annotation',
      isEnabled: () => {
        return !!this._pointer3D;
      }
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
      DEFAULT_MESH_COLOR.set(getCSSVariableColor(DEFAULT_MESH_COLOR_CSS));
      DEFAULT_EDGE_COLOR.set(getCSSVariableColor(DEFAULT_EDGE_COLOR_CSS));
      BOUNDING_BOX_COLOR.set(getCSSVariableColor(BOUNDING_BOX_COLOR_CSS));

      this._camera = new THREE.PerspectiveCamera(
        50,
        2,
        CAMERA_NEAR,
        CAMERA_FAR
      );
      this._camera.position.set(8, 8, 8);
      this._camera.up.set(0, 0, 1);

      this._scene = new THREE.Scene();

      this._scene.add(new THREE.AmbientLight(0xffffff, 0.5)); // soft white light

      this._cameraLight = new THREE.PointLight(0xffffff, 1);
      this._cameraLight.decay = 0;

      this._camera.add(this._cameraLight);

      this._scene.add(this._camera);

      this._renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        stencil: true,
        logarithmicDepthBuffer: true
      });

      this._clock = new THREE.Clock();
      // this._renderer.setPixelRatio(window.devicePixelRatio);
      this._renderer.autoClear = false;
      this._renderer.setClearColor(0x000000, 0);
      this._renderer.setSize(500, 500, false);
      this.divRef.current.appendChild(this._renderer.domElement); // mount using React ref

      this._syncPointer = throttle(
        (position: THREE.Vector3 | undefined, parent: string | undefined) => {
          if (position && parent) {
            this._model.syncPointer({
              parent,
              x: position.x,
              y: position.y,
              z: position.z
            });
          } else {
            this._model.syncPointer(undefined);
          }
        },
        100
      );
      this._renderer.domElement.addEventListener(
        'pointermove',
        this._onPointerMove.bind(this)
      );

      this._renderer.domElement.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();
        this._contextMenu.open(e);
      });

      document.addEventListener('keydown', e => {
        this._onKeyDown(e);
      });

      this._controls = new OrbitControls(
        this._camera,
        this._renderer.domElement
      );

      this._controls.target.set(
        this._scene.position.x,
        this._scene.position.y,
        this._scene.position.z
      );
      this._controls.enableDamping = true;
      this._controls.dampingFactor = 0.15;

      this._renderer.domElement.addEventListener('mousedown', e => {
        this._mouseDrag.start.set(e.clientX, e.clientY);
      });

      this._renderer.domElement.addEventListener('mouseup', e => {
        this._mouseDrag.end.set(e.clientX, e.clientY);
        const distance = this._mouseDrag.end.distanceTo(this._mouseDrag.start);

        if (distance <= CLICK_THRESHOLD) {
          this._onClick(e);
        }
      });

      this._controls.addEventListener('change', () => {
        this._updateAnnotation();
      });

      this._controls.addEventListener(
        'change',
        throttle(() => {
          // Not syncing camera state if following someone else
          if (this._model.localState?.remoteUser) {
            return;
          }

          this._model.syncCamera(
            {
              position: this._camera.position.toArray([]),
              rotation: [
                this._camera.rotation.x,
                this._camera.rotation.y,
                this._camera.rotation.z
              ],
              up: this._camera.up.toArray([])
            },
            this._mainViewModel.id
          );
        }, 100)
      );

      // Setting up the clip plane transform controls
      this._clipPlaneTransformControls = new TransformControls(
        this._camera,
        this._renderer.domElement
      );

      // Create half transparent plane mesh for controls
      this._clippingPlaneMeshControl = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          color: DEFAULT_MESH_COLOR,
          opacity: 0.2,
          transparent: true,
          side: THREE.DoubleSide
        })
      );
      this._clippingPlaneMeshControl.visible = false;

      // Setting the fake plane position
      const target = new THREE.Vector3(0, 0, 1);
      this._clippingPlane.coplanarPoint(target);
      this._clippingPlaneMeshControl.geometry.translate(
        target.x,
        target.y,
        target.z
      );
      this._clippingPlaneMeshControl.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        this._clippingPlane.normal
      );

      this._scene.add(this._clippingPlaneMeshControl);

      // Disable the orbit control whenever we do transformation
      this._clipPlaneTransformControls.addEventListener(
        'dragging-changed',
        event => {
          this._controls.enabled = !event.value;
        }
      );

      // Update the clipping plane whenever the transform UI move
      this._clipPlaneTransformControls.addEventListener('change', () => {
        let normal = new THREE.Vector3(0, 0, 1);
        normal = normal.applyEuler(this._clippingPlaneMeshControl.rotation);

        // This is to prevent z-fighting
        // We can't use the WebGL polygonOffset because of the logarithmic depth buffer
        // Long term, when using the new WebGPURenderer, we could update the formula of the
        // logarithmic depth computation to emulate the polygonOffset in the shaders directly
        // refLength divided by 1000 looks like it's working fine to emulate a polygonOffset for now
        const translation = this._refLength ? 0.001 * this._refLength : 0;

        this._clippingPlane.setFromNormalAndCoplanarPoint(
          normal,
          this._clippingPlaneMeshControl.position
        );
        this._clippingPlane.translate(
          normal.multiply(
            new THREE.Vector3(translation, translation, translation)
          )
        );
      });

      this._clipPlaneTransformControls.attach(this._clippingPlaneMeshControl);
      this._scene.add(this._clipPlaneTransformControls);

      this._clipPlaneTransformControls.enabled = false;
      this._clipPlaneTransformControls.visible = false;

      this._transformControls = new TransformControls(
        this._camera,
        this._renderer.domElement
      );
      // Disable the orbit control whenever we do transformation
      this._transformControls.addEventListener('dragging-changed', event => {
        this._controls.enabled = !event.value;
      });
      // Update the currently transformed object in the shared model once finished moving
      this._transformControls.addEventListener('mouseUp', () => {
        if (!this._currentTransformed) {
          return;
        }

        const objectName = this._currentTransformed.name.replace('-group', '');

        const updatedPosition = new THREE.Vector3();
        this._pivot.getWorldPosition(updatedPosition);
        const updatedAxis = new THREE.Vector3(
          this._pivot.rotation.x,
          this._pivot.rotation.y,
          this._pivot.rotation.z
        ).normalize();
        const updatedAngle = new THREE.Vector3(
          this._pivot.rotation.x,
          this._pivot.rotation.y,
          this._pivot.rotation.z
        ).length();

        const obj = this._model.sharedModel.getObjectByName(objectName);

        if (obj && obj.parameters && obj.parameters.Placement) {
            const newPosition = [
              updatedPosition.x,
              updatedPosition.y,
              updatedPosition.z
            ];

            const newAxis = updatedAngle === 0 ? [0, 0, 1] : [updatedAxis.x, updatedAxis.y, updatedAxis.z];

            console.log('update position', newPosition, newAxis, THREE.MathUtils.radToDeg(updatedAngle));

            this._mainViewModel.maybeUpdateObjectParameters(objectName, {
              ...obj.parameters,
              Placement: {
                ...obj.parameters.Placement,
                Position: newPosition,
                Axis: newAxis,
                Angle: THREE.MathUtils.radToDeg(updatedAngle)
              }
            });
        }
      });
      this._scene.add(this._transformControls);
      this._transformControls.setMode('translate');
      this._transformControls.enabled = false;
      this._transformControls.visible = false;
      const pivotHelper = new THREE.AxesHelper(10);
      this._scene.add(this._pivot);
      this._pivot.add(pivotHelper);
      this._transformControls.attach(this._pivot);

      this._createViewHelper();
    }
  };

  private _createViewHelper() {
    // Remove the existing ViewHelperDiv if it already exists
    if (
      this._viewHelperDiv &&
      this.divRef.current?.contains(this._viewHelperDiv)
    ) {
      this.divRef.current.removeChild(this._viewHelperDiv);
    }

    // Create new ViewHelper
    this._viewHelper = new ViewHelper(this._camera, this._renderer.domElement);
    this._viewHelper.center = this._controls.target;

    const viewHelperDiv = document.createElement('div');
    viewHelperDiv.style.position = 'absolute';
    viewHelperDiv.style.right = '0px';
    viewHelperDiv.style.bottom = '0px';
    viewHelperDiv.style.height = '128px';
    viewHelperDiv.style.width = '128px';

    this._viewHelperDiv = viewHelperDiv;

    this.divRef.current?.appendChild(this._viewHelperDiv);

    this._viewHelperDiv.addEventListener('pointerup', event =>
      this._viewHelper.handleClick(event)
    );
  }

  animate = (): void => {
    this._requestID = window.requestAnimationFrame(this.animate);
    const delta = this._clock.getDelta();

    for (const material of this._edgeMaterials) {
      material.resolution.set(
        this._renderer.domElement.width,
        this._renderer.domElement.height
      );
    }

    if (this._clippingPlaneMesh !== null) {
      this._clippingPlane.coplanarPoint(this._clippingPlaneMesh.position);
      this._clippingPlaneMesh.lookAt(
        this._clippingPlaneMesh.position.x - this._clippingPlane.normal.x,
        this._clippingPlaneMesh.position.y - this._clippingPlane.normal.y,
        this._clippingPlaneMesh.position.z - this._clippingPlane.normal.z
      );
    }
    if (this._viewHelper.animating) {
      this._viewHelper.update(delta);
    }

    this._controls.update();
    this._renderer.setRenderTarget(null);
    this._renderer.clear();
    this._renderer.render(this._scene, this._camera);
    this._viewHelper.render(this._renderer);
    this.updateCameraRotation();
  };

  resizeCanvasToDisplaySize = (): void => {
    if (this.divRef.current !== null) {
      this._renderer.setSize(
        this.divRef.current.clientWidth,
        this.divRef.current.clientHeight,
        false
      );
      if (this._camera instanceof THREE.PerspectiveCamera) {
        this._camera.aspect =
          this.divRef.current.clientWidth / this.divRef.current.clientHeight;
      } else if (this._camera instanceof THREE.OrthographicCamera) {
        this._camera.left = this.divRef.current.clientWidth / -2;
        this._camera.right = this.divRef.current.clientWidth / 2;
        this._camera.top = this.divRef.current.clientHeight / 2;
        this._camera.bottom = this.divRef.current.clientHeight / -2;
      }
      this._camera.updateProjectionMatrix();
    }
  };

  generateScene = (): void => {
    this.sceneSetup();
    this.animate();
    this.resizeCanvasToDisplaySize();
  };

  private lookAtPosition(
    position: { x: number; y: number; z: number } | [number, number, number]
  ) {
    this._targetPosition = new THREE.Vector3(
      position[0],
      position[1],
      position[2]
    );
  }

  private updateCameraRotation() {
    if (this._targetPosition && this._camera && this._controls) {
      const currentTarget = this._controls.target.clone();
      const rotationSpeed = 0.1;
      currentTarget.lerp(this._targetPosition, rotationSpeed);
      this._controls.target.copy(currentTarget);

      if (currentTarget.distanceTo(this._targetPosition) < 0.01) {
        this._targetPosition = null;
      }

      this._controls.update();
    }
  }

  private _updateAnnotation() {
    Object.keys(this.state.annotations).forEach(key => {
      const el = document.getElementById(key);
      if (el) {
        const annotation = this._model.annotationModel?.getAnnotation(key);
        let screenPosition = new THREE.Vector2();
        if (annotation) {
          screenPosition = this._computeAnnotationPosition(annotation);
        }
        el.style.left = `${Math.round(screenPosition.x)}px`;
        el.style.top = `${Math.round(screenPosition.y)}px`;
      }
    });
  }

  private _onPointerMove(e: MouseEvent) {
    const rect = this._renderer.domElement.getBoundingClientRect();

    this._pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const picked = this._pick();

    // Update our 3D pointer locally so there is no visual latency in the local pointer movement
    if (!this._pointer3D && this._model.localState && picked) {
      this._pointer3D = {
        parent: picked.mesh,
        mesh: this._createPointer(this._model.localState.user)
      };
      this._scene.add(this._pointer3D.mesh);
    }

    if (picked) {
      if (!this._pointer3D) {
        this._syncPointer(undefined, undefined);
        return;
      }

      this._pointer3D.mesh.visible = true;
      this._pointer3D.mesh.position.copy(picked.position);
      this._pointer3D.parent = picked.mesh;

      // If in exploded view, we scale down to the initial position (to before exploding the view)
      if (this._explodedView.enabled) {
        const explodedState = computeExplodedState({
          mesh: this._pointer3D.parent,
          boundingGroup: this._boundingGroup,
          factor: this._explodedView.factor
        });

        picked.position.add(
          explodedState.vector.multiplyScalar(-explodedState.distance)
        );
      }

      // If clipping is enabled and picked position is hidden
      this._syncPointer(picked.position, picked.mesh.name);
    } else {
      if (this._pointer3D) {
        this._pointer3D.mesh.visible = false;
      }
      this._syncPointer(undefined, undefined);
    }
  }

  private _pick(): IPickedResult | null {
    if (this._meshGroup === null || !this._meshGroup.children) {
      return null;
    }

    this._raycaster.setFromCamera(this._pointer, this._camera);

    const intersects = this._raycaster.intersectObjects(
      this._meshGroup.children
    );

    if (intersects.length > 0) {
      // Find the first intersection with a visible object
      for (const intersect of intersects as ILineIntersection[]) {
        // Object is hidden or a bounding box
        if (
          !intersect.object.visible ||
          !intersect.object.parent?.visible ||
          intersect.object.name === SELECTION_BOUNDING_BOX
        ) {
          continue;
        }

        // Object is clipped
        const planePoint = new THREE.Vector3();
        this._clippingPlane.coplanarPoint(planePoint);
        planePoint.sub(intersect.point);

        if (
          this._clipSettings.enabled &&
          planePoint.dot(this._clippingPlane.normal) > 0
        ) {
          continue;
        }
        let intersectMesh = intersect.object;
        if (intersect.object.name.includes('-front')) {
          intersectMesh = intersect.object.parent.getObjectByName(
            intersect.object.name.replace('-front', '')
          )!;
        }
        if (intersect.object.name.includes('-back')) {
          intersectMesh = intersect.object.parent.getObjectByName(
            intersect.object.name.replace('-back', '')
          )!;
        }
        return {
          mesh: intersectMesh as BasicMesh,
          position: intersect.pointOnLine ?? intersect.point
        };
      }
    }

    return null;
  }

  private _onClick(e: MouseEvent) {
    const selection = this._pick();
    const selectedMeshesNames = new Set(
      this._selectedMeshes.map(sel => sel.name)
    );
    if (selection) {
      const selectionName = selection.mesh.name;
      if (e.ctrlKey) {
        if (selectedMeshesNames.has(selectionName)) {
          selectedMeshesNames.delete(selectionName);
        } else {
          selectedMeshesNames.add(selectionName);
        }
      } else {
        const alreadySelected = selectedMeshesNames.has(selectionName);
        selectedMeshesNames.clear();

        if (!alreadySelected) {
          selectedMeshesNames.add(selectionName);
        }
      }

      const names = Array.from(selectedMeshesNames);

      const newSelection: { [key: string]: ISelection } = {};
      for (const name of names) {
        newSelection[name] = this._meshGroup?.getObjectByName(name)
          ?.userData as ISelection;
      }
      this._updateSelected(newSelection);
      this._model.syncSelected(newSelection, this._mainViewModel.id);
    } else {
      this._updateSelected({});
      this._model.syncSelected({}, this._mainViewModel.id);
    }
  }

  private _onKeyDown(event: KeyboardEvent) {
    // TODO Make these Lumino commands? Or not?
    if (this._clipSettings.enabled || this._transformControls.enabled) {
      const toggleMode = (control: any) => {
        control.setMode(control.mode === 'rotate' ? 'translate' : 'rotate');
      };

      if (event.key === 'r' && this._clipSettings.enabled) {
        event.preventDefault();
        event.stopPropagation();
        toggleMode(this._clipPlaneTransformControls);
      }

      if (event.key === 't' && this._transformControls.enabled) {
        event.preventDefault();
        event.stopPropagation();
        toggleMode(this._transformControls);
      }
    }
  }

  private _shapeToMesh = (payload: IDisplayShape['payload']['result']) => {
    if (this._meshGroup !== null) {
      this._scene.remove(this._meshGroup);
    }
    if (this._explodedViewLinesHelperGroup !== null) {
      this._scene.remove(this._explodedViewLinesHelperGroup);
    }
    if (this._clippingPlaneMesh !== null) {
      this._scene.remove(this._clippingPlaneMesh);
    }

    const selectedNames = this._selectedMeshes.map(sel => sel.name);
    this._selectedMeshes = [];

    this._boundingGroup = new THREE.Box3();

    this._edgeMaterials = [];

    this._meshGroup = new THREE.Group();

    Object.entries(payload).forEach(([objName, data]) => {
      const selected = selectedNames.includes(objName);
      const obj = this._model.sharedModel.getObjectByName(objName);
      const objColor = obj?.parameters?.Color;
      const isWireframe = this.state.wireframe;

      // TODO Have a more generic way to spot non-solid objects
      const isSolid = !(
        obj?.shape === 'Part::Extrusion' && !obj?.parameters?.['Solid']
      );

      const output = buildShape({
        objName,
        data,
        clippingPlanes: this._clippingPlanes,
        isSolid,
        isWireframe,
        objColor
      });

      if (output) {
        const { meshGroup, mainMesh, edgesMeshes } = output;
        if (meshGroup.visible) {
          this._boundingGroup.expandByObject(mainMesh);
        }

        // Save original color for the main mesh
        if (mainMesh.material?.color) {
          const originalMeshColor = new THREE.Color(
            objColor || DEFAULT_MESH_COLOR
          );
          if (!selected) {
            mainMesh.material.color = originalMeshColor;
          }
          mainMesh.userData.originalColor = originalMeshColor.clone();
        }

        if (selected) {
          const boundingBox = meshGroup?.getObjectByName(
            SELECTION_BOUNDING_BOX
          ) as THREE.Mesh;
          if (boundingBox) {
            boundingBox.visible = true;
          }

          this._selectedMeshes.push(mainMesh);
        }
        edgesMeshes.forEach(el => {
          this._edgeMaterials.push(el.material);
          const meshColor = new THREE.Color(objColor);
          const luminance =
            0.2126 * meshColor.r + 0.7152 * meshColor.g + 0.0722 * meshColor.b;

          let originalEdgeColor;

          // Handling edge color based upon mesh luminance
          if (luminance >= 0 && luminance <= 0.05) {
            originalEdgeColor = new THREE.Color(0.2, 0.2, 0.2);
          } else if (luminance < 0.1) {
            const scaleFactor = 3 + (0.1 - luminance) * 3;
            originalEdgeColor = meshColor.clone().multiplyScalar(scaleFactor);
          } else if (luminance < 0.5) {
            const scaleFactor = 1.3 + (0.5 - luminance) * 1.3;
            originalEdgeColor = meshColor.clone().multiplyScalar(scaleFactor);
          } else {
            const scaleFactor = 0.7 - (luminance - 0.5) * 0.3;
            originalEdgeColor = meshColor.clone().multiplyScalar(scaleFactor);
          }

          if (selectedNames.includes(el.name)) {
            this._selectedMeshes.push(el as any as BasicMesh);
            el.material.color = BOUNDING_BOX_COLOR;
            el.material.linewidth = SELECTED_LINEWIDTH;
            el.userData.originalColor = originalEdgeColor.clone();
          } else {
            if (objColor && el.material?.color) {
              el.material.color = originalEdgeColor;
              el.material.linewidth = DEFAULT_LINEWIDTH;
              el.userData.originalColor = originalEdgeColor.clone();
            }
          }
        });
        this._meshGroup?.add(meshGroup);
      }

      this._updateTransformControls(selectedNames);
    });

    // Update the reflength.
    this._updateRefLength(this._refLength === null);
    // Set the expoded view if it's enabled
    this._setupExplodedView();

    // Clip plane rendering
    const planeGeom = new THREE.PlaneGeometry(
      this._refLength! * 1000, // *1000 is a bit arbitrary and extreme but that does not impact performance or anything
      this._refLength! * 1000
    );
    const planeMat = new THREE.MeshPhongMaterial({
      color: DEFAULT_EDGE_COLOR,
      stencilWrite: true,
      stencilRef: 0,
      stencilFunc: THREE.NotEqualStencilFunc,
      stencilFail: THREE.ReplaceStencilOp,
      stencilZFail: THREE.ReplaceStencilOp,
      stencilZPass: THREE.ReplaceStencilOp,
      side: THREE.DoubleSide,
      wireframe: this.state.wireframe
    });
    this._clippingPlaneMesh = new THREE.Mesh(planeGeom, planeMat);
    this._clippingPlaneMesh.visible = this._clipSettings.enabled;
    this._clippingPlaneMesh.onAfterRender = renderer => {
      renderer.clearStencil();
    };

    this._scene.add(this._clippingPlaneMesh);
    this._scene.add(this._meshGroup);

    if (this._loadingTimeout) {
      clearTimeout(this._loadingTimeout);
      this._loadingTimeout = null;
    }
    this.setState(old => ({ ...old, loading: false }));
  };

  private _updateRefLength(updateCamera = false): void {
    if (this._meshGroup && this._meshGroup.children.length) {
      const boxSizeVec = new THREE.Vector3();
      this._boundingGroup.getSize(boxSizeVec);

      this._refLength =
        Math.max(boxSizeVec.x, boxSizeVec.y, boxSizeVec.z) / 5 || 1;
      this._updatePointersScale(this._refLength);

      if (updateCamera) {
        this._camera.lookAt(this._scene.position);

        this._camera.position.set(
          10 * this._refLength,
          10 * this._refLength,
          10 * this._refLength
        );
      }

      // Update clip plane size
      this._clippingPlaneMeshControl.geometry = new THREE.PlaneGeometry(
        this._refLength * 10,
        this._refLength * 10
      );
    } else {
      this._refLength = null;
    }
  }

  private async _objToMesh(
    name: string,
    postResult: IPostResult
  ): Promise<void> {
    const { binary, format, value } = postResult;
    let obj: THREE.BufferGeometry | undefined = undefined;
    if (format === 'STL') {
      let buff: string | ArrayBuffer;
      if (binary) {
        const str = `data:application/octet-stream;base64,${value}`;
        const b = await fetch(str);
        buff = await b.arrayBuffer();
      } else {
        buff = value;
      }
      const loader = new STLLoader();
      obj = loader.parse(buff);
    }

    if (!obj) {
      return;
    }

    const material = new THREE.MeshPhongMaterial({
      color: DEFAULT_MESH_COLOR,
      wireframe: this.state.wireframe
    });
    const mesh = new THREE.Mesh(obj, material);

    const lineGeo = new THREE.WireframeGeometry(mesh.geometry);
    const mat = new THREE.LineBasicMaterial({ color: 'black' });
    const wireframe = new THREE.LineSegments(lineGeo, mat);
    mesh.add(wireframe);
    mesh.name = name;
    mesh.visible = true;
    if (this._meshGroup) {
      this._meshGroup.add(mesh);
      this._boundingGroup?.expandByObject(mesh);
    }
    this._updateRefLength(true);
  }

  private _workerBusyHandler(_: MainViewModel, busy: boolean) {
    if (this._loadingTimeout) {
      clearTimeout(this._loadingTimeout);
    }
    if (busy) {
      this._loadingTimeout = setTimeout(() => {
        // Do not show loading animation for the first 250
        this.setState(old => ({ ...old, loading: true }));
      }, 250);
    } else {
      this.setState(old => ({ ...old, loading: false }));
    }
  }
  private async _requestRender(
    sender: MainViewModel,
    renderData: {
      shapes: any;
      postShapes?: IDict<IPostResult> | null;
      postResult?: IDict<IPostOperatorInput>;
    }
  ) {
    const { shapes, postShapes, postResult } = renderData;
    if (shapes !== null && shapes !== undefined) {
      this._shapeToMesh(shapes);
      const options = {
        binary: true,
        onlyVisible: false
      };

      if (postResult && this._meshGroup) {
        const exporter = new GLTFExporter();
        const promises: Promise<void>[] = [];
        Object.values(postResult).forEach(pos => {
          const objName = pos.jcObject.parameters?.['Object'];
          if (!objName) {
            return;
          }
          const threeShape = this._meshGroup!.getObjectByName(
            `${objName}-group`
          );
          if (!threeShape) {
            return;
          }
          const promise = new Promise<void>(resolve => {
            exporter.parse(
              threeShape,
              exported => {
                pos.postShape = exported as any;
                resolve();
              },
              () => {
                // Intentionally empty: no error handling needed for this case
              }, // Empty function to handle errors
              options
            );
          });
          promises.push(promise);
        });

        await Promise.all(promises);
        this._mainViewModel.sendRawGeometryToWorker(postResult);
      }
    }
    if (postShapes !== null && postShapes !== undefined) {
      Object.entries(postShapes).forEach(([objName, postResult]) => {
        this._objToMesh(objName, postResult as any);
      });
    }

    const localState = this._model.localState;

    if (localState?.selected?.value) {
      this._updateSelected(localState.selected.value);
    }
  }

  private _updatePointersScale(refLength): void {
    this._pointer3D?.mesh.scale.set(
      refLength / 10,
      refLength / 10,
      refLength / 10
    );

    for (const clientId in this._collaboratorPointers) {
      this._collaboratorPointers[clientId].mesh.scale.set(
        refLength / 10,
        refLength / 10,
        refLength / 10
      );
    }
  }

  private _createPointer(user?: User.IIdentity): BasicMesh {
    let clientColor: Color.RGBColor | null = null;

    if (user?.color?.startsWith('var')) {
      clientColor = Color.color(
        getComputedStyle(document.documentElement).getPropertyValue(
          user.color.slice(4, -1)
        )
      ) as Color.RGBColor;
    } else {
      clientColor = Color.color(user?.color ?? 'steelblue') as Color.RGBColor;
    }

    const geometry = new THREE.SphereGeometry(1, 32, 32);

    const material = new THREE.MeshBasicMaterial({
      color: clientColor
        ? new THREE.Color(
            clientColor.r / 255,
            clientColor.g / 255,
            clientColor.b / 255
          )
        : 'black'
    });

    const mesh = new THREE.Mesh(geometry, material);
    if (this._refLength) {
      mesh.scale.set(
        this._refLength / 10,
        this._refLength / 10,
        this._refLength / 10
      );
    }
    return mesh;
  }

  private _updateSelected(selection: { [key: string]: ISelection }) {
    const selectionChanged =
      JSON.stringify(selection) !== JSON.stringify(this._previousSelection);

    if (!selectionChanged) {
      return;
    }
    this._previousSelection = { ...selection };

    // Reset original color and remove bounding boxes for old selection
    for (const selectedMesh of this._selectedMeshes) {
      let originalColor = selectedMesh.userData.originalColor;

      if (!originalColor) {
        originalColor = selectedMesh.material.color.clone();
        selectedMesh.userData.originalColor = originalColor;
      }
      if (selectedMesh.material?.color) {
        selectedMesh.material.color = originalColor;
      }

      const parentGroup = this._meshGroup?.getObjectByName(
        selectedMesh.name
      )?.parent;
      const boundingBox = parentGroup?.getObjectByName(
        SELECTION_BOUNDING_BOX
      ) as THREE.Mesh;
      if (boundingBox) {
        boundingBox.visible = false;
      }

      const material = selectedMesh.material as THREE.Material & {
        linewidth?: number;
      };
      if (material?.linewidth) {
        material.linewidth = DEFAULT_LINEWIDTH;
      }
    }

    // Set new selection
    this._selectedMeshes = [];
    const selectedNames = Object.keys(selection);

    for (const selectionName of selectedNames) {
      const selectedMesh = this._meshGroup?.getObjectByName(
        selectionName
      ) as BasicMesh;

      if (!selectedMesh || !selectedMesh.visible) {
        continue;
      }

      if (selectedMesh.name.startsWith('edge')) {
        // Highlight edges using the old method
        if (!selectedMesh.userData.originalColor) {
          selectedMesh.userData.originalColor =
            selectedMesh.material.color.clone();
        }

        this._selectedMeshes.push(selectedMesh);
        if (selectedMesh?.material?.color) {
          selectedMesh.material.color = BOUNDING_BOX_COLOR;
        }

        const material = selectedMesh.material as THREE.Material & {
          linewidth?: number;
        };
        if (material?.linewidth) {
          material.linewidth = SELECTED_LINEWIDTH;
        }
      } else {
        // Highlight non-edges using a bounding box
        this._selectedMeshes.push(selectedMesh);

        const parentGroup = this._meshGroup?.getObjectByName(
          selectedMesh.name
        )?.parent;
        const boundingBox = parentGroup?.getObjectByName(
          SELECTION_BOUNDING_BOX
        ) as THREE.Mesh;

        if (boundingBox) {
          boundingBox.visible = true;
        }
      }
    }

    this._updateTransformControls(selectedNames);
  }

  private _pivot = new THREE.Object3D();

  /*
   * Attach the transform controls to the current selection, or detach it
   */
  private _updateTransformControls(selection: string[]) {
    if (selection.length === 1) {
      const selectedMeshName = selection[0];
      this._matchingChild = this._meshGroup?.children.find(child =>
        child.name.startsWith(selectedMeshName)
      );
      this._currentTransformed = this._matchingChild;

      if (this._currentTransformed) {
        // this._transformControls.attach(this._currentTransformed as BasicMesh);

        const obj = this._model.sharedModel.getObjectByName(selectedMeshName);
        const positionArray = obj?.parameters?.Placement?.Position;
        const angle = obj?.parameters?.Placement?.Angle;
        const axis = obj?.parameters?.Placement?.Axis;

        if (positionArray && positionArray.length === 3) {
          const position = new THREE.Vector3(
            positionArray[0],
            positionArray[1],
            positionArray[2]
          );
          const rotation = new THREE.Vector3(
            axis[0],
            axis[1],
            axis[2]
          ).multiplyScalar(THREE.MathUtils.degToRad(angle));

          // this._transformControls.position.copy(position);
          // this._transformControls.rotation.setFromVector3(rotation);
          this._pivot.rotation.setFromVector3(rotation);
          this._pivot.position.copy(position);

          this._transformControls.visible = true;
          this._transformControls.enabled = true;
          return;
        }
      }
    }

    // Detach TransformControls from the previous selection
    // this._transformControls.detach();

    this._transformControls.visible = false;
    this._transformControls.enabled = false;
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
      if (remoteState.selected?.value) {
        this._updateSelected(remoteState.selected.value);
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

      // Sync local selection if needed
      const localState = this._model.localState;

      if (localState?.selected?.value) {
        this._updateSelected(localState.selected.value);
      }
    }

    // Displaying collaborators pointers
    clients.forEach((clientState, clientId) => {
      const pointer = clientState.pointer?.value;

      // We already display our own cursor on mouse move
      if (this._model.getClientId() === clientId) {
        return;
      }

      let collaboratorPointer = this._collaboratorPointers[clientId];

      if (pointer) {
        const parent = this._meshGroup?.getObjectByName(
          pointer.parent
        ) as BasicMesh;

        if (!collaboratorPointer) {
          const mesh = this._createPointer(clientState.user);

          collaboratorPointer = this._collaboratorPointers[clientId] = {
            mesh,
            parent
          };
          this._scene.add(mesh);
        }

        collaboratorPointer.mesh.visible = true;

        // If we are in exploded view, we display the collaborator cursor at the exploded position
        if (this._explodedView.enabled) {
          const explodedState = computeExplodedState({
            mesh: parent,
            boundingGroup: this._boundingGroup,
            factor: this._explodedView.factor
          });
          const explodeVector = explodedState.vector.multiplyScalar(
            explodedState.distance
          );

          collaboratorPointer.mesh.position.copy(
            new THREE.Vector3(
              pointer.x + explodeVector.x,
              pointer.y + explodeVector.y,
              pointer.z + explodeVector.z
            )
          );
        } else {
          collaboratorPointer.mesh.position.copy(
            new THREE.Vector3(pointer.x, pointer.y, pointer.z)
          );
        }

        collaboratorPointer.parent = parent;
      } else {
        if (this._collaboratorPointers[clientId]) {
          this._collaboratorPointers[clientId].mesh.visible = false;
        }
      }
    });
  };

  private _onSharedOptionsChanged(
    sender: IJupyterCadDoc,
    change: MapChange
  ): void {
    const objects = sender.objects;

    if (objects) {
      for (const objData of objects) {
        const objName = objData.name;
        const obj = this._meshGroup?.getObjectByName(objName) as
          | BasicMesh
          | undefined;

        if (!obj) {
          continue;
        }

        const isVisible = objData.visible;

        const objColor = obj?.material.color;

        obj.parent!.visible = isVisible;

        const explodedLineHelper =
          this._explodedViewLinesHelperGroup?.getObjectByName(objName);
        if (explodedLineHelper) {
          explodedLineHelper.visible = isVisible;
        }

        if (obj.material.color) {
          if ('color' in objData) {
            const rgba = objData.color as number[];
            const color = new THREE.Color(rgba[0], rgba[1], rgba[2]);
            obj.material.color = color;
          } else {
            obj.material.color = objColor || DEFAULT_MESH_COLOR;
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

    if (change.key === 'explodedView') {
      const explodedView = change.newValue as ExplodedView | undefined;

      if (change.type !== 'remove' && explodedView) {
        this._explodedView = explodedView;

        this._setupExplodedView();
      }
    }

    if (change.key === 'cameraSettings') {
      const cameraSettings = change.newValue as CameraSettings | undefined;

      if (change.type !== 'remove' && cameraSettings) {
        this._cameraSettings = cameraSettings;

        this._updateCamera();
      }
    }

    if (change.key === 'clipView') {
      const clipSettings = change.newValue as ClipSettings | undefined;

      if (change.type !== 'remove' && clipSettings) {
        this._clipSettings = clipSettings;

        this._updateClipping();
      }
    }

    if (change.key === 'wireframe') {
      const wireframeEnabled = change.newValue as boolean | undefined;

      if (wireframeEnabled !== undefined) {
        this.setState(
          old => ({ ...old, wireframe: wireframeEnabled }),
          () => {
            if (this._meshGroup) {
              this._meshGroup.traverse(child => {
                if (child instanceof THREE.Mesh) {
                  child.material.wireframe = wireframeEnabled;
                  child.material.needsUpdate = true;
                }
              });
              this._renderer.render(this._scene, this._camera);
            }
          }
        );
      }
    }
  }

  private _setupExplodedView() {
    if (this._explodedView.enabled) {
      const center = new THREE.Vector3();
      this._boundingGroup.getCenter(center);

      this._explodedViewLinesHelperGroup?.removeFromParent();
      this._explodedViewLinesHelperGroup = new THREE.Group();

      for (const group of this._meshGroup?.children as THREE.Group[]) {
        const explodedState = computeExplodedState({
          mesh: group.getObjectByName(
            group.name.replace('-group', '')
          ) as BasicMesh,
          boundingGroup: this._boundingGroup,
          factor: this._explodedView.factor
        });

        group.position.set(0, 0, 0);
        group.translateOnAxis(explodedState.vector, explodedState.distance);

        // Draw lines
        const material = new THREE.LineBasicMaterial({
          color: DEFAULT_EDGE_COLOR,
          linewidth: DEFAULT_LINEWIDTH
        });
        const geometry = new THREE.BufferGeometry().setFromPoints([
          explodedState.oldGeometryCenter,
          explodedState.newGeometryCenter
        ]);
        const line = new THREE.Line(geometry, material);
        line.name = group.name;
        line.visible = group.visible;

        this._explodedViewLinesHelperGroup.add(line);
      }

      this._scene.add(this._explodedViewLinesHelperGroup);
    } else {
      // Exploded view is disabled, we reset the initial positions
      for (const mesh of this._meshGroup?.children as BasicMesh[]) {
        mesh.position.set(0, 0, 0);
      }
      this._explodedViewLinesHelperGroup?.removeFromParent();
    }
  }

  private _updateCamera() {
    const position = new THREE.Vector3().copy(this._camera.position);
    const up = new THREE.Vector3().copy(this._camera.up);
    const target = this._controls.target.clone();

    this._camera.remove(this._cameraLight);
    this._scene.remove(this._camera);

    if (this._cameraSettings.type === 'Perspective') {
      this._camera = new THREE.PerspectiveCamera(
        50,
        2,
        CAMERA_NEAR,
        CAMERA_FAR
      );
    } else {
      const width = this.divRef.current?.clientWidth || 0;
      const height = this.divRef.current?.clientHeight || 0;

      const distance = position.distanceTo(target);
      const zoomFactor = 1000 / distance;

      this._camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2
      );
      this._camera.zoom = zoomFactor;
      this._camera.updateProjectionMatrix();
    }

    this._camera.add(this._cameraLight);
    this._createViewHelper();

    this._scene.add(this._camera);
    this._controls.object = this._camera;

    this._camera.position.copy(position);
    this._camera.up.copy(up);

    this._transformControls.camera = this._camera;
    this._clipPlaneTransformControls.camera = this._camera;

    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
  }

  private _updateClipping() {
    if (this._clipSettings.enabled) {
      this._renderer.localClippingEnabled = true;
      this._clipPlaneTransformControls.enabled = true;
      this._clipPlaneTransformControls.visible = true;
      this._clipPlaneTransformControls.attach(this._clippingPlaneMeshControl);
      this._clipPlaneTransformControls.position.copy(
        new THREE.Vector3(0, 0, 0)
      );
      this._clippingPlaneMeshControl.visible = this._clipSettings.showClipPlane;
      if (this._clippingPlaneMesh) {
        this._clippingPlaneMesh.visible = true;
      }
    } else {
      this._renderer.localClippingEnabled = false;
      this._clipPlaneTransformControls.enabled = false;
      this._clipPlaneTransformControls.visible = false;
      this._clippingPlaneMeshControl.visible = false;
      if (this._clippingPlaneMesh) {
        this._clippingPlaneMesh.visible = false;
      }
    }
  }

  private _handleThemeChange = (): void => {
    DEFAULT_MESH_COLOR.set(getCSSVariableColor(DEFAULT_MESH_COLOR_CSS));
    DEFAULT_EDGE_COLOR.set(getCSSVariableColor(DEFAULT_EDGE_COLOR_CSS));
    BOUNDING_BOX_COLOR.set(getCSSVariableColor(BOUNDING_BOX_COLOR_CSS));

    this._clippingPlaneMeshControl.material.color = DEFAULT_MESH_COLOR;
  };

  private _handleWindowResize = (): void => {
    this.resizeCanvasToDisplaySize();
    this._updateAnnotation();
  };

  private _computeAnnotationPosition(annotation: IAnnotation): THREE.Vector2 {
    const parent = this._meshGroup?.getObjectByName(
      annotation.parent
    ) as BasicMesh;
    const position = new THREE.Vector3(
      annotation.position[0],
      annotation.position[1],
      annotation.position[2]
    );

    // If in exploded view, we explode the annotation position as well
    if (this._explodedView.enabled && parent) {
      const explodedState = computeExplodedState({
        mesh: parent,
        boundingGroup: this._boundingGroup,
        factor: this._explodedView.factor
      });
      const explodeVector = explodedState.vector.multiplyScalar(
        explodedState.distance
      );

      position.add(explodeVector);
    }
    const canvas = this._renderer.domElement;
    const screenPosition = projectVector({
      vector: position,
      camera: this._camera,
      width: canvas.width,
      height: canvas.height
    });
    return screenPosition;
  }
  render(): JSX.Element {
    return (
      <div
        className="jcad-Mainview data-jcad-keybinding"
        tabIndex={-2}
        style={{
          border: this.state.remoteUser
            ? `solid 3px ${this.state.remoteUser.color}`
            : 'unset'
        }}
      >
        <Spinner loading={this.state.loading} />
        <FollowIndicator remoteUser={this.state.remoteUser} />
        {Object.entries(this.state.annotations).map(([key, annotation]) => {
          if (!this._model.annotationModel) {
            return null;
          }
          const screenPosition = this._computeAnnotationPosition(annotation);
          return (
            <div
              key={key}
              id={key}
              style={{
                left: screenPosition.x,
                top: screenPosition.y
              }}
              className={'jcad-Annotation-Wrapper'}
            >
              <FloatingAnnotation
                itemId={key}
                model={this._model.annotationModel}
                open={false}
                // open={annotation.open} // TODO: "open" missing from the IAnnotation interface?
              />
            </div>
          );
        })}

        <div
          ref={this.divRef}
          style={{
            width: '100%',
            height: 'calc(100%)'
          }}
        />
      </div>
    );
  }

  private divRef = React.createRef<HTMLDivElement>(); // Reference of render div

  private _model: IJupyterCadModel;
  private _mainViewModel: MainViewModel;
  private _pointer: THREE.Vector2;
  private _syncPointer: (
    position: THREE.Vector3 | undefined,
    parent: string | undefined
  ) => void;
  private _selectedMeshes: BasicMesh[] = [];

  private _meshGroup: THREE.Group | null = null; // The list of ThreeJS meshes

  private _boundingGroup = new THREE.Box3();

  // TODO Make this a shared property
  private _explodedView: ExplodedView = { enabled: false, factor: 0 };
  private _explodedViewLinesHelperGroup: THREE.Group | null = null; // The list of line helpers for the exploded view
  private _cameraSettings: CameraSettings = { type: 'Perspective' };
  private _clipSettings: ClipSettings = { enabled: false, showClipPlane: true };
  private _clippingPlaneMeshControl: BasicMesh; // Plane mesh using for controlling the clip plane in the UI
  private _clippingPlaneMesh: THREE.Mesh | null = null; // Plane mesh used for "filling the gaps"
  private _clippingPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0); // Mathematical object for clipping computation
  private _clippingPlanes = [this._clippingPlane];
  private _edgeMaterials: any[] = [];

  private _previousSelection: { [key: string]: ISelection } | null = null;

  private _currentTransformed: THREE.Object3D | undefined = undefined;

  private _scene: THREE.Scene; // Threejs scene
  private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera; // Threejs camera
  private _cameraLight: THREE.PointLight;
  private _raycaster = new THREE.Raycaster();
  private _renderer: THREE.WebGLRenderer; // Threejs render
  private _requestID: any = null; // ID of window.requestAnimationFrame
  private _geometry: THREE.BufferGeometry; // Threejs BufferGeometry
  private _refLength: number | null = null; // Length of bounding box of current object
  private _sceneAxe: THREE.Object3D | null; // Array of  X, Y and Z axe
  private _controls: OrbitControls; // Camera controls
  private _mouseDrag: IMouseDrag = {
    start: new THREE.Vector2(),
    end: new THREE.Vector2()
  }; // Current mouse drag
  private _clipPlaneTransformControls: TransformControls; // Clip plane position/rotation controls
  private _transformControls: TransformControls; // Mesh position controls
  private _pointer3D: IPointer | null = null;
  private _clock: THREE.Clock;
  private _targetPosition: THREE.Vector3 | null = null;
  private _viewHelper: ViewHelper;
  private _viewHelperDiv: HTMLDivElement | null = null;
  private _collaboratorPointers: IDict<IPointer>;
  private _contextMenu: ContextMenu;
  private _loadingTimeout: ReturnType<typeof setTimeout> | null;
  private _matchingChild: THREE.Object3D<THREE.Object3DEventMap> | undefined;
}
