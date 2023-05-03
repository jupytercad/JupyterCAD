import { Widget } from '@lumino/widgets';

export class MainMenu extends Widget {
  constructor() {
    super();
    this.addClass('jcad-MainMenu');
    this.node.innerHTML = 'JupyterCAD';
  }
}
