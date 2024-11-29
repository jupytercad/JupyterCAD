import * as React from 'react';

interface IProps {
  setForkLabel: (value: string) => void;
}
export function NewForkDialog(props: IProps) {
  const { setForkLabel } = props;
  const [label, setLabel] = React.useState('New suggestion');
  const updateLabel = React.useCallback(
    value => {
      setLabel(value);
      setForkLabel(value);
    },
    [setForkLabel]
  );
  return (
    <div>
      <p className="field-description">Label of the suggestion</p>
      <input
        className="form-control jp-mod-styled"
        style={{ width: '100%' }}
        value={label}
        onChange={e => updateLabel(e.target.value)}
        type="text"
        placeholder="New suggestion"
      />
    </div>
  );
}
