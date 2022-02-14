import * as React from 'react';

interface IStates {
  internalData?: { [key: string]: any };
}

interface IProps {
  sourceData: { [key: string]: any } | undefined;
  syncData: (properties: { [key: string]: any }) => void;
}

export class ObjectPropertiesForm extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = { internalData: { ...this.props.sourceData } };
    console.log('this.state', this.state);
  }

  setStateByKey = (key: string, value: any) => {
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

  componentDidUpdate(prevProps: IProps, prevState: IStates) {
    if (prevProps.sourceData !== this.props.sourceData) {
      this.setState(old => ({ ...old, internalData: this.props.sourceData }));
    }
  }

  buildForm() {
    if (!this.props.sourceData || !this.state.internalData) {
      return [];
    }
    const inputs: JSX.Element[] = [];
    console.log('data to build form ', this.props.sourceData);

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
    return <div>{this.buildForm()}</div>;
  }
}
