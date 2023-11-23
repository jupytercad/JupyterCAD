import initOpenCascade from 'opencascade.js';

import opencascade from './jupytercad.opencascade';
import opencascadeWasm from './jupytercad.opencascade.wasm';

export * as OCC from './jupytercad.opencascade';

export async function initializeOpenCascade() {
  return initOpenCascade({
    mainJS: opencascade,
    mainWasm: opencascadeWasm
  });
}
