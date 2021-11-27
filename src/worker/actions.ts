import { WorkerAction, IDict } from '../types';
import { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js';

let occ: OpenCascadeInstance;
function getOcc():OpenCascadeInstance {
    if(!occ){
        occ = (self as any).occ as OpenCascadeInstance;
    }
    return occ
}

function _shapeToThree(shape: Array<TopoDS_Shape>): any {
    const occ = getOcc();
}

function loadFile(payload: {
  fileName: string;
  content: string;
}): IDict | null {
  const occ = getOcc();
  const { fileName, content } = payload;
  const fakeFileName = fileName.split('/').join('_');
  occ.FS.createDataFile('/', fakeFileName, content, true, true, true);
  const reader = new occ.STEPControl_Reader_1();
  const readResult = reader.ReadFile(fakeFileName);
  if (readResult === occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
    console.log('file loaded successfully!     Converting to OCC now...');
    const numRootsTransferred = reader.TransferRoots(
      new occ.Message_ProgressRange_1()
    ); // Translate all transferable roots to OpenCascade
    const stepShape = reader.OneShape(); // Obtain the results of translation
    // stepShape.DumpJson(stream, 1)
    console.log('converted successfully!', numRootsTransferred, stepShape);
    return { done: 'done check' };
  } else {
    console.error('Something in OCCT went wrong trying to read ');
    return null;
  }
}

let WorkerHandler: {
  [key in WorkerAction]: (payload: any) => any;
} = {} as any;
WorkerHandler[WorkerAction.LOAD_FILE] = loadFile;

export default WorkerHandler;
