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

export function _writeStlFile(
  shape: OCC.TopoDS_Shape,
  linearDeflection = 0.1,
  angularDeflection = 0.5
): string {
  const oc = getOcc();

  new oc.BRepMesh_IncrementalMesh_2(
    shape,
    linearDeflection,
    false,
    angularDeflection,
    true
  );

  const writer = new oc.StlAPI_Writer();
  const progress = new oc.Message_ProgressRange_1();
  const fakeFileName = `${uuid()}.stl`;

  try {
    const success = writer.Write(shape, fakeFileName, progress);
    if (!success) {
      throw new Error('StlAPI_Writer failed to write the file.');
    }

    const stlContent = oc.FS.readFile(fakeFileName, {
      encoding: 'utf8'
    }) as string;

    return stlContent;
  } finally {
    if (oc.FS.analyzePath(fakeFileName).exists) {
      oc.FS.unlink(fakeFileName);
    }
    writer.delete();
    progress.delete();
  }
}
