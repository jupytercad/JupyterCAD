import { showErrorMessage } from '@jupyterlab/apputils';
import { v4 as uuid } from 'uuid';

import { IDict, IJupyterCadDoc } from '../types';
import { IJCadObject } from '../_interface/jcad';
import { IGeomCircle, IGeomLineSegment } from '../_interface/sketch';

import { distance } from './helper';
import { Line } from './elements/line';
import { Point } from './elements/point';
import {
  ICircle,
  ILine,
  IOperator,
  IPlane,
  IPoint,
  IPosition,
  ISketcherModel
} from './types';
import { Circle } from './elements/circle';

// TODO Refactor this model to make use of the elemental classes (Point, Circle...)
export class SketcherModel implements ISketcherModel {
  constructor(options: { gridSize: number; sharedModel?: IJupyterCadDoc }) {
    this._gridSize = options.gridSize;
    this._sharedModel = options.sharedModel;
  }

  get gridSize(): number {
    return this._gridSize;
  }
  get points(): Map<string, IPoint> {
    return this._points;
  }
  get lines(): Map<string, ILine> {
    return this._lines;
  }
  get circles(): Map<string, ICircle> {
    return this._circles;
  }
  get editing(): { type: IOperator | null; content: IDict | null } {
    return this._editing;
  }
  startEdit(type: IOperator, content: IDict): void {
    this._editing.type = type;
    this._editing.content = content;
  }
  updateEdit(type: IOperator, content: IDict): void {
    if (type === this._editing.type) {
      this.editing.content = content;
    }
  }
  stopEdit(removeLast?: boolean): void {
    if (removeLast) {
      const tempId = this._editing.content?.['tempId'];
      if (tempId) {
        switch (this._editing.type) {
          case 'CIRCLE': {
            this.removeCircle(tempId);
            break;
          }
          case 'LINE': {
            this.removeLine(tempId);
            break;
          }
          default:
            break;
        }
      }
    }
    this._editing.type = null;
    this._editing.content = null;
  }

  addPoint(position: IPosition, option?: { color: string }): string {
    const near = this.getPointByPosition(position);
    if (near) {
      return near;
    }
    const id = uuid();
    this._points.set(id, new Point(position.x, position.y, option));
    return id;
  }
  removePoint(id: string): void {
    this._points.delete(id);
  }
  getPointByPosition(pos: IPosition): string | undefined {
    for (const [key, val] of this._points.entries()) {
      if (distance(val.position, pos) < 0.05 * this._gridSize) {
        return key;
      }
    }
  }
  getPointById(id: string): IPoint | undefined {
    return this._points.get(id);
  }

  addLine(start: IPosition, end: IPosition): string {
    const id = uuid();
    this._lines.set(id, new Line(start, end));
    return id;
  }
  removeLine(id: string): void {
    this._lines.delete(id);
  }
  getLineById(id: string): ILine | undefined {
    return this._lines.get(id);
  }
  getLineByControlPoint(pointId: string): string[] {
    const lines: string[] = [];
    for (const [key, val] of this._lines.entries()) {
      if (val.controlPoints && val.controlPoints.includes(pointId)) {
        lines.push(key);
      }
    }
    return lines;
  }

  addCircle(center: IPosition, radius: number): void {
    const id = uuid();
    this._circles.set(id, new Circle(center, radius));
    return id;
  }
  removeCircle(id: string): void {
    this._circles.delete(id);
  }
  getCircleById(id: string): ICircle | undefined {
    return this._circles.get(id);
  }
  getCircleByControlPoint(id: string): string[] {
    const circles: string[] = [];
    for (const [key, val] of this._circles.entries()) {
      if (val.controlPoints && val.controlPoints.includes(id)) {
        circles.push(key);
      }
    }
    return circles;
  }

  async save(fileName: string, plane: IPlane): Promise<void> {
    if (!this._sharedModel) {
      return;
    }
    if (!this._sharedModel.objectExists(fileName)) {
      const geometryList: (IGeomCircle | IGeomLineSegment)[] = [];
      this._circles.forEach(
        c =>
          void geometryList.push(
            this._writeCircle(c.export(this._gridSize), plane)
          )
      );
      this._lines.forEach(
        l =>
          void geometryList.push(
            this._writeLine(l.export(this._gridSize), plane)
          )
      );
      const newSketch: IJCadObject = {
        shape: 'Sketcher::SketchObject',
        name: fileName,
        visible: true,
        parameters: {
          Geometry: geometryList,
          Placement: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 },
          AttachmentOffset: { Position: [0, 0, 0], Axis: [0, 0, 1], Angle: 0 }
        }
      };
      this._sharedModel?.addObject(newSketch);
    } else {
      showErrorMessage(
        'The object already exists',
        'There is an existing object with the same name.'
      );
    }
  }

  private _writeLine(l: ILine, plane: IPlane): IGeomLineSegment {
    let StartX = 0;
    let StartY = 0;
    let StartZ = 0;
    let EndX = 0;
    let EndY = 0;
    let EndZ = 0;
    if (plane === 'XY') {
      StartX = l.start.x;
      StartY = l.start.y;
      EndX = l.end.x;
      EndY = l.end.y;
    } else if (plane === 'YZ') {
      StartY = l.start.x;
      StartZ = l.start.y;
      EndY = l.end.x;
      EndZ = l.end.y;
    } else {
      StartZ = l.start.x;
      StartX = l.start.y;
      EndZ = l.end.x;
      EndX = l.end.y;
    }
    return {
      TypeId: 'Part::GeomLineSegment',
      StartX,
      StartY,
      StartZ,
      EndX,
      EndY,
      EndZ
    };
  }
  private _writeCircle(c: ICircle, plane: IPlane): IGeomCircle {
    let CenterX, CenterY, CenterZ: number;
    let NormalX = 0;
    let NormalY = 0;
    let NormalZ = 0;
    if (plane === 'XY') {
      CenterX = c.center.x;
      CenterY = c.center.y;
      CenterZ = 0;
      NormalZ = 1;
    } else if (plane === 'YZ') {
      CenterX = 0;
      CenterY = c.center.x;
      CenterZ = c.center.y;
      NormalX = 1;
    } else {
      CenterX = c.center.y;
      CenterY = 0;
      CenterZ = c.center.x;
      NormalY = 1;
    }

    return {
      TypeId: 'Part::GeomCircle',
      CenterX,
      CenterY,
      CenterZ,
      NormalX,
      NormalY,
      NormalZ,
      Radius: c.radius,
      AngleXU: 0
    };
  }
  private _points: Map<string, Point> = new Map();
  private _lines: Map<string, Line> = new Map();
  private _circles: Map<string, Circle> = new Map([]);
  private _gridSize: number;
  private _editing: { type: IOperator | null; content: IDict | null } = {
    type: null,
    content: null
  };
  private _sharedModel?: IJupyterCadDoc;
}
