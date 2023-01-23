import { IDict } from '../types';

export type IWidgetMessageAction = 'connect_room' | 'disconnect_room';

export interface IWidgetMessage {
  action: IWidgetMessageAction;
  payload: IDict;
}
