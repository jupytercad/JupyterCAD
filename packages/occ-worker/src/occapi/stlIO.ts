import { OCC } from '@jupytercad/opencascade';
import { v4 as uuid } from 'uuid';

import { getOcc } from './common';
import { makeShapeFromMesh } from './makeShapeFromMesh';

export function _loadStlFile(content: string): OCC.TopoDS_Shape | undefined {
  const oc = getOcc();
  const fakeFileName = `${uuid()}.STL`;
  oc.FS.createDataFile('/', fakeFileName, content, true, true, true);

  const readResult = oc.RWStl.ReadFile_2(
    fakeFileName,
    new oc.Message_ProgressRange_1()
  );

  const shape = makeShapeFromMesh(readResult);
  if (shape) {
    return shape;
  } else {
    console.error('Something in OCCT went wrong trying to read');
    return undefined;
  }
}
