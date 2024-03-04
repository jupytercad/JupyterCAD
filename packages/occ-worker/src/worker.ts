import { initializeOpenCascade, OCC } from '@jupytercad/opencascade';

import WorkerHandler from './actions';
import { IDict, IWorkerMessage } from './types';
import { IMainMessage, MainAction, WorkerAction } from '@jupytercad/schema';
import { initShapesFactory } from './occapi';

let occ: OCC.OpenCascadeInstance;
const ports: IDict<MessagePort> = {};
console.log('Initializing OCC...');

initializeOpenCascade().then(occInstance => {
  console.log('Done111!');
  occ = occInstance;

  (self as any).occ = occ;
  initShapesFactory();
  for (const id of Object.keys(ports)) {
    sendToMain({ action: MainAction.INITIALIZED, payload: false }, id);
  }
});

const registerWorker = async (id: string, port: MessagePort) => {
  ports[id] = port;
  if (occ) {
    sendToMain({ action: MainAction.INITIALIZED, payload: false }, id);
  }
};

const sendToMain = (msg: IMainMessage, id: string) => {
  if (id in ports) {
    ports[id].postMessage(msg);
  }
};

self.onmessage = async (event: MessageEvent): Promise<void> => {
  const message = event.data as IWorkerMessage;
  const { id } = message;

  switch (message.action) {
    case WorkerAction.REGISTER: {
      const port = event.ports[0];
      await registerWorker(id, port);
      break;
    }
    case WorkerAction.LOAD_FILE: {
      const result = WorkerHandler[message.action](message.payload);

      sendToMain(
        {
          action: MainAction.DISPLAY_SHAPE,
          payload: result
        },
        id
      );
      break;
    }
  }
};
