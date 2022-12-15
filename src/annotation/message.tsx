import { User } from '@jupyterlab/services';
import * as React from 'react';

interface IProps {
  message: string;
  index: number;
  user?: User.IIdentity;
}

export const Message = (props: IProps): JSX.Element => {
  const { index, message, user } = props;
  const color = user?.color ?? 'black';
  const author = user?.display_name ?? '';
  const initials = user?.initials ?? '';
  return (
    <div
      className="jcad-Annotation-Message"
      style={{
        flexFlow: index % 2 === 0 ? 'row' : 'row-reverse'
      }}
    >
      <div
        className="jcad-Annotation-User-Icon"
        style={{
          backgroundColor: color
        }}
        title={author}
      >
        <span style={{ width: 24, textAlign: 'center' }}>{initials}</span>
      </div>
      <div className="jcad-Annotation-Message-Content">
        <p style={{ padding: 7, margin: 0 }}>{message}</p>
      </div>
    </div>
  );
};
