import { ToolbarButtonComponent, closeIcon } from '@jupyterlab/ui-components';
import * as React from 'react';
import {
  distance,
  drawCircle,
  drawLine,
  drawPoint,
  ToolbarSwitch
} from './helper';
import { PanZoom } from './panzoom';
import { IOperator, IPosition, ISketcherModel } from './types';
interface IProps {
  model: ISketcherModel;
  closeCallback: { handler: () => void };
}
interface IState {
  mode?: IOperator;
  plane: 'XY' | 'YZ' | 'ZX';
  sketchName?: string;
  currentPointer?: IPosition;
}

const TOOLBAR_HEIGHT = 30;
export class SketcherReactWidget extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { plane: 'XY' };
    this._gridSize = props.model.gridSize;
  }

  componentDidMount(): void {
    setTimeout(() => {
      this.initiateEditor();
    }, 100);
  }

  get ctx(): CanvasRenderingContext2D | null {
    const canvas = this._canvasRef.current;
    if (!canvas) {
      return null;
    }
    return canvas.getContext('2d');
  }

  initiateEditor(): void {
    const currentDiv = this._divRef.current;
    if (!currentDiv) {
      return;
    }
    const canvas = this._canvasRef.current;
    if (!canvas) {
      return;
    }
    const rect = currentDiv.getBoundingClientRect();

    if (rect?.width && rect?.height) {
      canvas.height = rect.height - TOOLBAR_HEIGHT; // Remove the height of the toolbar
      canvas.width = rect.width;
    }

    ['mousedown', 'mouseup', 'mousemove'].forEach(ev =>
      canvas.addEventListener(ev as any, this.mousePanAnZoom)
    );
    canvas.addEventListener('wheel', this.mousePanAnZoom, { passive: false });

    canvas.addEventListener('mousedown', this.handleRightClick);
    canvas.addEventListener('click', this.handleLeftClick);
    canvas.addEventListener('mousemove', this.handleMouseMove);

    const ctx = canvas.getContext('2d')!;
    this._panZoom = new PanZoom(ctx, this._gridSize);
    this._panZoom.x = canvas.width / 2;
    this._panZoom.y = canvas.height / 2;
    requestAnimationFrame(this.update);
  }

  handleMouseMove = (e: MouseEvent): void => {
    const model = this.props.model;
    const localPos = this.globalToLocalPos({ x: e.pageX, y: e.pageY });
    const worldPos = this.screenToWorldPos(localPos);
    switch (this.state.mode) {
      case 'LINE': {
        if (model.editing.type === 'LINE') {
          const startPointId = model.editing.content!['startPoint'];
          const tempLineId = model.editing.content!['tempId'];

          const startPoint = model.getPointById(startPointId);
          // const endPoint = model.getPointById(endPointId);
          if (startPoint) {
            if (tempLineId) {
              model.removeLine(tempLineId);
            }
            const newTempLine = model.addLine(startPoint.position, worldPos);
            model.updateEdit('LINE', {
              ...model.editing.content,
              tempId: newTempLine
            });
          }
        }
        break;
      }
      case 'CIRCLE': {
        if (model.editing.type === 'CIRCLE') {
          const centerId = model.editing.content!['centerId'];
          const tempCircleId = model.editing.content!['tempId'];

          const centerPoint = model.getPointById(centerId);

          // const endPoint = model.getPointById(endPointId);
          if (centerPoint) {
            if (tempCircleId) {
              model.removeCircle(tempCircleId);
            }
            const radius = distance(worldPos, centerPoint.position);
            const newTempCircle = model.addCircle(centerPoint.position, radius);
            model.updateEdit('CIRCLE', {
              ...model.editing.content,
              tempId: newTempCircle
            });
          }
        }
        break;
      }
      case 'POINT': {
        break;
      }
      default:
        break;
    }
  };
  handleRightClick = (e: MouseEvent): void => {
    if (e.button !== 2) {
      return;
    }
    const model = this.props.model;
    if (this.state.mode) {
      model.stopEdit(true);
      this.setState(old => ({ ...old, mode: undefined }));
    } else {
      const localPos = this.globalToLocalPos({ x: e.pageX, y: e.pageY });
      const worldPos = this.screenToWorldPos(localPos);
      const pointId = model.getPointByPosition(worldPos);
      if (pointId) {
        const selectedLines = model.getLineByControlPoint(pointId);
        selectedLines.forEach(id => model.removeLine(id));

        const selectedCircle = model.getCircleByControlPoint(pointId);
        selectedCircle.forEach(id => {
          const circle = model.getCircleById(id);
          circle?.controlPoints?.forEach(p => model.removePoint(p));
          model.removeCircle(id);
        });

        model.removePoint(pointId);
      }
    }
  };

  handleLeftClick = (e: MouseEvent): void => {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    const { model } = this.props;
    const mousePosition = this.globalToLocalPos({ x: e.pageX, y: e.pageY });
    const worldPos = this.screenToWorldPos(mousePosition);
    switch (this.state.mode) {
      case 'LINE': {
        if (model.editing.type === 'LINE') {
          model.addPoint(worldPos, { color: '#ffffff00' });
          const lineId = model.editing.content!['tempId'];
          const line = model.getLineById(lineId)!;
          const midpoint = {
            x: (line.start.x + line.end.x) / 2,
            y: (line.start.y + line.end.y) / 2
          };
          const mid = model.addPoint(midpoint, { color: 'red' });
          line.controlPoints = [mid];
          model.stopEdit();
        } else {
          const startPoint = model.addPoint(worldPos, { color: '#ffffff00' });
          model.startEdit('LINE', { startPoint });
        }
        break;
      }
      case 'CIRCLE': {
        if (model.editing.type === 'CIRCLE') {
          const centerId = model.editing.content!['centerId'];
          const circleId = model.editing.content!['tempId'];
          const circle = model.getCircleById(circleId)!;

          const control = model.addPoint(worldPos, { color: 'red' });
          circle.controlPoints = [control, centerId];
          model.stopEdit();
        } else {
          const centerId = model.addPoint(worldPos, { color: 'red' });

          model.startEdit('CIRCLE', { centerId, radius: 0 });
        }
        break;
      }
      case 'POINT': {
        model.addPoint(worldPos);
        break;
      }
      default:
        break;
    }
  };

  mousePanAnZoom = (e: MouseEvent): void => {
    if (!this._canvasRef.current) {
      return;
    }

    const localPos = this.globalToLocalPos({ x: e.pageX, y: e.pageY });
    this._mouse.x = localPos.x;
    this._mouse.y = localPos.y;

    this._mouse.button =
      e.type === 'mousedown' && e.button === 2
        ? true
        : e.type === 'mouseup'
        ? false
        : this._mouse.button;
    if (e.type === 'wheel') {
      this._mouse.wheel += -(e as WheelEvent).deltaY;
      e.preventDefault();
    }
    const currentPos = this.screenToWorldPos(this._mouse);
    if (currentPos) {
      this.setState(old => ({
        ...old,
        currentPointer: {
          x: parseFloat((currentPos.x / this._gridSize).toFixed(2)),
          y: parseFloat((currentPos.y / this._gridSize).toFixed(2))
        }
      }));
    }
  };

  drawGrid = (gridScreenSize = 128): void => {
    if (!this._canvasRef.current) {
      return;
    }
    const panZoom = this._panZoom;
    const canvas = this._canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const w = canvas.width;
    const h = canvas.height;
    const gridScale = gridScreenSize;
    let size = Math.max(w, h) / panZoom.scale + gridScale * 2;
    this._topLeft = panZoom.toWorld({ x: 0, y: 0 });
    const x = Math.floor(this._topLeft.x / gridScale) * gridScale;
    const y = Math.floor(this._topLeft.y / gridScale) * gridScale;
    if (size / gridScale > this._gridLimit) {
      size = gridScale * this._gridLimit;
    }

    panZoom.apply();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    for (let i = 0; i < size; i += gridScale) {
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + size);
      ctx.moveTo(x, y + i);
      ctx.lineTo(x + size, y + i);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.stroke();
    ctx.closePath();

    this.drawCenter(size);
  };

  drawCenter = (size: number): void => {
    const panZoom = this._panZoom;
    const canvas = this._canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const center = panZoom.toScreen({ x: 0, y: 0 });

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';

    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x, center.y + size);
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x, center.y - size);
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + size, center.y);
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x - size, center.y);
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.closePath();
  };

  drawPointer = (x: number, y: number): void => {
    const panZoom = this._panZoom;
    const canvas = this._canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const worldCoord = this.screenToWorldPos({ x, y });
    panZoom.apply();

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(worldCoord.x - (2 / panZoom.scale) * canvas.width, worldCoord.y);
    ctx.lineTo(worldCoord.x + (2 / panZoom.scale) * canvas.width, worldCoord.y);
    ctx.moveTo(
      worldCoord.x,
      worldCoord.y - (2 / panZoom.scale) * canvas.height
    );
    ctx.lineTo(
      worldCoord.x,
      worldCoord.y + (2 / panZoom.scale) * canvas.height
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0); //reset the transform so the lineWidth is 1
    ctx.stroke();
    ctx.closePath();

    const newScreenPos = panZoom.toScreen(worldCoord);
    drawPoint(ctx, newScreenPos, 'crimson');
  };

  draw = (): void => {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    const { model } = this.props;
    const panZoom = this._panZoom;
    model.points.forEach((val, key) => {
      const newScreenPos = panZoom.toScreen(val.position);
      const color = val.option?.color;
      drawPoint(ctx, newScreenPos, color);
    });
    model.lines.forEach(val => {
      const screenStart = panZoom.toScreen(val.start);
      const screenEnd = panZoom.toScreen(val.end);
      drawLine(ctx, screenStart, screenEnd, 'blue', 1);
    });

    model.circles.forEach(val => {
      const { center } = val;
      const testRadius = { x: center.x + val.radius, y: center.y };
      const screenCenter = panZoom.toScreen(center);
      const screenTest = panZoom.toScreen(testRadius);
      const radius = distance(screenCenter, screenTest);
      drawCircle(ctx, screenCenter, radius, 'blue', 1);
    });
  };

  update = (): void => {
    const canvas = this._canvasRef.current;
    const currentDiv = this._divRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !currentDiv) {
      return;
    }
    const mouse = this._mouse;
    const panZoom = this._panZoom;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.globalAlpha = 1; // reset alpha

    const rect = currentDiv.getBoundingClientRect();

    if (
      canvas.width !== rect.width ||
      canvas.height !== rect.height - TOOLBAR_HEIGHT
    ) {
      canvas.height = rect.height - TOOLBAR_HEIGHT; // Remove the height of the toolbar
      canvas.width = rect.width;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (mouse.wheel !== 0) {
      let scale = 1;
      scale = mouse.wheel < 0 ? 1 / this._scaleRate : this._scaleRate;
      mouse.wheel *= 0.8;
      if (Math.abs(mouse.wheel) < 1) {
        mouse.wheel = 0;
      }
      panZoom.scaleAt(mouse.x, mouse.y, scale); //scale is the change in scale
    }
    if (mouse.button) {
      if (!mouse.drag) {
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
        mouse.drag = true;
      } else {
        panZoom.x += mouse.x - mouse.lastX;
        panZoom.y += mouse.y - mouse.lastY;
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
      }
    } else if (mouse.drag) {
      mouse.drag = false;
    }
    this.drawGrid(this._gridSize);
    this.drawPointer(mouse.x, mouse.y);
    this.draw();
    requestAnimationFrame(this.update);
  };

  globalToLocalPos = (global: IPosition): IPosition => {
    const bounds = this._canvasRef.current!.getBoundingClientRect();
    const x = global.x - bounds.left - scrollX;
    const y = global.y - bounds.top - scrollY;
    return { x, y };
  };
  screenToWorldPos = (screen: IPosition): IPosition => {
    let worldPos = this._panZoom!.toWorld(screen, true);
    const nearPoint = this.props.model.getPointByPosition(worldPos);
    if (nearPoint) {
      const p = this.props.model.getPointById(nearPoint)!;
      worldPos = p.position;
    }
    return worldPos;
  };
  toggleMode =
    (mode: IOperator): (() => void) =>
    () => {
      if (this.state.mode !== mode) {
        this.setState(old => ({ ...old, mode }));
      } else {
        this.setState(old => ({ ...old, mode: undefined }));
      }
    };

  saveButtonOnClick = async (): Promise<void> => {
    if (this.state.sketchName) {
      await this.props.model.save(this.state.sketchName, this.state.plane);
      this.props.closeCallback.handler();
    }
  };
  render(): React.ReactNode {
    return (
      <div
        className="jpcad-sketcher-Sketcher"
        ref={this._divRef}
        style={{ overflow: 'hidden', width: '100%', height: '100%' }}
      >
        <div className="lm-Widget jp-Toolbar jpcad-sketcher-Sketcher-Toolbar">
          <div className="jp-HTMLSelect jp-DefaultStyle jp-Notebook-toolbarCellTypeDropdown">
            <select
              onChange={e =>
                this.setState(old => ({
                  ...old,
                  plane: e.target.value as any
                }))
              }
            >
              <option value={'XY'}>XY-plane</option>
              <option value={'YZ'}>YZ-plane</option>
              <option value={'ZX'}>ZX-Plane</option>
            </select>
          </div>
          <div
            style={{
              boxShadow: '0 0 3px var(--jp-border-color0) inset',
              display: 'flex'
            }}
          >
            {['POINT', 'LINE', 'CIRCLE'].map(op => (
              <ToolbarSwitch
                key={op}
                label={op}
                toggled={this.state.mode === op}
                onClick={this.toggleMode(op as IOperator)}
              />
            ))}
          </div>
          <div style={{ flexGrow: 1 }}></div>
          <input
            style={{ height: 25 }}
            className="jp-mod-styled"
            type="text"
            placeholder="Sketch name"
            value={this.state.sketchName}
            onChange={e =>
              this.setState(old => ({ ...old, sketchName: e.target.value }))
            }
          />
          <ToolbarSwitch
            label="Save"
            toggled={false}
            onClick={this.saveButtonOnClick}
          />

          <ToolbarButtonComponent
            icon={closeIcon}
            onClick={() => {
              this.props.closeCallback.handler();
            }}
          />
        </div>
        <canvas
          className="jpcad-sketcher-Sketcher-Canvas"
          ref={this._canvasRef}
        ></canvas>
        <div className="jpcad-sketcher-Sketcher-Statusbar">
          X: {this.state.currentPointer?.x} - Y: {this.state.currentPointer?.y}
        </div>
      </div>
    );
  }
  private _mouse = {
    x: 0,
    y: 0,
    button: false,
    wheel: 0,
    lastX: 0,
    lastY: 0,
    drag: false
  };
  private _gridLimit = 128;
  private _gridSize: number; //grid size in pixels
  private _scaleRate = 1.02;
  private _topLeft = { x: 0, y: 0 }; // top left position of canvas in world coords.
  private _divRef = React.createRef<HTMLDivElement>();
  private _canvasRef = React.createRef<HTMLCanvasElement>();
  private _panZoom: PanZoom;
  // private _lightTheme =
  //   document.body.getAttribute('data-jp-theme-light') === 'true';
}
