import { IDict } from '../types';

export type IWidgetMessageAction = 'add_object' | 'remove_object';

export interface IWidgetMessage {
  action: IWidgetMessageAction;
  payload: IDict;
}
