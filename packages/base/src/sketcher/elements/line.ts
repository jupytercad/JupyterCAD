import { ILine, IPosition } from '../types';

export class Line implements ILine {
  constructor(
    public start: IPosition,
    public end: IPosition,
    public controlPoints?: string[]
  ) {}

  export(scaleFactor = 1): { start: IPosition; end: IPosition } {
    const scaledStart = {
      x: this.start.x / scaleFactor,
      y: this.start.y / scaleFactor
    };
    const scaledEnd = {
      x: this.end.x / scaleFactor,
      y: this.end.y / scaleFactor
    };
    return { start: scaledStart, end: scaledEnd };
  }
}
