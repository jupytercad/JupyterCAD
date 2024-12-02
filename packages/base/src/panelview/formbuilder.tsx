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
const CustomArrayField = (props: any) => {
  const { formData, name, required, onChange, schema, errorSchema, onBlur } =
    props;
  const data = formData || [];

  return (
    <fieldset>
      <legend>
        {name}
        {required && <span className="required">*</span>}
      </legend>
      <p className="field-description">{schema.description}</p>
      <div className="custom-array-wrapper">
        {data.map((value: number | null, index: number) => (
          <div key={index} className="array-item">
            <input
              type="number"
              value={value === null ? '' : value}
              required={required}
              onChange={e => {
                const updatedValue = [...data];
                updatedValue[index] =
                  e.target.value === '' ? null : parseFloat(e.target.value);
                onChange(updatedValue);
              }}
              onBlur={() => onBlur(name, value)}
            />
          </div>
        ))}
      </div>

      {errorSchema?.__errors?.length > 0 && (
        <div className="validationErrors">
          {errorSchema.__errors.map((error: string, idx: number) => (
            <p key={idx}>{error}</p>
          ))}
        </div>
      )}
    </fieldset>
  );
};

const WrappedFormComponent = (props: any): JSX.Element => {
  const { fields, onSubmit, ...rest } = props;
  return (
    <FormComponent
      {...rest}
      validator={validatorAjv8}
      fields={{
        ...fields,
        ArrayField: CustomArrayField
      }}
      onSubmit={onSubmit}
    />
  );
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

    if (prevProps.schema !== this.props.schema) {
      this.setState(old => ({ ...old, schema: this.props.schema }));
    }
  }

  buildForm(): JSX.Element[] {
    if (!this.props.sourceData || !this.state.internalData) {
      return [];
    }
    const inputs: JSX.Element[] = [];

    for (const [key, value] of Object.entries(this.props.sourceData)) {
      let input: JSX.Element;
      if (typeof value === 'string' || typeof value === 'number') {
        input = (
          <div key={key}>
            <label htmlFor="">{key}</label>
            <input
              type="number"
              value={this.state.internalData[key]}
              onChange={e => this.setStateByKey(key, e.target.value)}
            />
          </div>
        );
        inputs.push(input);
      }
    }
    return inputs;
  }

  removeArrayButton(schema: IDict, uiSchema: IDict): void {
    Object.entries(schema['properties'] as IDict).forEach(([k, v]) => {
      if (v['type'] === 'array') {
        uiSchema[k] = {
          'ui:options': {
            orderable: false,
            removable: false,
            addable: false
          }
        };
      } else if (v['type'] === 'object') {
        uiSchema[k] = {};
        this.removeArrayButton(v, uiSchema[k]);
      }
      uiSchema['Color'] = {
        'ui:widget': 'color'
      };
    });
  }

  generateUiSchema(schema: IDict): IDict {
    const uiSchema = {
      additionalProperties: {
        'ui:label': false,
        classNames: 'jpcad-hidden-field'
      }
    };
    this.removeArrayButton(schema, uiSchema);
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
    const submitRef = React.createRef<HTMLButtonElement>();

    if (!schema) {
      return <div>{this.buildForm()}</div>;
    }
    return (
      <div
        className="jpcad-property-panel"
        data-path={this.props.filePath ?? ''}
      >
        <div className="jpcad-property-outer jp-scrollbar-tiny">
          <WrappedFormComponent
            schema={schema}
            uiSchema={uiSchema}
            formData={internalData}
            onSubmit={this.onFormSubmit}
            liveValidate
            onFocus={(id, value) => {
              this.props.syncSelectedField
                ? this.props.syncSelectedField(id, value, this.props.parentType)
                : null;
            }}
            onBlur={(id, value) => {
              this.props.syncSelectedField
                ? this.props.syncSelectedField(
                    null,
                    value,
                    this.props.parentType
                  )
                : null;
            }}
            children={
              <button
                ref={submitRef}
                type="submit"
                style={{ display: 'none' }}
              />
            }
          />
        </div>

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
            type="button"
            onClick={() => {
              submitRef.current?.click();
            }}
          >
            <div className="jp-Dialog-buttonLabel">Submit</div>
          </button>
        </div>
      </div>
    );
  }
}
