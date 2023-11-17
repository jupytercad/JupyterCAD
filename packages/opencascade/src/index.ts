import initOpenCascade from 'opencascade.js';

import opencascade from './jupytercad.opencascade.js';
// eslint-disable-next-line no-undef
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import opencascadeWasm from './jupytercad.opencascade.wasm';

export * as OCC from './jupytercad.opencascade.js';

export async function initializeOpenCascade() {
  return initOpenCascade({
    mainJS: opencascade,
    mainWasm: opencascadeWasm
  });
}
