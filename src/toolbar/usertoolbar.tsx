import * as React from 'react';
import {User} from '@jupyterlab/services'
import { ToolbarModel } from './model';
// import { Button } from '@jupyterlab/ui-components';
// import { IDict } from '../types';
// import { FormDialog } from './formdialog';
// import * as Y from 'yjs';
interface IProps {
  toolbarModel: ToolbarModel;
}

interface IState {
  userList: Map<number, User.IIdentity>
}

export class UserToolbarReact extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this._model = props.toolbarModel
    this.state = {userList: new Map()}
    this._model.ready().then(()=>{
      console.log(this._model.users);
      this.setState(old =>({..old, userList: this._model.users}))
    })
  }

  render(): React.ReactNode {
    
    return (
      <div className='jpcad-toolbar-usertoolbar'>
        
      </div>
    );
  }

  private _model: ToolbarModel
}
