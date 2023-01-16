import { IPoint, IPosition } from '../types';

export class Point implements IPoint {
  constructor(x: number, y: number, public option?: { color: string }) {
    this._x = x;
    this._y = y;
  }
  get position(): IPosition {
    return { x: this._x, y: this._y };
  }

  export(scaleFactor = 1): IPosition {
    return { x: this._x / scaleFactor, y: this._y / scaleFactor };
  }
  private _x: number;
  private _y: number;
}
