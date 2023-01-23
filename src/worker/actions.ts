import { IJCadObject } from './../_interface/jcad.d';
import {
  Handle_Poly_Triangulation,
  OpenCascadeInstance,
  TopoDS_Shape
} from 'jupytercad-opencascade';

import { IDict, WorkerAction } from '../types';
import { IJCadContent } from '../_interface/jcad';
import { BrepFile, ShapesFactory } from './occapi';
import { IOperatorArg } from './types';
import { OccParser } from './occparser';

let occ: OpenCascadeInstance;

export function getOcc(): OpenCascadeInstance {
  if (!occ) {
    occ = (self as any).occ as OpenCascadeInstance;
  }
  return occ;
}

interface IFace {
  vertex_coord: Array<any>;
  uv_coord: Array<any>;
  normal_coord: Array<any>;
  tri_indexes: Array<any>;
  number_of_triangles: number;
}

/**
 * Convert OpenCascade shapes into `THREE` compatible data types.
 *
 * @param {Array<TopoDS_Shape>} shapeData
 * @returns {{
 *   faceList: any[];
 *   edgeList: any[];
 * }}
 */
export function shapeToThree(
  shapeData: Array<{ occShape: TopoDS_Shape; jcObject: IJCadObject }>
): {
  faceList: any[];
  edgeList: any[];
} {
  const oc = getOcc();
  const maxDeviation = 0.5;
  const faceList: Array<IFace> = [];
  const edgeList = [];
  const triangulations: Array<Handle_Poly_Triangulation> = [];
  shapeData.forEach(data => {
    const { occShape: shape, jcObject } = data;
    if (!jcObject.visible) {
      return;
    }
    new oc.BRepMesh_IncrementalMesh_2(
      shape,
      maxDeviation,
      false,
      maxDeviation * 5,
      true
    );

    const expl = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_FACE as any,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
    );
    expl.Init(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_FACE as any,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
    );
    while (expl.More()) {
      const face = oc.TopoDS.Face_1(expl.Current());
      const aLocation = new oc.TopLoc_Location_1();
      const myT = oc.BRep_Tool.Triangulation(face, aLocation);
      if (myT.IsNull()) {
        console.error('Encountered Null Face!');
        return;
      }
      const thisFace: IFace = {
        vertex_coord: [],
        uv_coord: [],
        normal_coord: [],
        tri_indexes: [],
        number_of_triangles: 0
      };
      const pc = new oc.Poly_Connect_2(myT);
      const nodes = myT.get().Nodes();

      thisFace.vertex_coord = new Array(nodes.Length() * 3);
      for (let i = 0; i < nodes.Length(); i++) {
        const p = nodes.Value(i + 1).Transformed(aLocation.Transformation());
        thisFace.vertex_coord[i * 3 + 0] = p.X();
        thisFace.vertex_coord[i * 3 + 1] = p.Y();
        thisFace.vertex_coord[i * 3 + 2] = p.Z();
      }
      // Write UV buffer
      const orient = face.Orientation_1();
      if (myT.get().HasUVNodes()) {
        // Get UV Bounds
        let UMin = 0,
          UMax = 0,
          VMin = 0,
          VMax = 0;

        const UVNodes = myT.get().UVNodes(),
          UVNodesLength = UVNodes.Length();
        thisFace.uv_coord = new Array(UVNodesLength * 2);
        for (let i = 0; i < UVNodesLength; i++) {
          const p = UVNodes.Value(i + 1);
          const x = p.X(),
            y = p.Y();
          thisFace.uv_coord[i * 2 + 0] = x;
          thisFace.uv_coord[i * 2 + 1] = y;

          // Compute UV Bounds
          if (i === 0) {
            UMin = x;
            UMax = x;
            VMin = y;
            VMax = y;
          }
          if (x < UMin) {
            UMin = x;
          } else if (x > UMax) {
            UMax = x;
          }
          if (y < VMin) {
            VMin = y;
          } else if (y > VMax) {
            VMax = y;
          }
        }

        // Normalize each face's UVs to 0-1
        for (let i = 0; i < UVNodesLength; i++) {
          let x = thisFace.uv_coord[i * 2 + 0],
            y = thisFace.uv_coord[i * 2 + 1];

          x = (x - UMin) / (UMax - UMin);
          y = (y - VMin) / (VMax - VMin);
          if (orient !== oc.TopAbs_Orientation.TopAbs_FORWARD) {
            x = 1.0 - x;
          }

          thisFace.uv_coord[i * 2 + 0] = x;
          thisFace.uv_coord[i * 2 + 1] = y;
        }
      }
      // Write normal buffer
      const myNormal = new oc.TColgp_Array1OfDir_2(
        nodes.Lower(),
        nodes.Upper()
      );
      // let SST = new oc.StdPrs_ToolTriangulatedShape();
      oc.StdPrs_ToolTriangulatedShape.Normal(face, pc, myNormal);
      thisFace.normal_coord = new Array(myNormal.Length() * 3);
      for (let i = 0; i < myNormal.Length(); i++) {
        const d = myNormal.Value(i + 1).Transformed(aLocation.Transformation());
        thisFace.normal_coord[i * 3 + 0] = d.X();
        thisFace.normal_coord[i * 3 + 1] = d.Y();
        thisFace.normal_coord[i * 3 + 2] = d.Z();
      }

      // Write triangle buffer
      const triangles = myT.get().Triangles();
      thisFace.tri_indexes = new Array(triangles.Length() * 3);
      let validFaceTriCount = 0;
      for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
        const t = triangles.Value(nt);
        let n1 = t.Value(1);
        let n2 = t.Value(2);
        const n3 = t.Value(3);
        if (orient !== oc.TopAbs_Orientation.TopAbs_FORWARD) {
          const tmp = n1;
          n1 = n2;
          n2 = tmp;
        }

        thisFace.tri_indexes[validFaceTriCount * 3 + 0] = n1 - 1;
        thisFace.tri_indexes[validFaceTriCount * 3 + 1] = n2 - 1;
        thisFace.tri_indexes[validFaceTriCount * 3 + 2] = n3 - 1;
        validFaceTriCount++;
      }
      thisFace.number_of_triangles = validFaceTriCount;
      faceList.push(thisFace);
      triangulations.push(myT);
      expl.Next();
    }
  });

  return { faceList, edgeList };
}

function buildModel(
  model: IJCadContent
): { occShape: TopoDS_Shape; jcObject: IJCadObject }[] {
  const occShapes: { occShape: TopoDS_Shape; jcObject: IJCadObject }[] = [];
  const { objects } = model;

  objects.forEach(object => {
    const { shape, parameters } = object;
    if (!shape || !parameters) {
      return;
    }
    if (ShapesFactory[shape]) {
      const occShape = ShapesFactory[shape](parameters as IOperatorArg, model);
      if (occShape) {
        occShapes.push({ occShape, jcObject: object });
      }
    } else if (parameters['Shape']) {
      // Creating occ shape from brep file.
      const occShape = BrepFile({ content: parameters['Shape'] }, model);
      if (occShape) {
        occShapes.push({ occShape, jcObject: object });
      }
    }
  });
  return occShapes;
}

function loadFile(payload: {
  fileName: string;
  content: IJCadContent;
}): IDict | null {
  const { content } = payload;
  const shapeList = buildModel(content);
  const parser = new OccParser(shapeList);
  const result = parser.execute();
  return result;
}

const WorkerHandler: {
  [key in WorkerAction]: (payload: any) => any;
} = {} as any;
WorkerHandler[WorkerAction.LOAD_FILE] = loadFile;

export default WorkerHandler;
