import { OCC } from '@jupytercad/opencascade';
import { v4 as uuid } from 'uuid';

import { getOcc } from './common';

export function _loadStepFile(content: string): OCC.TopoDS_Shape | undefined {
  const oc = getOcc();
  const fakeFileName = `${uuid()}.STEP`;
  oc.FS.createDataFile('/', fakeFileName, content, true, true, true);
  const reader = new oc.STEPControl_Reader_1();

  const readResult = reader.ReadFile(fakeFileName);

  if (readResult === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
    reader.TransferRoots(new oc.Message_ProgressRange_1());
    const shape = reader.OneShape();
    oc.FS.unlink('/' + fakeFileName);
    return shape;
  } else {
    console.error('Something in OCCT went wrong trying to read');
    return undefined;
  }
}
