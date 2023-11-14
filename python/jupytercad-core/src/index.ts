import {
  AnnotationModel,
  IAnnotationToken,
  IJupyterCadDocTracker,
  IJupyterCadTracker,
  JupyterCadWidget
} from '@jupytercad/base';
import { IAnnotationModel, JupyterCadModel } from '@jupytercad/schema';
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { WidgetTracker } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ITranslator } from '@jupyterlab/translation';

const NAME_SPACE = 'jupytercad';

const plugin: JupyterFrontEndPlugin<IJupyterCadTracker> = {
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
    // TODO create worker registry
    JupyterCadModel.worker = new Worker(
      new URL('@jupytercad/occ-worker/lib/worker', (import.meta as any).url)
    );

    console.log('jupytercad:core:tracker is activated!');

    /**
     * @TODO Move commands to jupytercad-lab package
     */

    /**
     * Whether there is an active notebook.
     */
    // const isEnabled = (): boolean => {
    //   return (
    //     tracker.currentWidget !== null &&
    //     tracker.currentWidget === app.shell.currentWidget
    //   );
    // };

    // addCommands(app, tracker, translator);
    // if (mainMenu) {
    //   populateMenus(mainMenu, isEnabled);
    // }

    return tracker;
  }
};

const annotationPlugin: JupyterFrontEndPlugin<IAnnotationModel> = {
  id: 'jupytercad:annotation',
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

export default [plugin, annotationPlugin];
