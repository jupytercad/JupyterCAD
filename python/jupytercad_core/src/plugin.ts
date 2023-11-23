import { AnnotationModel, JupyterCadWidget } from '@jupytercad/base';
import { OCC_WORKER_ID, OccWorker } from '@jupytercad/occ-worker';
import {
  IAnnotationModel,
  IAnnotationToken,
  IJCadWorkerRegistry,
  IJCadWorkerRegistryToken,
  IJupyterCadDocTracker,
  IJupyterCadTracker
} from '@jupytercad/schema';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ITranslator } from '@jupyterlab/translation';

import { JupyterCadWorkerRegistry } from './workerregistry';

const NAME_SPACE = 'jupytercad';

export const trackerPlugin: JupyterFrontEndPlugin<IJupyterCadTracker> = {
  id: 'jupytercad:core:tracker',
  autoStart: true,
  requires: [ITranslator],
  optional: [IMainMenu],
  provides: IJupyterCadDocTracker,
  activate: (
    app: JupyterFrontEnd,
    translator: ITranslator,
    mainMenu?: IMainMenu
  ): IJupyterCadTracker => {
    const tracker = new WidgetTracker<JupyterCadWidget>({
      namespace: NAME_SPACE
    });
    console.log('jupytercad:core:tracker is activated!');
    return tracker;
  }
};

export const annotationPlugin: JupyterFrontEndPlugin<IAnnotationModel> = {
  id: 'jupytercad:core:annotation',
  autoStart: true,
  requires: [IJupyterCadDocTracker],
  provides: IAnnotationToken,
  activate: (app: JupyterFrontEnd, tracker: IJupyterCadTracker) => {
    const annotationModel = new AnnotationModel({
      context: tracker.currentWidget?.context
    });

    tracker.currentChanged.connect((_, changed) => {
      annotationModel.context = changed?.context || undefined;
    });
    return annotationModel;
  }
};

export const workerRegistryPlugin: JupyterFrontEndPlugin<IJCadWorkerRegistry> =
  {
    id: 'jupytercad:core:worker-registry',
    autoStart: true,
    requires: [],
    provides: IJCadWorkerRegistryToken,
    activate: (app: JupyterFrontEnd): IJCadWorkerRegistry => {
      const workerRegistry = new JupyterCadWorkerRegistry();
      const worker = new Worker(
        new URL('@jupytercad/occ-worker/lib/worker', (import.meta as any).url)
      );
      const occWorker = new OccWorker({ worker });
      workerRegistry.registerWorker(OCC_WORKER_ID, occWorker);
      return workerRegistry;
    }
  };
