import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  IAnnotationModel,
  IAnnotationToken,
  IJupyterCadDocTracker,
  IJupyterCadTracker,
  JupyterCadModel,
  AnnotationModel,
  JupyterCadWidget
} from '@jupytercad/jupytercad-extension';
import { ITranslator } from '@jupyterlab/translation';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { WidgetTracker } from '@jupyterlab/apputils';
const NAME_SPACE = 'jupytercad';

const plugin: JupyterFrontEndPlugin<IJupyterCadTracker> = {
  id: 'jupytercad:core-plugin',
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
      new URL(
        '@jupytercad/jupytercad-worker/lib/worker',
        (import.meta as any).url
      )
    );

    console.log('jupytercad:core-plugin is activated!');

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
