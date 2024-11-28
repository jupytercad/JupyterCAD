import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';
import { ISubmitEvent } from '@rjsf/core';
import * as React from 'react';
import { FormComponent } from '@jupyterlab/ui-components';
import validatorAjv8 from '@rjsf/validator-ajv8';
import { IDict } from '../types';

interface IStates {
  internalData?: IDict;
  schema?: IDict;
}
interface IProps {
  parentType: 'dialog' | 'panel';
  sourceData: IDict | undefined;
  filePath?: string;
  syncData: (properties: IDict) => void;
  syncSelectedField?: (
    id: string | null,
    value: any,
    parentType: 'panel' | 'dialog'
  ) => void;
  schema?: IDict;
  cancel?: () => void;
}

// Wrap FormComponent to ensure validator integration
const WrappedFormComponent = (props: any): JSX.Element => {
  return <FormComponent {...props} validator={validatorAjv8} />;
};

// Reusing the datalayer/jupyter-react component:
// https://github.com/datalayer/jupyter-react/blob/main/packages/react/src/jupyter/lumino/Lumino.tsx
export const LuminoForm = (
  props: React.PropsWithChildren<any>
): JSX.Element => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { children } = props;
  React.useEffect(() => {
    const widget = children as Widget;
    try {
      MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
      ref.current!.insertBefore(widget.node, null);
      MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
    } catch (e) {
      console.warn('Exception while attaching Lumino widget.', e);
    }
    return () => {
      try {
        if (widget.isAttached || widget.node.isConnected) {
          Widget.detach(widget);
        }
      } catch (e) {
        // The widget is destroyed already by React.
      }
    };
  }, [children]);
  return <div ref={ref} />;
};

export class ObjectPropertiesForm extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      internalData: { ...this.props.sourceData },
      schema: props.schema
    };
  }

  setStateByKey = (key: string, value: any): void => {
    const floatValue = parseFloat(value);
    if (Number.isNaN(floatValue)) {
      return;
    }
    this.setState(
      old => ({
        ...old,
        internalData: { ...old.internalData, [key]: floatValue }
      }),
      () => this.props.syncData({ [key]: floatValue })
    );
  };

  componentDidUpdate(prevProps: IProps): void {
    if (prevProps.sourceData !== this.props.sourceData) {
      this.setState(old => ({ ...old, internalData: this.props.sourceData }));
    }
  }

  generateUiSchema(schema: IDict): IDict {
    const uiSchema: IDict = {
      additionalProperties: {
        'ui:label': false,
        classNames: 'jpcad-hidden-field'
      }
    };

    const processSchema = (currentSchema: IDict, ui: IDict): void => {
      Object.entries(currentSchema['properties'] || {}).forEach(
        ([key, value]) => {
          if (typeof value === 'object' && value !== null && 'type' in value) {
            const property = value as { type: string };
            if (property.type === 'array') {
              ui[key] = {
                'ui:options': {
                  orderable: false,
                  removable: false,
                  addable: false
                }
              };
            } else if (property.type === 'object') {
              ui[key] = {};
              processSchema(property, ui[key]); 
            }
          }
        }
      );
    };

    processSchema(schema, uiSchema);
    return uiSchema;
  }

  onFormSubmit = (e: ISubmitEvent<any>): void => {
    const internalData = { ...this.state.internalData };
    Object.entries(e.formData).forEach(([k, v]) => (internalData[k] = v));
    this.setState(
      old => ({
        ...old,
        internalData
      }),
      () => {
        this.props.syncData(e.formData);
        this.props.cancel && this.props.cancel();
      }
    );
  };

  render(): React.ReactNode {
    const { schema, internalData } = this.state;
    const uiSchema = this.generateUiSchema(this.props.schema || {});

    if (!schema) {
      return <div>No Schema Available</div>;
    }

    return (
      <div
        className="jpcad-property-panel"
        data-path={this.props.filePath ?? ''}
      >
        <WrappedFormComponent
          schema={schema}
          uiSchema={uiSchema}
          formData={internalData}
          onChange={(e: ISubmitEvent<any>) => this.props.syncData(e.formData)}
          onSubmit={this.onFormSubmit}
          liveValidate
        />
        <div className="jpcad-property-buttons">
          {this.props.cancel ? (
            <button
              className="jp-Dialog-button jp-mod-reject jp-mod-styled"
              onClick={this.props.cancel}
            >
              <div className="jp-Dialog-buttonLabel">Cancel</div>
            </button>
          ) : null}

          <button
            className="jp-Dialog-button jp-mod-accept jp-mod-styled"
            type="submit"
          >
            <div className="jp-Dialog-buttonLabel">Submit</div>
          </button>
        </div>
      </div>
    );
  }
}
