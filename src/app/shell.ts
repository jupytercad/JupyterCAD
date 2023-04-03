import {
  BoxPanel,
  Panel,
  Widget,
  BoxLayout,
  TabBar,
  StackedPanel,
  Title,
  SplitPanel
} from '@lumino/widgets';

import { ArrayExt, find } from '@lumino/algorithm';

import { ISignal, Signal } from '@lumino/signaling';

import { JupyterFrontEnd } from '@jupyterlab/application';

import {
  classes,
  DockPanelSvg,
  LabIcon,
  tabIcon
} from '@jupyterlab/ui-components';
import { DocumentRegistry } from '@jupyterlab/docregistry';

export type IShell = Shell;

/**
 * A namespace for Shell statics
 */
export namespace IShell {
  /**
   * The areas of the application shell where widgets can reside.
   */
  export type Area = 'main' | 'top' | 'left' | 'right';
}

/**
 * The class name added to side bar instances.
 */
const SIDEBAR_CLASS = 'jp-SideBar';

/**
 * The application shell.
 */
export class Shell extends Widget implements JupyterFrontEnd.IShell {
  constructor() {
    super();
    this.id = 'main';

    const rootLayout = new BoxLayout();
    // rootLayout.direction = 'top-to-bottom';

    this._top = new Panel();
    this._top.id = 'jp-top-panel';

    this._main = new DockPanelSvg();

    const hboxPanel = new BoxPanel();
    hboxPanel.direction = 'left-to-right';
    hboxPanel.spacing = 0;
    hboxPanel.id = 'jp-main-content-panel';

    const splitPanel = new SplitPanel();
    splitPanel.orientation = 'horizontal';

    this._leftHandler = new SideBarHandler();
    this._rightHandler = new SideBarHandler();

    BoxPanel.setStretch(this._leftHandler.sideBar, 1);
    BoxPanel.setStretch(this._main, 4);
    BoxPanel.setStretch(this._rightHandler.sideBar, 1);

    splitPanel.addWidget(this._leftHandler.stackedPanel);
    splitPanel.addWidget(this._main);
    splitPanel.addWidget(this._rightHandler.stackedPanel);

    hboxPanel.addWidget(this._leftHandler.sideBar);
    hboxPanel.addWidget(splitPanel);
    hboxPanel.addWidget(this._rightHandler.sideBar);

    this._top.id = 'top-panel';
    this._main.id = 'main-panel';

    BoxLayout.setStretch(this._top, 1);
    BoxLayout.setStretch(hboxPanel, 30);

    this._main.spacing = 5;

    rootLayout.spacing = 0;

    rootLayout.addWidget(this._top);
    rootLayout.addWidget(hboxPanel);
    // rootLayout.addWidget(this._main);

    this._leftHandler.show();
    this._rightHandler.show();
    this._leftHandler.expand();
    this._rightHandler.expand();

    this._leftHandler.sideBar.addClass(SIDEBAR_CLASS);
    this._leftHandler.sideBar.addClass('jp-mod-left');
    this._leftHandler.sideBar.node.setAttribute('role', 'complementary');
    this._leftHandler.stackedPanel.id = 'jp-left-stack';

    this._rightHandler.sideBar.addClass(SIDEBAR_CLASS);
    this._rightHandler.sideBar.addClass('jp-mod-right');
    this._rightHandler.sideBar.node.setAttribute('role', 'complementary');
    this._rightHandler.stackedPanel.id = 'jp-right-stack';

    this.layout = rootLayout;
  }

  activateById(id: string): void {
    // no-op
  }

  /**
   * Add a widget to the application shell.
   *
   * @param widget - The widget being added.
   *
   * @param area - Optional region in the shell into which the widget should
   * be added.
   *
   */
  add(
    widget: Widget,
    area?: IShell.Area,
    options?: DocumentRegistry.IOpenOptions
  ): void {
    if (area === 'top') {
      return this._top.addWidget(widget);
    }
    if (area === 'left') {
      return this._leftHandler.addWidget(widget, options?.rank || 0);
    }
    if (area === 'right') {
      return this._rightHandler.addWidget(widget, options?.rank || 0);
    }
    return this._addToMainArea(widget);
  }

