import { WorkerAction, IDict, IJcadModel } from '../types';
import {
  OpenCascadeInstance,
  TopoDS_Shape,
  Handle_Poly_Triangulation
} from 'opencascade.js';
import { PrimitiveShapesFactory } from './occapi';
import { IOperatorArg } from './types';
let occ: OpenCascadeInstance;

export function getOcc(): OpenCascadeInstance {
  if (!occ) {
    occ = (self as any).occ as OpenCascadeInstance;
  }
  return occ;
}

function LengthOfCurve(
  geomAdaptor: any,
  UMin: number,
  UMax: number,
  segments = 5
) {
  return 1;
}
interface IFace {
  vertex_coord: Array<any>;
  uv_coord: Array<any>;
  normal_coord: Array<any>;
  tri_indexes: Array<any>;
  number_of_triangles: number;
}

function shapeToThree(shapes: Array<TopoDS_Shape>): {
  faceList: any[];
  edgeList: any[];
} {
  const oc = getOcc();
  const maxDeviation = 0.5;
  let faceList: Array<IFace> = [],
    edgeList = [];
  // let fullShapeEdgeHashes2 = {};
  let triangulations: Array<Handle_Poly_Triangulation> = [];
  let uv_boxes: Array<{
    w: number;
    h: number;
    index: number;
  }> = [];
  let curFace = 0;
  shapes.forEach(shape => {
    new oc.BRepMesh_IncrementalMesh_2(
      shape,
      maxDeviation,
      false,
      maxDeviation * 5,
      true
    );
    let faceIdx = 0;
    let expl = new oc.TopExp_Explorer_2(
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
      let aLocation = new oc.TopLoc_Location_1();
      let myT = oc.BRep_Tool.Triangulation(face, aLocation);
      if (myT.IsNull()) {
        console.error('Encountered Null Face!');
        return;
      }
      let thisFace: IFace = {
        vertex_coord: [],
        uv_coord: [],
        normal_coord: [],
        tri_indexes: [],
        number_of_triangles: 0
      };
      let pc = new oc.Poly_Connect_2(myT);
      let nodes = myT.get().Nodes();

      thisFace.vertex_coord = new Array(nodes.Length() * 3);
      for (let i = 0; i < nodes.Length(); i++) {
        let p = nodes.Value(i + 1).Transformed(aLocation.Transformation());
        thisFace.vertex_coord[i * 3 + 0] = p.X();
        thisFace.vertex_coord[i * 3 + 1] = p.Y();
        thisFace.vertex_coord[i * 3 + 2] = p.Z();
      }
      // Write UV buffer
      let orient = face.Orientation_1();
      if (myT.get().HasUVNodes()) {
        // Get UV Bounds
        let UMin = 0,
          UMax = 0,
          VMin = 0,
          VMax = 0;

        let UVNodes = myT.get().UVNodes(),
          UVNodesLength = UVNodes.Length();
        thisFace.uv_coord = new Array(UVNodesLength * 2);
        for (let i = 0; i < UVNodesLength; i++) {
          let p = UVNodes.Value(i + 1);
          let x = p.X(),
            y = p.Y();
          thisFace.uv_coord[i * 2 + 0] = x;
          thisFace.uv_coord[i * 2 + 1] = y;

          // Compute UV Bounds
          if (i == 0) {
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

        // Compute the Arclengths of the Isoparametric Curves of the face
        let surface = oc.BRep_Tool.Surface_2(face).get();
        let UIso_Handle = surface.UIso(UMin + (UMax - UMin) * 0.5);
        let VIso_Handle = surface.VIso(VMin + (VMax - VMin) * 0.5);
        let UAdaptor = new oc.GeomAdaptor_Curve_2(VIso_Handle);
        let VAdaptor = new oc.GeomAdaptor_Curve_2(UIso_Handle);
        uv_boxes.push({
          w: LengthOfCurve(UAdaptor, UMin, UMax),
          h: LengthOfCurve(VAdaptor, VMin, VMax),
          index: curFace
        });

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
      let myNormal = new oc.TColgp_Array1OfDir_2(nodes.Lower(), nodes.Upper());
      // let SST = new oc.StdPrs_ToolTriangulatedShape();
      oc.StdPrs_ToolTriangulatedShape.Normal(face, pc, myNormal);
      thisFace.normal_coord = new Array(myNormal.Length() * 3);
      for (let i = 0; i < myNormal.Length(); i++) {
        let d = myNormal.Value(i + 1).Transformed(aLocation.Transformation());
        thisFace.normal_coord[i * 3 + 0] = d.X();
        thisFace.normal_coord[i * 3 + 1] = d.Y();
        thisFace.normal_coord[i * 3 + 2] = d.Z();
      }

      // Write triangle buffer
      let triangles = myT.get().Triangles();
      thisFace.tri_indexes = new Array(triangles.Length() * 3);
      let validFaceTriCount = 0;
      for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
        let t = triangles.Value(nt);
        let n1 = t.Value(1);
        let n2 = t.Value(2);
        let n3 = t.Value(3);
        if (orient !== oc.TopAbs_Orientation.TopAbs_FORWARD) {
          let tmp = n1;
          n1 = n2;
          n2 = tmp;
        }
        // if(TriangleIsValid(Nodes.Value(1), Nodes.Value(n2), Nodes.Value(n3))) {
        thisFace.tri_indexes[validFaceTriCount * 3 + 0] = n1 - 1;
        thisFace.tri_indexes[validFaceTriCount * 3 + 1] = n2 - 1;
        thisFace.tri_indexes[validFaceTriCount * 3 + 2] = n3 - 1;
        validFaceTriCount++;
        // }
      }
      thisFace.number_of_triangles = validFaceTriCount;
      faceList.push(thisFace);
      triangulations.push(myT);
      curFace += 1;
      expl.Next();
      faceIdx += 1;
    }
  });

  return { faceList, edgeList };
}

function buildModel(model: IJcadModel): TopoDS_Shape[] {
  const occShapes: TopoDS_Shape[] = [];
  const { objects } = model;

  objects.forEach(object => {
    console.log('object', object);

    const { shape, parameters } = object;

    const occShape = PrimitiveShapesFactory[shape](parameters as IOperatorArg);
    occShapes.push(occShape);
  });
  return occShapes;
}

function loadFile(payload: {
  fileName: string;
  content: IJcadModel;
}): IDict | null {
  const { content } = payload;
  const shapeList = buildModel(content);
  const result = shapeToThree(shapeList);
  return result;
}

let WorkerHandler: {
  [key in WorkerAction]: (payload: any) => any;
} = {} as any;
WorkerHandler[WorkerAction.LOAD_FILE] = loadFile;

export default WorkerHandler;
