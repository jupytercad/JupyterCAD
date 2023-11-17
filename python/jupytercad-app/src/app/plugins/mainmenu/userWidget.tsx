import { User } from '@jupyterlab/services';
import { Widget } from '@lumino/widgets';
export class UserMenu extends Widget {
  constructor(options: { user: User.IManager }) {
    super();
    this._user = options.user;
    this._user.ready.then(() => this._createUserIcon());
  }

  private _createUserIcon(): void {
    const userData = this._user.identity;
    if (!userData) {
      return;
    }
    const nameEl = document.createElement('span');

    nameEl.innerText = userData.display_name;
    this.node.appendChild(nameEl);
    const iconEl = document.createElement('div');
    iconEl.classList.add('lm-MenuBar-itemIcon');
    iconEl.title = userData.display_name;

    if (userData?.avatar_url) {
      iconEl.classList.add('jp-MenuBar-imageIcon');
      const img = document.createElement('img');
      img.src = userData.avatar_url;
      iconEl.appendChild(img);
    } else {
      iconEl.classList.add('jc-MenuBar-anonymousIcon');
      iconEl.style.backgroundColor = userData.color;
      const sp = document.createElement('span');
      sp.innerText = userData.initials;
      iconEl.appendChild(sp);
    }

    this.node.appendChild(iconEl);
  }

  private _user: User.IManager;
}
