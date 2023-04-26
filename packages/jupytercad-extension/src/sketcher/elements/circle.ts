import { ICircle, IPosition } from '../types';

export class Circle implements ICircle {
  constructor(
    public center: IPosition,
    public radius: number,
    public controlPoints?: string[]
  ) {}

  export(scaleFactor = 1): { center: IPosition; radius: number } {
    const scaledCenter = {
      x: this.center.x / scaleFactor,
      y: this.center.y / scaleFactor
    };

    return { center: scaledCenter, radius: this.radius / scaleFactor };
  }
}
