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

const CollaboratorAvatar = (props: { user: User.IIdentity }): JSX.Element => {
  const { user } = props;
  const [avatarFailed, setAvatarFailed] = React.useState(false);

  React.useEffect(() => setAvatarFailed(false), [user.avatar_url]);

  const showAvatar = !!user.avatar_url && !avatarFailed;

  return (
    <div
      className="jcad-Remote-Pointer-Avatar"
      style={{ backgroundColor: showAvatar ? undefined : user.color }}
      title={user.display_name}
    >
      {showAvatar ? (
        <img
          src={user.avatar_url}
          alt=""
          onError={() => setAvatarFailed(true)}
        />
      ) : (
        <span>{user.initials ?? ''}</span>
      )}
    </div>
  );
};

export const CollaboratorPointers = (props: IProps): JSX.Element => {
  return (
    <>
      {Object.entries(props.clients).map(([clientId, { user, position }]) => (
        <div
          key={clientId}
          id={`jcad-remote-pointer-${clientId}`}
          className="jcad-Remote-Pointer"
          style={{ left: position.x, top: position.y }}
        >
          <div
            className="jcad-Remote-Pointer-Label"
            style={{ borderColor: user.color }}
          >
            <CollaboratorAvatar user={user} />
            <span className="jcad-Remote-Pointer-Name">
              {user.display_name}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};
