import { caretRightIcon } from '@jupyterlab/ui-components';
import * as React from 'react';

import { Message } from './message';
import { IAnnotationModel } from '../types';

interface IAnnotationProps {
  itemId: string;
  model: IAnnotationModel;
  children?: JSX.Element[] | JSX.Element;
}

interface IFloatingAnnotationProps extends IAnnotationProps {
  open: boolean;
}


export const Annotation = (props: IAnnotationProps): JSX.Element => {
  const { itemId, model } = props;
  const annotation = model.getAnnotation(itemId);
  const contents = React.useMemo(
    () => annotation?.contents ?? [],
    [annotation]
  );

  const [messageContent, setMessageContent] = React.useState<string>('');

  if (!annotation) {
    return <div></div>;
  }

  const submitMessage = () => {
    model.addContent(itemId, messageContent);
    setMessageContent('');
  };

  return (
    <div
      className="jcad-Annotation"
    >
      {props.children}
      <div style={{ paddingBottom: 10, maxHeight: 400, overflow: 'auto' }}>
        {contents.map(content => {
          return (
            <Message
              user={content.user}
              message={content.value}
              self={model.user?.username === content.user?.username}
            />
          );
        })}
      </div>
      <div className="jcad-Annotation-Message">
        <textarea
          rows={3}
          placeholder={'Ctrl+Enter to submit'}
          value={messageContent}
          onChange={e => setMessageContent(e.currentTarget.value)}
          onKeyDown={e => {
            if (e.ctrlKey && e.key === 'Enter') {
              submitMessage();
            }
          }}
        />
        <div onClick={submitMessage}>
          <caretRightIcon.react className="jcad-Annotation-Submit" />
        </div>
      </div>
    </div>
  );
};


export const FloatingAnnotation = (props: IFloatingAnnotationProps): JSX.Element => {
  const { itemId, model } = props;

  const [open, setOpen] = React.useState(props.open);

  return (
    <div>
      <div
        className="jcad-Annotation-Handler"
        onClick={() => setOpen(!open)}
      ></div>
      <div
        className='jcad-FloatingAnnotation'
        style={{ visibility: open ? 'visible' : 'hidden' }}
      >
        <Annotation
          model={model}
          itemId={itemId}
        >
          <div
            className="jcad-Annotation-CloseHandler"
            onClick={() => {
              model.removeAnnotation(itemId);
            }}
          />
        </Annotation>
      </div>
    </div>
  );
}
