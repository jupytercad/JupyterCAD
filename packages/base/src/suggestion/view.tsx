import { IAnnotationModel } from '@jupytercad/schema';
import * as React from 'react';

interface IAnnotationProps {
  itemId: string;
  model: IAnnotationModel;
  children?: JSX.Element[] | JSX.Element;
}

export const Suggestion = (props: IAnnotationProps): JSX.Element => {
  return <div className="jcad-Annotation">{props.children}</div>;
};
