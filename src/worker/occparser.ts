import {
  Handle_Poly_Triangulation,
  OpenCascadeInstance,
  TopoDS_Shape
} from 'opencascade.js';

import { IJCadObject } from '../_interface/jcad.d';
import { IEdge, IFace } from '../types';

interface IShapeList {
  occShape: TopoDS_Shape;
  jcObject: IJCadObject;
}

export class OccParser {
  private _shapeList: IShapeList[];
  private _occ: OpenCascadeInstance = (self as any).occ;
  private _faces: Map<TopoDS_Shape, any[]> = new Map();
  private _showEdge = false;
  constructor(shapeList: IShapeList[]) {
    this._shapeList = shapeList;
  }

  execute(): {
    [key: string]: {
      jcObject: IJCadObject;
      faceList: Array<IFace>;
      edgeList: Array<IEdge>;
    };
  } {
    const maxDeviation = 0.25;
    const theejsData: {
      [key: string]: {
        jcObject: IJCadObject;
        faceList: Array<IFace>;
        edgeList: Array<IEdge>;
      };
    } = {};
    this._shapeList.forEach(data => {
      const { occShape, jcObject } = data;

      new this._occ.BRepMesh_IncrementalMesh_2(
        occShape,
        maxDeviation,
        false,
        maxDeviation * 5,
        true
      );
      const faceList = this._build_face_mesh(occShape);
      // TODO Enable edge rendering.
      let edgeList: IEdge[] = [];
      if (this._showEdge) {
        edgeList = this._build_edge_mesh(occShape);
      }
      theejsData[jcObject.name ?? jcObject.id] = {
        jcObject,
        faceList,
        edgeList
      };
    });
    return theejsData;
  }

  private _build_face_mesh(shape: TopoDS_Shape): Array<IFace> {
    const faceList: Array<IFace> = [];
    const triangulations: Array<Handle_Poly_Triangulation> = [];
    const oc = this._occ;
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
        continue;
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
      this._faces.set(face, thisFace.vertex_coord);
      expl.Next();
    }
    return faceList;
  }
  private _build_edge_mesh(shape: TopoDS_Shape): IEdge[] {
    const oc = this._occ;
    const edgeList: IEdge[] = [];
    const edgeMap = new oc.TopTools_IndexedDataMapOfShapeListOfShape_1();
    oc.TopExp.MapShapesAndAncestors(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_EDGE as any,
      oc.TopAbs_ShapeEnum.TopAbs_FACE as any,
      edgeMap
    );

    for (let idx = 1; idx < edgeMap.Size() + 1; idx++) {
      const faceList = edgeMap.FindFromIndex(idx);
      if (faceList.Size() !== 0) {
        const face = oc.TopoDS.Face_1(faceList.First_1());
        const edge = oc.TopoDS.Edge_1(edgeMap.FindKey(idx));
        let vertexBuffer: any[] | undefined = undefined;
        for (const [f, value] of this._faces) {
          if (face.IsSame(f)) {
            vertexBuffer = value;
            break;
          }
        }

        if (vertexBuffer) {
          const loc = new oc.TopLoc_Location_1();
          const trf = loc.Transformation();

          const tri = oc.BRep_Tool.Triangulation(face, loc);
          const polygon = oc.BRep_Tool.PolygonOnTriangulation_1(edge, tri, loc);
          const edgeNodes = polygon.get().Nodes();
          const faces: number[] = [];
          for (let jdx = 1; jdx < edgeNodes.Length() + 1; jdx++) {
            faces.push(edgeNodes.Value(jdx) - 1);
          }
          const thisEdge: IEdge = {
            vertices: vertexBuffer,
            faces,
            pos: [
              trf.TranslationPart().X(),
              trf.TranslationPart().Y(),
              trf.TranslationPart().Z()
            ],
            quat: [
              trf.GetRotation_2().X(),
              trf.GetRotation_2().Y(),
              trf.GetRotation_2().Z(),
              trf.GetRotation_2().W()
            ]
          };
          edgeList.push(thisEdge);
        }
      }
    }
    return edgeList;
  }
}
