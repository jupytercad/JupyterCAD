import * as React from 'react';
import { User } from '@jupyterlab/services';
interface IProps {
  remoteUser: User.IIdentity | null | undefined;
}
export function FollowIndicator(props: IProps) {
  return props.remoteUser?.display_name ? (
    <div
      style={{
        position: 'absolute',
        top: 1,
        right: 3,
        background: props.remoteUser.color
      }}
    >
      {`Following ${props.remoteUser.display_name}`}
    </div>
  ) : null;
}
