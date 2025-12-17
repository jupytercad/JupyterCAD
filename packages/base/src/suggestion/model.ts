import {
  IJupyterCadDoc,
  IJupyterCadModel,
  IJupyterCadTracker,
  IUserData
} from '@jupytercad/schema';
import { ISignal, Signal } from '@lumino/signaling';
import {
  IAllForksResponse,
  IForkChangedEvent,
  IForkCreationResponse,
  IForkManager,
  IForkProvider,
  ISessionModel,
  requestDocSession
} from '@jupyter/docprovider';
import { ICollaborativeContentProvider } from '@jupyter/collaborative-drive';

export class SuggestionModel {
  constructor(options: SuggestionModel.IOptions) {
    const {
      tracker,
      forkManager,
      filePath,
      jupytercadModel,
      collaborativeContentProvider
    } = options;
    this._tracker = tracker;
    this._forkManager = forkManager;
    this._contentProvider = collaborativeContentProvider;
    this.switchContext({
      filePath,
      jupytercadModel
    });
    this._forkManager.forkAdded.connect(this._handleForkAdded, this);
    this._forkManager.forkDeleted.connect(this._handleForkDeleted, this);
  }

  get currentForkId(): string | undefined {
    return this._currentForkId;
  }

  get title(): string {
    const pathComponents = this._filePath?.split(':') ?? [];
    return pathComponents.length > 1 ? pathComponents[1] : pathComponents[0];
  }

  get allForks(): IAllForksResponse {
    return this._allForks;
  }

  get forksUpdated(): ISignal<SuggestionModel, void> {
    return this._forksUpdated;
  }
  get forkSwitched(): ISignal<SuggestionModel, string | undefined> {
    return this._forkSwitched;
  }
  get contextChanged(): ISignal<SuggestionModel, void> {
    return this._contextChanged;
  }

  get currentUser(): IUserData | undefined {
    return this._currentUser;
  }
  async switchContext(context: {
    filePath: string;
    jupytercadModel: IJupyterCadModel | undefined;
  }): Promise<void> {
    this._filePath = context.filePath;
    this._jupytercadModel = context.jupytercadModel;
    if (!this._jupytercadModel) {
      this._allForks = {};
    }
    if (this._filePath && this._filePath.length > 0) {
      const session = (this._currentSession = await requestDocSession(
        'text',
        'jcad',
        this._filePath
      ));
      this._forkProvider = this._forkManager.getProvider({
        documentPath: this._filePath,
        format: session.format!,
        type: session.type
      });
      this._rootDocId = `${session.format}:${session.type}:${session.fileId}`;
      this._allForks = await this._forkManager.getAllForks(this._rootDocId);
      this._currentForkId = undefined;
      this._forkSwitched.emit(undefined);
    }

    if (this._jupytercadModel?.currentUserId) {
      const matched = (this._jupytercadModel?.users ?? []).filter(
        it => it.userId === this._jupytercadModel!.currentUserId
      );
      if (matched[0]) {
        this._currentUser = matched[0];
      }
    }

    this._contextChanged.emit();
  }

  async mergeFork(forkId: string): Promise<void> {
    await this._forkManager.deleteFork({ forkId, merge: true });
    await this._forkProvider?.reconnect();
    this._toggleSplitScreen(false);
    this._currentForkId = undefined;
    this._forkSwitched.emit(undefined);
  }
  async deleteFork(forkId: string): Promise<void> {
    await this._forkManager.deleteFork({
      forkId,
      merge: false
    });
  }
  async createFork(title?: string): Promise<IForkCreationResponse | undefined> {
    if (this._rootDocId) {
      const now = new Date(Date.now());
      const meta = {
        timestamp: now.toLocaleString(),
        author: this._currentUser?.userData
      };
      try {
        const res = await this._forkManager.createFork({
          rootId: this._rootDocId,
          synchronize: false,
          title,
          description: JSON.stringify(meta)
        });
        if (res) {
          this.checkoutFork(res.fork_roomid);
        }
        return res;
      } catch (e) {
        console.error(e);
      }
    }
  }

  async backToRoot(removeSplitView = false): Promise<void> {
    if (!this._currentForkId) {
      return;
    }
    this._jupytercadModel?.sharedModel.dispose();
    if (this._contentProvider && this._currentSession && this._filePath) {
      const currentSharedModel =
        this._contentProvider.sharedModelFactory.createNew({
          path: this._filePath,
          format: this._currentSession.format,
          contentType: this._currentSession.type,
          collaborative: true
        });

      if (currentSharedModel) {
        this._jupytercadModel?.swapSharedModel(
          currentSharedModel as IJupyterCadDoc
        );
      }
      this._forkProvider = this._forkManager.getProvider({
        documentPath: this._filePath,
        format: this._currentSession.format!,
        type: this._currentSession.type
      });
      await (this._forkProvider as any).ready;
      if (removeSplitView) {
        this._toggleSplitScreen(false);
      }
      this._currentForkId = undefined;
      this._forkSwitched.emit(undefined);
    }
  }

  async checkoutFork(forkId: string): Promise<void> {
    let enableSplitView = true;
    if (this._currentForkId === forkId) {
      return;
    }

    if (this._currentSession) {
      if (this._currentForkId) {
        enableSplitView = false;
        await this.backToRoot();
      }
      await this._forkProvider?.connectToForkDoc(
        forkId,
        this._currentSession.sessionId
      );
      if (enableSplitView) {
        this._toggleSplitScreen(true);
      }
      this._currentForkId = forkId;
      this._forkSwitched.emit(forkId);
    }
  }
  private _toggleSplitScreen(enabled: boolean): void {
    const current = this._tracker.currentWidget as any;

    if (!current) {
      return;
    }
    if (current.content.splitScreen) {
      current.content.splitScreen = {
        enabled
      };
    }
  }

  private async _handleForkDeleted(
    _: IForkManager,
    changes: IForkChangedEvent
  ) {
    if (this._rootDocId && changes.fork_info.root_roomid === this._rootDocId) {
      this._allForks = await this._forkManager.getAllForks(this._rootDocId);
      this._forksUpdated.emit();
      if (this._currentForkId && changes.fork_roomid === this._currentForkId) {
        this.backToRoot(true);
      }
    }
  }
  private async _handleForkAdded(_: IForkManager, changes: IForkChangedEvent) {
    if (this._rootDocId && changes.fork_info.root_roomid === this._rootDocId) {
      this._allForks = await this._forkManager.getAllForks(this._rootDocId);
      this._forksUpdated.emit();
    }
  }
  private _jupytercadModel: IJupyterCadModel | undefined;
  private _allForks: IAllForksResponse = {};
  private _forksUpdated: Signal<this, void> = new Signal(this);
  private _forkSwitched: Signal<this, string | undefined> = new Signal(this);
  private _contextChanged: Signal<this, void> = new Signal(this);
  private _filePath: string | undefined;
  private _rootDocId: string | undefined;
  private _tracker: IJupyterCadTracker;
  private _forkManager: IForkManager;
  private _forkProvider?: IForkProvider;
  private _currentSession?: ISessionModel;
  private _contentProvider?: ICollaborativeContentProvider;
  private _currentForkId: string | undefined;
  private _currentUser?: IUserData;
}

namespace SuggestionModel {
  export interface IOptions {
    jupytercadModel: IJupyterCadModel | undefined;
    filePath: string;
    tracker: IJupyterCadTracker;
    forkManager: IForkManager;
    collaborativeContentProvider?: ICollaborativeContentProvider;
  }
}
