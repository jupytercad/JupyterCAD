import { Menu } from '@lumino/widgets';

/**
 * A concrete implementation of a help menu.
 */
export class HelpMenu extends Menu {
  /**
   * Construct a help menu.
   *
   * @param options The instantiation options for a HelpMenu.
   */
  constructor(options: Menu.IOptions) {
    super(options);

    this.title.label = 'Help';
  }
}
