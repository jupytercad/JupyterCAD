import { Widget } from '@lumino/widgets';

export class AppTitle extends Widget {
  constructor() {
    super();
    this.addClass('jc-MainMenu-AppTitle');
    this.node.innerHTML = 'JupyterCAD';
  }
}
