import * as React from 'react';

interface IProps {
  loading: boolean;
}
export function Spinner(props: IProps) {
  return (
    <div
      className={'jpcad-Spinner'}
      style={{ display: props.loading ? 'flex' : 'none' }}
    >
      <div className={'jpcad-SpinnerContent'}></div>
    </div>
  );
}
