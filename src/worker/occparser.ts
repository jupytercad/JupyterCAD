import {
  Handle_Poly_Triangulation,
  OpenCascadeInstance,
  TopoDS_Shape
} from 'jupytercad-opencascade';

import { IJCadObject } from '../_interface/jcad.d';
import { IEdge, IFace } from '../types';

interface IShapeList {
  occShape: TopoDS_Shape;
  jcObject: IJCadObject;
}

export class OccParser {
  private _shapeList: IShapeList[];
  private _occ: OpenCascadeInstance = (self as any).occ;
  private _showEdge = true;
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
    const maxDeviation = 0.1;
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

      let edgeList: IEdge[] = [];
      if (this._showEdge) {
        edgeList = this._build_edge_mesh(occShape);
      }
      const wireList = this._build_wire_mesh(occShape, maxDeviation);

      theejsData[jcObject.name] = {
        jcObject,
        faceList,
        edgeList: [...edgeList, ...wireList]
      };
    });

    return theejsData;
  }

  private _build_wire_mesh(
    shape: TopoDS_Shape,
    maxDeviation: number
  ): Array<IEdge> {
    const edgeList: Array<IEdge> = [];
    const oc = this._occ;
    const expl = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_EDGE as any,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
    );
    expl.Init(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_EDGE as any,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE as any
    );

    while (expl.More()) {
      const edge = oc.TopoDS.Edge_1(expl.Current());

      const aLocation = new oc.TopLoc_Location_1();
      const adaptorCurve = new oc.BRepAdaptor_Curve_2(edge);
      const tangDef = new oc.GCPnts_TangentialDeflection_2(
        adaptorCurve,
        maxDeviation,
        0.1,
        2,
        1.0e-9,
        1.0e-7
      );
      const vertexCoord = new Array(tangDef.NbPoints() * 3);
      for (let j = 0; j < tangDef.NbPoints(); j++) {
        const vertex = tangDef
          .Value(j + 1)
          .Transformed(aLocation.Transformation());
        vertexCoord[j * 3 + 0] = vertex.X();
        vertexCoord[j * 3 + 1] = vertex.Y();
        vertexCoord[j * 3 + 2] = vertex.Z();
      }
      edgeList.push({ vertexCoord, numberOfCoords: tangDef.NbPoints() * 3 });
      expl.Next();
    }
    return edgeList;
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
        vertexCoord: [],
        normalCoord: [],
        triIndexes: [],
        numberOfTriangles: 0
      };
      const pc = new oc.Poly_Connect_2(myT);
      const nodes = myT.get().Nodes();

      thisFace.vertexCoord = new Array(nodes.Length() * 3);
      for (let i = 0; i < nodes.Length(); i++) {
        const p = nodes.Value(i + 1).Transformed(aLocation.Transformation());
        thisFace.vertexCoord[i * 3 + 0] = p.X();
        thisFace.vertexCoord[i * 3 + 1] = p.Y();
        thisFace.vertexCoord[i * 3 + 2] = p.Z();
      }

      const orient = face.Orientation_1();

      // Write normal buffer
      const myNormal = new oc.TColgp_Array1OfDir_2(
        nodes.Lower(),
        nodes.Upper()
      );
      // let SST = new oc.StdPrs_ToolTriangulatedShape();
      oc.StdPrs_ToolTriangulatedShape.Normal(face, pc, myNormal);
      thisFace.normalCoord = new Array(myNormal.Length() * 3);
      for (let i = 0; i < myNormal.Length(); i++) {
        const d = myNormal.Value(i + 1).Transformed(aLocation.Transformation());
        thisFace.normalCoord[i * 3 + 0] = d.X();
        thisFace.normalCoord[i * 3 + 1] = d.Y();
        thisFace.normalCoord[i * 3 + 2] = d.Z();
      }

      // Write triangle buffer
      const triangles = myT.get().Triangles();
      thisFace.triIndexes = new Array(triangles.Length() * 3);
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

        thisFace.triIndexes[validFaceTriCount * 3 + 0] = n1 - 1;
        thisFace.triIndexes[validFaceTriCount * 3 + 1] = n2 - 1;
        thisFace.triIndexes[validFaceTriCount * 3 + 2] = n3 - 1;
        validFaceTriCount++;
      }
      thisFace.numberOfTriangles = validFaceTriCount;
      faceList.push(thisFace);
      triangulations.push(myT);
      expl.Next();
    }
    return faceList;
  }
  private _build_edge_mesh(shape: TopoDS_Shape): IEdge[] {
    const oc = this._occ;
    const edgeList: IEdge[] = [];
    const mapOfShape = new oc.TopTools_IndexedMapOfShape_1();
    oc.TopExp.MapShapes_1(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_EDGE as any,
      mapOfShape
    );

    const edgeMap = new oc.TopTools_IndexedDataMapOfShapeListOfShape_1();
    oc.TopExp.MapShapesAndAncestors(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_EDGE as any,
      oc.TopAbs_ShapeEnum.TopAbs_FACE as any,
      edgeMap
    );

    for (let iEdge = 1; iEdge <= edgeMap.Extent(); iEdge++) {
      const faceList = edgeMap.FindFromIndex(iEdge);
      if (faceList.Extent() === 0) {
        continue;
      }
      const anEdge = oc.TopoDS.Edge_1(mapOfShape.FindKey(iEdge));
      let myTransf = new oc.gp_Trsf_1();
      const aLoc = new oc.TopLoc_Location_1();
      const aPoly = oc.BRep_Tool.Polygon3D(anEdge, aLoc);

      const theEdge: IEdge = {
        vertexCoord: [],
        numberOfCoords: 0
      };
      let nbNodesInFace: number;
      if (!aPoly.IsNull()) {
        if (!aLoc.IsIdentity()) {
          myTransf = aLoc.Transformation();
        }

        nbNodesInFace = aPoly.get().NbNodes();

        theEdge.numberOfCoords = nbNodesInFace;
        theEdge.vertexCoord = new Array(nbNodesInFace * 3);
        const nodeListOfEdge = aPoly.get().Nodes();
        for (let ii = 0; ii < nbNodesInFace; ii++) {
          const V = nodeListOfEdge.Value(ii + 1);
          V.Transform(myTransf);
          theEdge.vertexCoord[ii * 3 + 0] = V.X();
          theEdge.vertexCoord[ii * 3 + 1] = V.Y();
          theEdge.vertexCoord[ii * 3 + 2] = V.Z();
        }
      } else {
        const aFace = oc.TopoDS.Face_1(edgeMap.FindFromIndex(iEdge).First_1());
        const aPolyTria = oc.BRep_Tool.Triangulation(aFace, aLoc);
        if (!aLoc.IsIdentity()) {
          myTransf = aLoc.Transformation();
        }
        const aPoly = oc.BRep_Tool.PolygonOnTriangulation_1(
          anEdge,
          aPolyTria,
          aLoc
        );
        if (aPoly.IsNull()) {
          continue;
        }
        nbNodesInFace = aPoly.get().NbNodes();
        theEdge.numberOfCoords = nbNodesInFace;
        theEdge.vertexCoord = new Array(nbNodesInFace * 3);

        const indices = aPoly.get().Nodes();
        const nodeListOfFace = aPolyTria.get().Nodes();

        for (let jj = indices.Lower(); jj <= indices.Upper(); jj++) {
          const v = nodeListOfFace.Value(indices.Value(jj));
          v.Transform(myTransf);
          const locIndex = jj - nodeListOfFace.Lower();

          theEdge.vertexCoord[locIndex * 3 + 0] = v.X();
          theEdge.vertexCoord[locIndex * 3 + 1] = v.Y();
          theEdge.vertexCoord[locIndex * 3 + 2] = v.Z();
        }
      }
      edgeList.push(theEdge);
    }
    return edgeList;
  }
}
