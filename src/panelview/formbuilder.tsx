import * as React from 'react';
// import { Form } from '@rjsf/core';
import { IDict } from '../types';
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
    console.log('this props', this.props);

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

  render(): React.ReactNode {
    console.log('render', this.props.schema);

    // if (this.props.schema) {
    //   return (
    //     <div>
    //       <Form schema={this.props.schema as any} />
    //     </div>
    //   );
    // } else {
    return <div>{this.buildForm()}</div>;
    // }
  }
}
