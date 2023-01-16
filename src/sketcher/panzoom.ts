import { nearest } from '../tools';
import { IPosition } from './types';

export class PanZoom {
  constructor(private ctx: CanvasRenderingContext2D, private gridSize: number) {
    this.x = 0;
    this.y = 0;
    this.scale = 1;
  }
  apply(): void {
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y);
  }
  scaleAt(x: number, y: number, sc: number): void {
    // x & y are screen coords, not world
    this.scale *= sc;
    this.x = x - (x - this.x) * sc;
    this.y = y - (y - this.y) * sc;
  }
  toWorld(screenCoor: IPosition, snap = false, tol = 0.1): IPosition {
    // converts from screen coords to world coords
    const inv = 1 / this.scale;
    let x = (screenCoor.x - this.x) * inv;
    let y = (screenCoor.y - this.y) * inv;
    if (snap) {
      x = nearest(x / this.gridSize, tol) * this.gridSize;
      y = nearest(y / this.gridSize, tol) * this.gridSize;
    }
    return { x, y };
  }
  toScreen(worldPos: IPosition): IPosition {
    const x = worldPos.x * this.scale + this.x;
    const y = worldPos.y * this.scale + this.y;
    return { x, y };
  }

  x: number;
  y: number;
  scale: number;
}
