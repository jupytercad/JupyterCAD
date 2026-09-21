import { collaboratorPill } from '@jupyter/collaboration';
import { IDict } from '@jupytercad/schema';
import { User } from '@jupyterlab/services';
import * as React from 'react';
import * as THREE from 'three';

export interface ICollaboratorPointer {
  user: User.IIdentity;
  position: THREE.Vector2;
}

interface IProps {
  clients: IDict<ICollaboratorPointer>;
}

const CollaboratorPill = (props: { user: User.IIdentity }): JSX.Element => {
  const { user } = props;
  const host = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    host.current?.replaceChildren(collaboratorPill(user));
  }, [user]);

  return <div className="jcad-Remote-Pointer-Pill-Host" ref={host} />;
};

export const CollaboratorPointers = (props: IProps): JSX.Element => {
  return (
    <>
      {Object.entries(props.clients).map(([clientId, { user, position }]) => (
        <div
          key={clientId}
          id={`jcad-remote-pointer-${clientId}`}
          className="jcad-Remote-Pointer"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`
          }}
        >
          <CollaboratorPill user={user} />
        </div>
      ))}
    </>
  );
};
