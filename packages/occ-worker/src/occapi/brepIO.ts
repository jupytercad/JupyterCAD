import { OCC } from '@jupytercad/opencascade';
import { v4 as uuid } from 'uuid';

import { getOcc } from './common';

export function _writeBrep(shape: OCC.TopoDS_Shape): string {
  const oc = getOcc();
  const fakeFileName = `${uuid()}.brep`;
  const progress = new oc.Message_ProgressRange_1();
  oc.BRepTools.Write_4(
    shape,
    fakeFileName,
    false,
    false,
    oc.TopTools_FormatVersion.TopTools_FormatVersion_VERSION_1 as any,
    progress
  );
  const value = oc.FS.readFile('/' + fakeFileName, { encoding: 'utf8' });
  oc.FS.unlink('/' + fakeFileName);
  return value;
}

export function _loadBrepFile(content: string): OCC.TopoDS_Shape | undefined {
  const oc = getOcc();
  const fakeFileName = `${uuid()}.brep`;
  oc.FS.createDataFile('/', fakeFileName, content, true, true, true);
  const shape = new oc.TopoDS_Shape();
  const builder = new oc.BRep_Builder();
  const progress = new oc.Message_ProgressRange_1();
  oc.BRepTools.Read_2(shape, fakeFileName, builder, progress);
  oc.FS.unlink('/' + fakeFileName);
  return shape;
}
