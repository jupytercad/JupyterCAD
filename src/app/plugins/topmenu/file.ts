import { Menu } from '@lumino/widgets';

/**
 * The File menu.
 */
export class FileMenu extends Menu {
  /**
   * Construct a file menu.
   *
   * @param options The instantiation options for a FileMenu.
   */
  constructor(options: Menu.IOptions) {
    super(options);

    this.title.label = 'File';
  }
}
