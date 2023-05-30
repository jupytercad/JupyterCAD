export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export function toRad(deg: number): number {
  return (Math.PI * deg) / 180;
}
export function toDeg(rad: number): number {
  return (180 * rad) / Math.PI;
}