  /**
   * The current widget in the shell's main area.
   */
  get currentWidget(): Widget {
    // TODO: use a focus tracker to return the current widget
    return this._main.widgets()[0];
  }

  widgets(area: IShell.Area): IterableIterator<Widget> {
    if (area === 'top') {
      return this._top.children();
    }
    return this._main.widgets();
  }

  /**
   * Add a widget to the main content area.
   *
   * @param widget The widget to add.
   */
  private _addToMainArea(widget: Widget): void {
    if (!widget.id) {
      console.error(
        'Widgets added to the app shell must have unique id property.'
      );
      return;
    }

    const dock = this._main;

    const { title } = widget;
    title.dataset = { ...title.dataset, id: widget.id };

    if (title.icon instanceof LabIcon) {
      // bind an appropriate style to the icon
      title.icon = title.icon.bindprops({
        stylesheet: 'mainAreaTab'
      });
    } else if (typeof title.icon === 'string' || !title.icon) {
      // add some classes to help with displaying css background imgs
      title.iconClass = classes(title.iconClass, 'jp-Icon');
    }

    dock.addWidget(widget, { mode: 'tab-after' });
    dock.activateWidget(widget);
  }

  private _main: DockPanelSvg;
  private _top: Panel;
  private _leftHandler: SideBarHandler;
  private _rightHandler: SideBarHandler;
}

/**
 * A class which manages a side bar and related stacked panel.
 */
export class SideBarHandler {
  /**
   * Construct a new side bar handler.
   */
  constructor() {
    this._sideBar = new TabBar<Widget>({
      insertBehavior: 'none',
      removeBehavior: 'none',
      allowDeselect: true,
      orientation: 'vertical'
    });
    this._stackedPanel = new StackedPanel();
    this._sideBar.hide();
    this._stackedPanel.hide();
    this._lastCurrent = null;
    this._sideBar.currentChanged.connect(this._onCurrentChanged, this);
    this._sideBar.tabActivateRequested.connect(
      this._onTabActivateRequested,
      this
    );
    this._stackedPanel.widgetRemoved.connect(this._onWidgetRemoved, this);
  }

  /**
   * Whether the side bar is visible
   */
  get isVisible(): boolean {
    return this._sideBar.isVisible;
  }

  /**
   * Get the tab bar managed by the handler.
   */
  get sideBar(): TabBar<Widget> {
    return this._sideBar;
  }

  /**
   * Get the stacked panel managed by the handler
   */
  get stackedPanel(): StackedPanel {
    return this._stackedPanel;
  }

  /**
   * Signal fires when the stack panel or the sidebar changes
   */
  get updated(): ISignal<SideBarHandler, void> {
    return this._updated;
  }

  /**
   * Expand the sidebar.
   *
   * #### Notes
   * This will open the most recently used tab, or the first tab
   * if there is no most recently used.
   */
  expand(): void {
    const previous =
      this._lastCurrent || (this._items.length > 0 && this._items[0].widget);
    if (previous) {
      this.activate(previous.id);
    }
  }

  /**
   * Activate a widget residing in the side bar by ID.
   *
   * @param id - The widget's unique ID.
   */
  activate(id: string): void {
    const widget = this._findWidgetByID(id);
    if (widget) {
      this._sideBar.currentTitle = widget.title;
      widget.activate();
    }
  }

  /**
   * Test whether the sidebar has the given widget by id.
   */
  has(id: string): boolean {
    return this._findWidgetByID(id) !== null;
  }

  /**
   * Collapse the sidebar so no items are expanded.
   */
  collapse(): void {
    this._sideBar.currentTitle = null;
  }

