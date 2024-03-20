import * as React from 'react';
import { SuggestionModel } from './model';

interface ISuggestionProps {
  model: SuggestionModel;
}

export const Suggestion = (props: ISuggestionProps): JSX.Element => {
  const [currentForkId, setCurrentForkId] = React.useState('');
  const createFork = React.useCallback(async () => {
    const forkId = await props.model.createFork();
    if (forkId) {
      setCurrentForkId(forkId);
    }
  }, [props.model, setCurrentForkId]);

  return (
    <div className="jcad-Suggestion">
      <button onClick={createFork}>Create fork</button>
      <p>{currentForkId}</p>
    </div>
  );
};
