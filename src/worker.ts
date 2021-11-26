import initOpenCascade from 'opencascade.js';

let occ: any;

self.onmessage = async (event: MessageEvent): Promise<void> => {
  console.log('onmessage', event.data);
  occ = await initOpenCascade();

  console.log('occ', occ);
  postMessage('im done');
  // const fileText = model.toString();
  // const fileName = 'file.stp';
  // occ.FS.createDataFile('/', fileName, fileText, true, true, true);
  // const reader = new occ.STEPControl_Reader_1();

  // const readResult = reader.ReadFile(fileName);
  // if (readResult === occ.IFSelect_ReturnStatus.IFSelect_RetDone) {
  //   console.log('file loaded successfully!     Converting to OCC now...');
  //   const numRootsTransferred = reader.TransferRoots(
  //     new occ.Message_ProgressRange_1()
  //   ); // Translate all transferable roots to OpenCascade
  //   const stepShape = reader.OneShape(); // Obtain the results of translation in one OCCT shape
  //   console.log('converted successfully!', numRootsTransferred, stepShape);
  // } else {
  //   console.error('Something in OCCT went wrong trying to read ');
  // }
};
