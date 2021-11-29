import * as React from 'react';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { JupyterCadModel } from './model';

import {
  IMainMessage,
  IWorkerMessage,
  WorkerAction,
  MainAction
} from './types';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
// const DARK_BG = 'linear-gradient(rgb(0, 0, 42), rgb(82, 87, 110))';
const LIGHT_BG = 'radial-gradient(#efeded, #8f9091)';

interface IProps {
  context: DocumentRegistry.IContext<JupyterCadModel>;
}

interface IStates {
  id: string;
  bgColor: string;
}

export class MainView extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setDrawRange(0, 3 * 10000);
    this.refLength = 0;
    this.sceneAxe = [];
    // this.shapeGroup = new THREE.Group();
    // this.sceneScaled = false;
    // this.computedScene = {};
    // this.progressData = { time_step: -1, data: {} };
    this.resizeTimeout = null;
    this.state = {
      id: 'id',
      bgColor: LIGHT_BG
    };

    this._context = props.context;
    this._context.ready.then(() => {
      const model = this._context.model as JupyterCadModel;
      this._worker = model.startWorker();
      console.log('worker', this._worker);
      this.postMessage({
        action: WorkerAction.LOAD_FILE,
        payload: { fileName: this._context.path, content: model.toString() }
      });
      this._worker.onmessage = msgEvent => {
        this.messageHandler(msgEvent.data);
      };
    });
  }
  componentDidMount(): void {
    console.log('componentDidMount');
    window.addEventListener('resize', this.handleWindowResize);
    this.generateScene();
  }

  componentDidUpdate(oldProps: IProps, oldState: IStates): void {
    console.log('componentDidUpdate');
    this.resizeCanvasToDisplaySize();
  }

  componentWillUnmount(): void {
    console.log('componentWillUnmount');
    window.cancelAnimationFrame(this.requestID);
    window.removeEventListener('resize', this.handleWindowResize);
    this.controls.dispose();
  }

  handleWindowResize = () => {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
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
    this.scene.add(arrowHelperX);
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
    this.sceneAxe.push(arrowHelperX, line);
    this.scene.add(line);
  };

  sceneSetup = (): void => {
    console.log('divref', this.divRef.current);

    if (this.divRef.current !== null) {
      console.log(this.requestID, this.refLength);
      this.camera = new THREE.PerspectiveCamera(90, 2, 0.1, 1000);
      this.camera.position.set(8, 8, 8);
      this.camera.up.set(0, 0, 1);

      this.scene = new THREE.Scene();
      const size = 40;
      const divisions = 40;
      this.gridHelper = new THREE.GridHelper(
        size,
        divisions,
        0x888888,
        0x888888
      );
      this.gridHelper.geometry.rotateX(Math.PI / 2);

      this.scene.add(this.gridHelper);
      this.addSceneAxe(new THREE.Vector3(1, 0, 0), 0x00ff00);
      this.addSceneAxe(new THREE.Vector3(0, 1, 0), 0xff0000);
      this.addSceneAxe(new THREE.Vector3(0, 0, 1), 0xffff00);

      const lights: Array<any> = [];
      lights[0] = new THREE.AmbientLight(0x404040); // soft white light
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);

      this.scene.add(lights[0]);
      this.camera.add(lights[1]);
      this.scene.add(this.camera);

      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setSize(500, 500, false);
      this.divRef.current.appendChild(this.renderer.domElement); // mount using React ref

      const controls = new OrbitControls(this.camera, this.renderer.domElement);
      // var controls = new TrackballControls(this.camera, this.renderer.domElement);
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.panSpeed = 0.8;
      controls.target.set(
        this.scene.position.x,
        this.scene.position.y,
        this.scene.position.z
      );
      this.controls = controls;
    }
  };
  startAnimationLoop = (): void => {
    this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    this.controls.update();
    this.renderer.clearDepth();
    this.renderer.render(this.scene, this.camera);
  };

  resizeCanvasToDisplaySize = (): void => {
    if (this.divRef.current !== null) {
      this.renderer.setSize(
        this.divRef.current.clientWidth,
        this.divRef.current.clientHeight,
        false
      );
      this.camera.aspect =
        this.divRef.current.clientWidth / this.divRef.current.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  };

  generateScene = (): void => {
    this.sceneSetup();
    this.startAnimationLoop();
    this.resizeCanvasToDisplaySize();
  };

  messageHandler = (msg: IMainMessage): void => {
    const { action, payload } = msg;
    switch (action) {
      case MainAction.DISPLAY_SHAPE: {
        console.log('in main ', payload);
        break;
      }
    }
  };

  private postMessage = (msg: IWorkerMessage) => {
    if (this._worker) {
      this._worker.postMessage(msg);
    }
  };

  render(): JSX.Element {
    return (
      <div
        ref={this.divRef}
        style={{
          width: '100%',
          height: 'calc(100%)',
          background: this.state.bgColor //"radial-gradient(#efeded, #8f9091)"
        }}
      />
    );
  }

  divRef = React.createRef<HTMLDivElement>(); // Reference of render div
  private _worker?: Worker = undefined;
  private _context: DocumentRegistry.IContext<JupyterCadModel>;
  private scene: THREE.Scene; // Threejs scene
  private camera: THREE.PerspectiveCamera; // Threejs camera
  private renderer: THREE.WebGLRenderer; // Threejs render
  private requestID: any = null; // ID of window.requestAnimationFrame
  private geometry: THREE.BufferGeometry; // Threejs BufferGeometry
  private refLength: number; // Length of bounding box of current object
  private gridHelper: THREE.GridHelper; // Threejs grid
  private sceneAxe: (THREE.ArrowHelper | Line2)[]; // Array of  X, Y and Z axe
  private controls: any; // Threejs control
  private resizeTimeout: any;
}
