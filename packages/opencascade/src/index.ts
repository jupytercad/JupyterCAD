import opencascade, { OpenCascadeInstance } from './jupytercad.opencascade';
import opencascadeWasm from './jupytercad.opencascade.wasm';

export * as OCC from './jupytercad.opencascade';

const initOpenCascade = (options: {
  mainJS: any;
  mainWasm: any;
  worker?: any;
  libs?: any[];
  module?: any[];
}): Promise<OpenCascadeInstance> => {
  return new Promise((resolve, reject) => {
    const { mainJS, mainWasm, worker, libs = [], module = [] } = options;
    new mainJS({
      locateFile(path) {
        if (path.endsWith('.wasm')) {
          return mainWasm;
        }
        if (path.endsWith('.worker.js') && !!worker) {
          return worker;
        }
        return path;
      },
      ...module
    }).then(async oc => {
      for (const lib of libs) {
        await oc.loadDynamicLibrary(lib, {
          loadAsync: true,
          global: true,
          nodelete: true,
          allowUndefined: false
        });
      }
      resolve(oc);
    });
  });
};

export async function initializeOpenCascade() {
  return initOpenCascade({
    mainJS: opencascade,
    mainWasm: opencascadeWasm
  });
}
