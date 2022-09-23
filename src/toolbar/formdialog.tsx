import * as React from 'react';
import { Dialog } from '@jupyterlab/apputils';
import { ObjectPropertiesForm } from '../panelview/formbuilder';
import { IDict } from '../types';

export interface IFormDialogOptions {
  schema: IDict;
  sourceData: IDict;
  syncData: (props: IDict) => void;
  cancelButton: boolean;
  title: string;
}

export class FormDialog extends Dialog<IDict> {
  constructor(options: IFormDialogOptions) {
    let cancelCallback: (() => void) | undefined = undefined;
    if (options.cancelButton) {
      cancelCallback = () => this.resolve(0);
    }
    const body = (
      <div style={{ maxWidth: '600px', overflow: 'hidden' }}>
        <ObjectPropertiesForm
          sourceData={options.sourceData}
          schema={options.schema}
          syncData={options.syncData}
          cancel={cancelCallback}
        />
      </div>
    );
    super({ title: options.title, body, buttons: [Dialog.cancelButton()] });
    this.addClass('jpcad-property-FormDialog');
  }
}
