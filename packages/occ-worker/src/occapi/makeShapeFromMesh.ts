import { OCC } from '@jupytercad/opencascade';

import { getOcc } from './common';

export function makeShapeFromMesh(
  myMeshHandle: OCC.Handle_Poly_Triangulation
): OCC.TopoDS_Shape | undefined {
  if (myMeshHandle.IsNull()) {
    return;
  }
  const myMesh = myMeshHandle.get();
  if (myMesh.NbNodes() === 0 || myMesh.NbTriangles() === 0) {
    return;
  }
  const SMALL = 1e-9;
  const oc = getOcc();
  const aNbNodes = myMesh.NbNodes();
  const aNbTriangles = myMesh.NbTriangles();

  const aPnt2VertexMap: Map<number, OCC.TopoDS_Vertex> = new Map();
  for (let idx = 1; idx <= aNbNodes; idx++) {
    const aP = myMesh.Node(idx);
    const aV = new OCC.BRepBuilderAPI_MakeVertex(aP);
    aPnt2VertexMap.set(idx, aV.Vertex());
  }

  const anEdgeToTEgeMap: Map<[number, number], OCC.TopoDS_Edge> = new Map();

  for (let idx = 1; idx <= aNbTriangles; idx++) {
    const aTriangle = myMesh.Triangle(idx);
    const anIdx: [number, number, number] = [
      aTriangle.Value(1),
      aTriangle.Value(2),
      aTriangle.Value(3)
    ];

    if (
      anIdx[0] === anIdx[1] ||
      anIdx[0] === anIdx[2] ||
      anIdx[1] === anIdx[2]
    ) {
      continue;
    }
    const aP1 = myMesh.Node(anIdx[0]);
    const aP2 = myMesh.Node(anIdx[1]);
    const aP3 = myMesh.Node(anIdx[2]);
    const aD1 = aP1.SquareDistance(aP2);
    const aD2 = aP1.SquareDistance(aP3);
    const aD3 = aP2.SquareDistance(aP3);
    if (aD1 < SMALL || aD2 < SMALL || aD3 < SMALL) {
      continue;
    }
    const aV1 = aPnt2VertexMap.get(anIdx[0]);
    const aV2 = aPnt2VertexMap.get(anIdx[1]);
    const aV3 = aPnt2VertexMap.get(anIdx[2]);
    if (!aV1 || !aV2 || !aV3) {
      return;
    }
    const aMeshEdge1: [number, number] = [
      Math.min(anIdx[0], anIdx[1]),
      Math.max(anIdx[0], anIdx[1])
    ];
    const aMeshEdge2: [number, number] = [
      Math.min(anIdx[1], anIdx[2]),
      Math.max(anIdx[1], anIdx[2])
    ];
    const aMeshEdge3: [number, number] = [
      Math.min(anIdx[2], anIdx[0]),
      Math.max(anIdx[2], anIdx[0])
    ];

    const aMaker1 = new oc.BRepBuilderAPI_MakeEdge_2(aV1, aV2);
    const aTE1 = aMaker1.Edge();
    if (anIdx[1] < anIdx[0]) {
      aTE1.Reverse();
    }
    const aMaker2 = new oc.BRepBuilderAPI_MakeEdge_2(aV2, aV3);
    const aTE2 = aMaker2.Edge();
    if (anIdx[2] < anIdx[1]) {
      aTE2.Reverse();
    }

    const aMaker3 = new oc.BRepBuilderAPI_MakeEdge_2(aV3, aV1);
    const aTE3 = aMaker3.Edge();
    if (anIdx[0] < anIdx[2]) {
      aTE3.Reverse();
    }
    anEdgeToTEgeMap.set(aMeshEdge1, aTE1);
    anEdgeToTEgeMap.set(aMeshEdge2, aTE2);
    anEdgeToTEgeMap.set(aMeshEdge3, aTE3);
  }
  const aResult = new oc.TopoDS_Compound();
  const aBB = new oc.BRep_Builder();
  aBB.MakeCompound(aResult);

  for (let idx = 1; idx < aNbTriangles; idx++) {
    const aTriangle = myMesh.Triangle(idx);
    const anIdx: [number, number, number] = [
      aTriangle.Value(1),
      aTriangle.Value(2),
      aTriangle.Value(3)
    ];

    const aMeshEdge1: [number, number] = [
      Math.min(anIdx[0], anIdx[1]),
      Math.max(anIdx[0], anIdx[1])
    ];
    const aMeshEdge2: [number, number] = [
      Math.min(anIdx[1], anIdx[2]),
      Math.max(anIdx[1], anIdx[2])
    ];
    const aMeshEdge3: [number, number] = [
      Math.min(anIdx[2], anIdx[0]),
      Math.max(anIdx[2], anIdx[0])
    ];
    const isReversed1 = anIdx[1] < anIdx[0];
    const isReversed2 = anIdx[2] < anIdx[1];
    const isReversed3 = anIdx[0] < anIdx[2];

    const aHasAllEdges =
      anEdgeToTEgeMap.has(aMeshEdge1) &&
      anEdgeToTEgeMap.has(aMeshEdge2) &&
      anEdgeToTEgeMap.has(aMeshEdge3);
    if (!aHasAllEdges) {
      continue;
    }
    const aTEdge1 = anEdgeToTEgeMap.get(aMeshEdge1);
    const aTEdge2 = anEdgeToTEgeMap.get(aMeshEdge2);
    const aTEdge3 = anEdgeToTEgeMap.get(aMeshEdge3);
    if (!aTEdge1 || !aTEdge2 || !aTEdge3) {
      continue;
    }
    if (isReversed1) {
      aTEdge1.Reverse();
    }
    if (isReversed2) {
      aTEdge2.Reverse();
    }
    if (isReversed3) {
      aTEdge3.Reverse();
    }
    const aWireMaker = new oc.BRepBuilderAPI_MakeWire_1();
    aWireMaker.Add_1(aTEdge1);
    aWireMaker.Add_1(aTEdge2);
    aWireMaker.Add_1(aTEdge3);
    const aWire = aWireMaker.Wire();

    const aC1 = new oc.BRepAdaptor_Curve_2(aTEdge1);
    const aC2 = new oc.BRepAdaptor_Curve_2(aTEdge2);
    const aD1 = aC1.Line().Direction();
    const aD2 = aC2.Line().Direction();
    const aN = aD1.XYZ().Crossed(aD2.XYZ());

    if (aN.SquareModulus() < SMALL) {
      continue;
    }
    if (aTEdge1.Orientation_1() === oc.TopAbs_Orientation.TopAbs_REVERSED) {
      aN.Reverse();
    }
    if (aTEdge2.Orientation_1() === oc.TopAbs_Orientation.TopAbs_REVERSED) {
      aN.Reverse();
    }
    const aNorm = new oc.gp_Dir_3(aN);
    const aPln = new oc.gp_Pln_3(myMesh.Node(anIdx[0]), aNorm);
    const aFaceMaker = new oc.BRepBuilderAPI_MakeFace_16(aPln, aWire, true);
    const aFace = aFaceMaker.Face();
    aBB.Add(aResult, aFace);
  }
  return aResult;
}
