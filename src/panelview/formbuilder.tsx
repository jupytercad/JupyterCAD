import * as React from 'react';
import Form from '@rjsf/fluent-ui';
import { IDict } from '../types';
import { ISubmitEvent } from '@rjsf/core';

interface IStates {
  internalData?: IDict;
  schema?: IDict;
}
interface IProps {
  sourceData: IDict | undefined;
  syncData: (properties: IDict) => void;
  schema?: IDict;
}

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

  componentDidUpdate(prevProps: IProps, prevState: IStates): void {
    if (prevProps.sourceData !== this.props.sourceData) {
      this.setState(old => ({ ...old, internalData: this.props.sourceData }));
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

  generateUiSchema(schema: IDict): IDict {
    const uiSchema = {
      additionalProperties: {
        'ui:label': false,
        classNames: 'jpcad-hidden-field'
      }
    };
    Object.entries(schema['properties'] as IDict).forEach(([k, v]) => {
      if (v['type'] === 'array') {
        uiSchema[k] = {
          'ui:options': {
            orderable: false
          }
        };
      }
    });
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
      () => this.props.syncData(e.formData)
    );
  };

  render(): React.ReactNode {
    if (this.props.schema) {
      const schema = { ...this.props.schema, additionalProperties: true };
      return (
        <div className="jpcad-property-outer">
          <Form
            schema={schema}
            onSubmit={this.onFormSubmit}
            formData={this.state.internalData}
            uiSchema={this.generateUiSchema(this.props.schema)}
          />
        </div>
      );
    } else {
      return <div>{this.buildForm()}</div>;
    }
  }
}