  /**
   * Add a widget and its title to the stacked panel and side bar.
   *
   * If the widget is already added, it will be moved.
   */
  addWidget(widget: Widget, rank: number): void {
    widget.parent = null;
    widget.hide();
    const item = { widget, rank };
    const index = this._findInsertIndex(item);
    ArrayExt.insert(this._items, index, item);
    this._stackedPanel.insertWidget(index, widget);
    const title = this._sideBar.insertTab(index, widget.title);
    // Store the parent id in the title dataset
    // in order to dispatch click events to the right widget.
    title.dataset = { id: widget.id };

    if (title.icon instanceof LabIcon) {
      // bind an appropriate style to the icon
      title.icon = title.icon.bindprops({
        stylesheet: 'sideBar'
      });
    } else if (typeof title.icon === 'string' && title.icon != '') {
      // add some classes to help with displaying css background imgs
      title.iconClass = classes(title.iconClass, 'jp-Icon', 'jp-Icon-20');
    } else if (!title.icon && !title.label) {
      // add a fallback icon if there is no title label nor icon
      title.icon = tabIcon.bindprops({
        stylesheet: 'sideBar'
      });
    }

    this._refreshVisibility();
  }

  /**
   * Hide the side bar even if it contains widgets
   */
  hide(): void {
    this._isHiddenByUser = true;
    this._refreshVisibility();
  }

  /**
   * Show the side bar if it contains widgets
   */
  show(): void {
    this._isHiddenByUser = false;
    this._refreshVisibility();
  }

  /**
   * Find the insertion index for a rank item.
   */
  private _findInsertIndex(item: IRankItem): number {
    return ArrayExt.upperBound(this._items, item, itemCmp);
  }

  /**
   * Find the index of the item with the given widget, or `-1`.
   */
  private _findWidgetIndex(widget: Widget): number {
    return ArrayExt.findFirstIndex(this._items, i => i.widget === widget);
  }

  /**
   * Find the widget which owns the given title, or `null`.
   */
  private _findWidgetByTitle(title: Title<Widget>): Widget | null {
    const item = find(this._items, value => value.widget.title === title);
    return item ? item.widget : null;
  }

  /**
   * Find the widget with the given id, or `null`.
   */
  private _findWidgetByID(id: string): Widget | null {
    const item = find(this._items, value => value.widget.id === id);
    return item ? item.widget : null;
  }

  /**
   * Refresh the visibility of the side bar and stacked panel.
   */
  private _refreshVisibility(): void {
    this._stackedPanel.setHidden(this._sideBar.currentTitle === null);
    this._sideBar.setHidden(
      this._isHiddenByUser || this._sideBar.titles.length === 0
    );
    this._updated.emit();
  }

  /**
   * Handle the `currentChanged` signal from the sidebar.
   */
  private _onCurrentChanged(
    sender: TabBar<Widget>,
    args: TabBar.ICurrentChangedArgs<Widget>
  ): void {
    const oldWidget = args.previousTitle
      ? this._findWidgetByTitle(args.previousTitle)
      : null;
    const newWidget = args.currentTitle
      ? this._findWidgetByTitle(args.currentTitle)
      : null;
    if (oldWidget) {
      oldWidget.hide();
    }
    if (newWidget) {
      newWidget.show();
    }
    this._lastCurrent = newWidget || oldWidget;
    this._refreshVisibility();
  }

  /**
   * Handle a `tabActivateRequest` signal from the sidebar.
   */
  private _onTabActivateRequested(
    sender: TabBar<Widget>,
    args: TabBar.ITabActivateRequestedArgs<Widget>
  ): void {
    args.title.owner.activate();
  }

  /*
   * Handle the `widgetRemoved` signal from the stacked panel.
   */
  private _onWidgetRemoved(sender: StackedPanel, widget: Widget): void {
    if (widget === this._lastCurrent) {
      this._lastCurrent = null;
    }
    ArrayExt.removeAt(this._items, this._findWidgetIndex(widget));
    this._sideBar.removeTab(widget.title);
    this._refreshVisibility();
  }

  private _isHiddenByUser = false;
  private _items = new Array<IRankItem>();
  private _sideBar: TabBar<Widget>;
  private _stackedPanel: StackedPanel;
  private _lastCurrent: Widget | null;
  private _updated: Signal<SideBarHandler, void> = new Signal(this);
}

/**
 * An object which holds a widget and its sort rank.
 */
export interface IRankItem {
  /**
   * The widget for the item.
   */
  widget: Widget;

  /**
   * The sort rank of the widget.
   */
  rank: number;
}

/**
 * A less-than comparison function for side bar rank items.
 */
export function itemCmp(first: IRankItem, second: IRankItem): number {
  return first.rank - second.rank;
}
