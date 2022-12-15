import { caretRightIcon } from '@jupyterlab/ui-components';
import * as React from 'react';

import { Message } from './message';
import { AnnotationModel } from './model';

interface IProps {
  itemId: string;
  model: AnnotationModel;
  open: boolean;
}

export const Annotation = (props: IProps): JSX.Element => {
  const { itemId, model } = props;
  const annotation = model.getAnnotation(itemId);
  const contents = React.useMemo(
    () => annotation?.contents ?? [],
    [annotation]
  );

  const [open, setOpen] = React.useState(props.open);
  const [messageContent, setMessageContent] = React.useState<string>('');

  if (!annotation) {
    return <div></div>;
  }
  const submitMessage = () => {
    model.addContent(itemId, messageContent);
    setMessageContent('');
  };
  return (
    <div>
      <div
        className="jcad-Annotation-Handler"
        onClick={() => setOpen(!open)}
      ></div>
      <div
        className="jcad-Annotation"
        style={{ visibility: open ? 'visible' : 'hidden' }}
      >
        <div
          className="jcad-Annotation-CloseHandler"
          onClick={() => {
            model.removeAnnotation(itemId);
          }}
        />
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
    </div>
  );
};
