export declare class Message_ProgressRange {
  UserBreak(): Standard_Boolean;
  More(): Standard_Boolean;
  IsActive(): Standard_Boolean;
  Close(): void;
  delete(): void;
}

  export declare class Message_ProgressRange_1 extends Message_ProgressRange {
    constructor();
  }

  export declare class Message_ProgressRange_2 extends Message_ProgressRange {
    constructor(theOther: Message_ProgressRange);
  }

export declare class Standard_Transient {
  Delete(): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  IsInstance_1(theType: Handle_Standard_Type): Standard_Boolean;
  IsInstance_2(theTypeName: Standard_CString): Standard_Boolean;
  IsKind_1(theType: Handle_Standard_Type): Standard_Boolean;
  IsKind_2(theTypeName: Standard_CString): Standard_Boolean;
  This(): MMgt_TShared;
  GetRefCount(): Graphic3d_ZLayerId;
  IncrementRefCounter(): void;
  DecrementRefCounter(): Graphic3d_ZLayerId;
  delete(): void;
}

  export declare class Standard_Transient_1 extends Standard_Transient {
    constructor();
  }

  export declare class Standard_Transient_2 extends Standard_Transient {
    constructor(a: MMgt_TShared);
  }

export declare type TopAbs_Orientation = {
  TopAbs_FORWARD: {};
  TopAbs_REVERSED: {};
  TopAbs_INTERNAL: {};
  TopAbs_EXTERNAL: {};
}

export declare type TopAbs_ShapeEnum = {
  TopAbs_COMPOUND: {};
  TopAbs_COMPSOLID: {};
  TopAbs_SOLID: {};
  TopAbs_SHELL: {};
  TopAbs_FACE: {};
  TopAbs_WIRE: {};
  TopAbs_EDGE: {};
  TopAbs_VERTEX: {};
  TopAbs_SHAPE: {};
}

export declare class BRepBuilderAPI_Command {
  IsDone(): Standard_Boolean;
  Check(): void;
  delete(): void;
}

export declare class BRepBuilderAPI_MakeShape extends BRepBuilderAPI_Command {
  Build(): void;
  Shape(): TopoDS_Shape;
  Generated(S: TopoDS_Shape): TopTools_ListOfShape;
  Modified(S: TopoDS_Shape): TopTools_ListOfShape;
  IsDeleted(S: TopoDS_Shape): Standard_Boolean;
  delete(): void;
}

export declare class TopExp_Explorer {
  Init(S: TopoDS_Shape, ToFind: TopAbs_ShapeEnum, ToAvoid: TopAbs_ShapeEnum): void;
  More(): Standard_Boolean;
  Next(): void;
  Value(): TopoDS_Shape;
  Current(): TopoDS_Shape;
  ReInit(): void;
  Depth(): Graphic3d_ZLayerId;
  Clear(): void;
  Destroy(): void;
  delete(): void;
}

  export declare class TopExp_Explorer_1 extends TopExp_Explorer {
    constructor();
  }

  export declare class TopExp_Explorer_2 extends TopExp_Explorer {
    constructor(S: TopoDS_Shape, ToFind: TopAbs_ShapeEnum, ToAvoid: TopAbs_ShapeEnum);
  }

export declare class TopExp {
  constructor();
  static MapShapes_1(S: TopoDS_Shape, T: TopAbs_ShapeEnum, M: TopTools_IndexedMapOfShape): void;
  static MapShapes_2(S: TopoDS_Shape, M: TopTools_IndexedMapOfShape): void;
  static MapShapes_3(S: TopoDS_Shape, M: TopTools_MapOfShape): void;
  static MapShapesAndAncestors(S: TopoDS_Shape, TS: TopAbs_ShapeEnum, TA: TopAbs_ShapeEnum, M: TopTools_IndexedDataMapOfShapeListOfShape): void;
  static MapShapesAndUniqueAncestors(S: TopoDS_Shape, TS: TopAbs_ShapeEnum, TA: TopAbs_ShapeEnum, M: TopTools_IndexedDataMapOfShapeListOfShape, useOrientation: Standard_Boolean): void;
  static FirstVertex(E: TopoDS_Edge, CumOri: Standard_Boolean): TopoDS_Vertex;
  static LastVertex(E: TopoDS_Edge, CumOri: Standard_Boolean): TopoDS_Vertex;
  static Vertices_1(E: TopoDS_Edge, Vfirst: TopoDS_Vertex, Vlast: TopoDS_Vertex, CumOri: Standard_Boolean): void;
  static Vertices_2(W: TopoDS_Wire, Vfirst: TopoDS_Vertex, Vlast: TopoDS_Vertex): void;
  static CommonVertex(E1: TopoDS_Edge, E2: TopoDS_Edge, V: TopoDS_Vertex): Standard_Boolean;
  delete(): void;
}

export declare class TopLoc_Location {
  IsIdentity(): Standard_Boolean;
  Identity(): void;
  FirstDatum(): Handle_TopLoc_Datum3D;
  FirstPower(): Graphic3d_ZLayerId;
  NextLocation(): TopLoc_Location;
  Transformation(): gp_Trsf;
  Inverted(): TopLoc_Location;
  Multiplied(Other: TopLoc_Location): TopLoc_Location;
  Divided(Other: TopLoc_Location): TopLoc_Location;
  Predivided(Other: TopLoc_Location): TopLoc_Location;
  Powered(pwr: Graphic3d_ZLayerId): TopLoc_Location;
  HashCode(theUpperBound: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  IsEqual(Other: TopLoc_Location): Standard_Boolean;
  IsDifferent(Other: TopLoc_Location): Standard_Boolean;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  ShallowDump(S: Standard_OStream): void;
  delete(): void;
}

  export declare class TopLoc_Location_1 extends TopLoc_Location {
    constructor();
  }

  export declare class TopLoc_Location_2 extends TopLoc_Location {
    constructor(T: gp_Trsf);
  }

  export declare class TopLoc_Location_3 extends TopLoc_Location {
    constructor(D: Handle_TopLoc_Datum3D);
  }

export declare class TopoDS_Builder {
  constructor();
  MakeWire(W: TopoDS_Wire): void;
  MakeShell(S: TopoDS_Shell): void;
  MakeSolid(S: TopoDS_Solid): void;
  MakeCompSolid(C: TopoDS_CompSolid): void;
  MakeCompound(C: TopoDS_Compound): void;
  Add(S: TopoDS_Shape, C: TopoDS_Shape): void;
  Remove(S: TopoDS_Shape, C: TopoDS_Shape): void;
  delete(): void;
}

export declare class TopoDS_Shape {
  constructor()
  IsNull(): Standard_Boolean;
  Nullify(): void;
  Location_1(): TopLoc_Location;
  Location_2(theLoc: TopLoc_Location): void;
  Located(theLoc: TopLoc_Location): TopoDS_Shape;
  Orientation_1(): TopAbs_Orientation;
  Orientation_2(theOrient: TopAbs_Orientation): void;
  Oriented(theOrient: TopAbs_Orientation): TopoDS_Shape;
  TShape_1(): Handle_TopoDS_TShape;
  ShapeType(): TopAbs_ShapeEnum;
  Free_1(): Standard_Boolean;
  Free_2(theIsFree: Standard_Boolean): void;
  Locked_1(): Standard_Boolean;
  Locked_2(theIsLocked: Standard_Boolean): void;
  Modified_1(): Standard_Boolean;
  Modified_2(theIsModified: Standard_Boolean): void;
  Checked_1(): Standard_Boolean;
  Checked_2(theIsChecked: Standard_Boolean): void;
  Orientable_1(): Standard_Boolean;
  Orientable_2(theIsOrientable: Standard_Boolean): void;
  Closed_1(): Standard_Boolean;
  Closed_2(theIsClosed: Standard_Boolean): void;
  Infinite_1(): Standard_Boolean;
  Infinite_2(theIsInfinite: Standard_Boolean): void;
  Convex_1(): Standard_Boolean;
  Convex_2(theIsConvex: Standard_Boolean): void;
  Move(thePosition: TopLoc_Location): void;
  Moved(thePosition: TopLoc_Location): TopoDS_Shape;
  Reverse(): void;
  Reversed(): TopoDS_Shape;
  Complement(): void;
  Complemented(): TopoDS_Shape;
  Compose(theOrient: TopAbs_Orientation): void;
  Composed(theOrient: TopAbs_Orientation): TopoDS_Shape;
  NbChildren(): Graphic3d_ZLayerId;
  IsPartner(theOther: TopoDS_Shape): Standard_Boolean;
  IsSame(theOther: TopoDS_Shape): Standard_Boolean;
  IsEqual(theOther: TopoDS_Shape): Standard_Boolean;
  IsNotEqual(theOther: TopoDS_Shape): Standard_Boolean;
  HashCode(theUpperBound: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  EmptyCopy(): void;
  EmptyCopied(): TopoDS_Shape;
  TShape_2(theTShape: Handle_TopoDS_TShape): void;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

export declare class TopoDS_Edge extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class TopoDS_Face extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class TopoDS {
  constructor();
  static Vertex_1(S: TopoDS_Shape): TopoDS_Vertex;
  static Vertex_2(a0: TopoDS_Shape): TopoDS_Vertex;
  static Edge_1(S: TopoDS_Shape): TopoDS_Edge;
  static Edge_2(a0: TopoDS_Shape): TopoDS_Edge;
  static Wire_1(S: TopoDS_Shape): TopoDS_Wire;
  static Wire_2(a0: TopoDS_Shape): TopoDS_Wire;
  static Face_1(S: TopoDS_Shape): TopoDS_Face;
  static Face_2(a0: TopoDS_Shape): TopoDS_Face;
  static Shell_1(S: TopoDS_Shape): TopoDS_Shell;
  static Shell_2(a0: TopoDS_Shape): TopoDS_Shell;
  static Solid_1(S: TopoDS_Shape): TopoDS_Solid;
  static Solid_2(a0: TopoDS_Shape): TopoDS_Solid;
  static CompSolid_1(S: TopoDS_Shape): TopoDS_CompSolid;
  static CompSolid_2(a0: TopoDS_Shape): TopoDS_CompSolid;
  static Compound_1(S: TopoDS_Shape): TopoDS_Compound;
  static Compound_2(a0: TopoDS_Shape): TopoDS_Compound;
  delete(): void;
}

export declare class Poly_Triangle {
  Set_1(theN1: Graphic3d_ZLayerId, theN2: Graphic3d_ZLayerId, theN3: Graphic3d_ZLayerId): void;
  Set_2(theIndex: Graphic3d_ZLayerId, theNode: Graphic3d_ZLayerId): void;
  Get(theN1: Graphic3d_ZLayerId, theN2: Graphic3d_ZLayerId, theN3: Graphic3d_ZLayerId): void;
  Value(theIndex: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  ChangeValue(theIndex: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  delete(): void;
}

  export declare class Poly_Triangle_1 extends Poly_Triangle {
    constructor();
  }

  export declare class Poly_Triangle_2 extends Poly_Triangle {
    constructor(theN1: Graphic3d_ZLayerId, theN2: Graphic3d_ZLayerId, theN3: Graphic3d_ZLayerId);
  }

export declare class Poly_Connect {
  Load(theTriangulation: Handle_Poly_Triangulation): void;
  Triangulation(): Handle_Poly_Triangulation;
  Triangle(N: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  Triangles(T: Graphic3d_ZLayerId, t1: Graphic3d_ZLayerId, t2: Graphic3d_ZLayerId, t3: Graphic3d_ZLayerId): void;
  Nodes(T: Graphic3d_ZLayerId, n1: Graphic3d_ZLayerId, n2: Graphic3d_ZLayerId, n3: Graphic3d_ZLayerId): void;
  Initialize(N: Graphic3d_ZLayerId): void;
  More(): Standard_Boolean;
  Next(): void;
  Value(): Graphic3d_ZLayerId;
  delete(): void;
}

  export declare class Poly_Connect_1 extends Poly_Connect {
    constructor();
  }

  export declare class Poly_Connect_2 extends Poly_Connect {
    constructor(theTriangulation: Handle_Poly_Triangulation);
  }

export declare class Handle_Poly_PolygonOnTriangulation {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Poly_PolygonOnTriangulation): void;
  get(): Poly_PolygonOnTriangulation;
  delete(): void;
}

  export declare class Handle_Poly_PolygonOnTriangulation_1 extends Handle_Poly_PolygonOnTriangulation {
    constructor();
  }

  export declare class Handle_Poly_PolygonOnTriangulation_2 extends Handle_Poly_PolygonOnTriangulation {
    constructor(thePtr: Poly_PolygonOnTriangulation);
  }

  export declare class Handle_Poly_PolygonOnTriangulation_3 extends Handle_Poly_PolygonOnTriangulation {
    constructor(theHandle: Handle_Poly_PolygonOnTriangulation);
  }

  export declare class Handle_Poly_PolygonOnTriangulation_4 extends Handle_Poly_PolygonOnTriangulation {
    constructor(theHandle: Handle_Poly_PolygonOnTriangulation);
  }

export declare class Poly_PolygonOnTriangulation extends Standard_Transient {
  Copy(): Handle_Poly_PolygonOnTriangulation;
  Deflection_1(): Quantity_AbsorbedDose;
  Deflection_2(theDefl: Quantity_AbsorbedDose): void;
  NbNodes(): Graphic3d_ZLayerId;
  Nodes(): TColStd_Array1OfInteger;
  ChangeNodes(): TColStd_Array1OfInteger;
  HasParameters(): Standard_Boolean;
  Parameters(): Handle_TColStd_HArray1OfReal;
  ChangeParameters(): TColStd_Array1OfReal;
  SetParameters(theParameters: Handle_TColStd_HArray1OfReal): void;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Poly_PolygonOnTriangulation_1 extends Poly_PolygonOnTriangulation {
    constructor(theNbNodes: Graphic3d_ZLayerId, theHasParams: Standard_Boolean);
  }

  export declare class Poly_PolygonOnTriangulation_2 extends Poly_PolygonOnTriangulation {
    constructor(Nodes: TColStd_Array1OfInteger);
  }

  export declare class Poly_PolygonOnTriangulation_3 extends Poly_PolygonOnTriangulation {
    constructor(Nodes: TColStd_Array1OfInteger, Parameters: TColStd_Array1OfReal);
  }

export declare class Handle_Poly_Triangulation {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Poly_Triangulation): void;
  get(): Poly_Triangulation;
  delete(): void;
}

  export declare class Handle_Poly_Triangulation_1 extends Handle_Poly_Triangulation {
    constructor();
  }

  export declare class Handle_Poly_Triangulation_2 extends Handle_Poly_Triangulation {
    constructor(thePtr: Poly_Triangulation);
  }

  export declare class Handle_Poly_Triangulation_3 extends Handle_Poly_Triangulation {
    constructor(theHandle: Handle_Poly_Triangulation);
  }

  export declare class Handle_Poly_Triangulation_4 extends Handle_Poly_Triangulation {
    constructor(theHandle: Handle_Poly_Triangulation);
  }

export declare class Poly_Triangulation extends Standard_Transient {
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  Copy(): Handle_Poly_Triangulation;
  Deflection_1(): Quantity_AbsorbedDose;
  Deflection_2(theDeflection: Quantity_AbsorbedDose): void;
  RemoveUVNodes(): void;
  NbNodes(): Graphic3d_ZLayerId;
  NbTriangles(): Graphic3d_ZLayerId;
  HasUVNodes(): Standard_Boolean;
  Nodes(): TColgp_Array1OfPnt;
  ChangeNodes(): TColgp_Array1OfPnt;
  Node(theIndex: Graphic3d_ZLayerId): gp_Pnt;
  ChangeNode(theIndex: Graphic3d_ZLayerId): gp_Pnt;
  UVNodes(): TColgp_Array1OfPnt2d;
  ChangeUVNodes(): TColgp_Array1OfPnt2d;
  UVNode(theIndex: Graphic3d_ZLayerId): gp_Pnt2d;
  ChangeUVNode(theIndex: Graphic3d_ZLayerId): gp_Pnt2d;
  Triangles(): Poly_Array1OfTriangle;
  ChangeTriangles(): Poly_Array1OfTriangle;
  Triangle(theIndex: Graphic3d_ZLayerId): Poly_Triangle;
  ChangeTriangle(theIndex: Graphic3d_ZLayerId): Poly_Triangle;
  SetNormals(theNormals: Handle_TShort_HArray1OfShortReal): void;
  Normals(): TShort_Array1OfShortReal;
  ChangeNormals(): TShort_Array1OfShortReal;
  HasNormals(): Standard_Boolean;
  Normal(theIndex: Graphic3d_ZLayerId): gp_Dir;
  SetNormal(theIndex: Graphic3d_ZLayerId, theNormal: gp_Dir): void;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

  export declare class Poly_Triangulation_1 extends Poly_Triangulation {
    constructor(nbNodes: Graphic3d_ZLayerId, nbTriangles: Graphic3d_ZLayerId, UVNodes: Standard_Boolean);
  }

  export declare class Poly_Triangulation_2 extends Poly_Triangulation {
    constructor(Nodes: TColgp_Array1OfPnt, Triangles: Poly_Array1OfTriangle);
  }

  export declare class Poly_Triangulation_3 extends Poly_Triangulation {
    constructor(Nodes: TColgp_Array1OfPnt, UVNodes: TColgp_Array1OfPnt2d, Triangles: Poly_Array1OfTriangle);
  }

  export declare class Poly_Triangulation_4 extends Poly_Triangulation {
    constructor(theTriangulation: Handle_Poly_Triangulation);
  }

export declare class Poly_Array1OfTriangle {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Init(theValue: Poly_Triangle): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  IsEmpty(): Standard_Boolean;
  Lower(): Standard_Integer;
  Upper(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  IsAllocated(): Standard_Boolean;
  Assign(theOther: Poly_Array1OfTriangle): Poly_Array1OfTriangle;
  Move(theOther: Poly_Array1OfTriangle): Poly_Array1OfTriangle;
  First(): Poly_Triangle;
  ChangeFirst(): Poly_Triangle;
  Last(): Poly_Triangle;
  ChangeLast(): Poly_Triangle;
  Value(theIndex: Standard_Integer): Poly_Triangle;
  ChangeValue(theIndex: Standard_Integer): Poly_Triangle;
  SetValue(theIndex: Standard_Integer, theItem: Poly_Triangle): void;
  Resize(theLower: Standard_Integer, theUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class Poly_Array1OfTriangle_1 extends Poly_Array1OfTriangle {
    constructor();
  }

  export declare class Poly_Array1OfTriangle_2 extends Poly_Array1OfTriangle {
    constructor(theLower: Standard_Integer, theUpper: Standard_Integer);
  }

  export declare class Poly_Array1OfTriangle_3 extends Poly_Array1OfTriangle {
    constructor(theOther: Poly_Array1OfTriangle);
  }

  export declare class Poly_Array1OfTriangle_4 extends Poly_Array1OfTriangle {
    constructor(theOther: Poly_Array1OfTriangle);
  }

  export declare class Poly_Array1OfTriangle_5 extends Poly_Array1OfTriangle {
    constructor(theBegin: Poly_Triangle, theLower: Standard_Integer, theUpper: Standard_Integer);
  }

export declare class Handle_Poly_Polygon3D {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Poly_Polygon3D): void;
  get(): Poly_Polygon3D;
  delete(): void;
}

  export declare class Handle_Poly_Polygon3D_1 extends Handle_Poly_Polygon3D {
    constructor();
  }

  export declare class Handle_Poly_Polygon3D_2 extends Handle_Poly_Polygon3D {
    constructor(thePtr: Poly_Polygon3D);
  }

  export declare class Handle_Poly_Polygon3D_3 extends Handle_Poly_Polygon3D {
    constructor(theHandle: Handle_Poly_Polygon3D);
  }

  export declare class Handle_Poly_Polygon3D_4 extends Handle_Poly_Polygon3D {
    constructor(theHandle: Handle_Poly_Polygon3D);
  }

export declare class BRepTools {
  constructor();
  static UVBounds_1(F: TopoDS_Face, UMin: Quantity_AbsorbedDose, UMax: Quantity_AbsorbedDose, VMin: Quantity_AbsorbedDose, VMax: Quantity_AbsorbedDose): void;
  static UVBounds_2(F: TopoDS_Face, W: TopoDS_Wire, UMin: Quantity_AbsorbedDose, UMax: Quantity_AbsorbedDose, VMin: Quantity_AbsorbedDose, VMax: Quantity_AbsorbedDose): void;
  static UVBounds_3(F: TopoDS_Face, E: TopoDS_Edge, UMin: Quantity_AbsorbedDose, UMax: Quantity_AbsorbedDose, VMin: Quantity_AbsorbedDose, VMax: Quantity_AbsorbedDose): void;
  static AddUVBounds_1(F: TopoDS_Face, B: Bnd_Box2d): void;
  static AddUVBounds_2(F: TopoDS_Face, W: TopoDS_Wire, B: Bnd_Box2d): void;
  static AddUVBounds_3(F: TopoDS_Face, E: TopoDS_Edge, B: Bnd_Box2d): void;
  static Update_1(V: TopoDS_Vertex): void;
  static Update_2(E: TopoDS_Edge): void;
  static Update_3(W: TopoDS_Wire): void;
  static Update_4(F: TopoDS_Face): void;
  static Update_5(S: TopoDS_Shell): void;
  static Update_6(S: TopoDS_Solid): void;
  static Update_7(C: TopoDS_CompSolid): void;
  static Update_8(C: TopoDS_Compound): void;
  static Update_9(S: TopoDS_Shape): void;
  static UpdateFaceUVPoints(theF: TopoDS_Face): void;
  static Clean(S: TopoDS_Shape): void;
  static CleanGeometry(theShape: TopoDS_Shape): void;
  static RemoveUnusedPCurves(S: TopoDS_Shape): void;
  static Triangulation(theShape: TopoDS_Shape, theLinDefl: Quantity_AbsorbedDose, theToCheckFreeEdges: Standard_Boolean): Standard_Boolean;
  static Compare_1(V1: TopoDS_Vertex, V2: TopoDS_Vertex): Standard_Boolean;
  static Compare_2(E1: TopoDS_Edge, E2: TopoDS_Edge): Standard_Boolean;
  static OuterWire(F: TopoDS_Face): TopoDS_Wire;
  static Map3DEdges(S: TopoDS_Shape, M: TopTools_IndexedMapOfShape): void;
  static IsReallyClosed(E: TopoDS_Edge, F: TopoDS_Face): Standard_Boolean;
  static DetectClosedness(theFace: TopoDS_Face, theUclosed: Standard_Boolean, theVclosed: Standard_Boolean): void;
  static Dump(Sh: TopoDS_Shape, S: Standard_OStream): void;
  static Write_1(Sh: TopoDS_Shape, S: Standard_OStream, theProgress: Message_ProgressRange): void;
  static Read_1(Sh: TopoDS_Shape, S: Standard_IStream, B: BRep_Builder, theProgress: Message_ProgressRange): void;
  static Write_2(Sh: TopoDS_Shape, File: Standard_CString, theProgress: Message_ProgressRange): Standard_Boolean;
  static Read_2(Sh: TopoDS_Shape, File: Standard_CString, B: BRep_Builder, theProgress: Message_ProgressRange): Standard_Boolean;
  static EvalAndUpdateTol(theE: TopoDS_Edge, theC3d: Handle_Geom_Curve, theC2d: Handle_Geom2d_Curve, theS: Handle_Geom_Surface, theF: Quantity_AbsorbedDose, theL: Quantity_AbsorbedDose): Quantity_AbsorbedDose;
  static OriEdgeInFace(theEdge: TopoDS_Edge, theFace: TopoDS_Face): TopAbs_Orientation;
  static RemoveInternals(theS: TopoDS_Shape, theForce: Standard_Boolean): void;
  delete(): void;
}

export declare class BRep_Builder extends TopoDS_Builder {
  constructor();
  MakeFace_1(F: TopoDS_Face): void;
  MakeFace_2(F: TopoDS_Face, S: Handle_Geom_Surface, Tol: Quantity_AbsorbedDose): void;
  MakeFace_3(F: TopoDS_Face, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Quantity_AbsorbedDose): void;
  MakeFace_4(F: TopoDS_Face, T: Handle_Poly_Triangulation): void;
  UpdateFace_1(F: TopoDS_Face, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Quantity_AbsorbedDose): void;
  UpdateFace_2(F: TopoDS_Face, T: Handle_Poly_Triangulation): void;
  UpdateFace_3(F: TopoDS_Face, Tol: Quantity_AbsorbedDose): void;
  NaturalRestriction(F: TopoDS_Face, N: Standard_Boolean): void;
  MakeEdge_1(E: TopoDS_Edge): void;
  MakeEdge_2(E: TopoDS_Edge, C: Handle_Geom_Curve, Tol: Quantity_AbsorbedDose): void;
  MakeEdge_3(E: TopoDS_Edge, C: Handle_Geom_Curve, L: TopLoc_Location, Tol: Quantity_AbsorbedDose): void;
  MakeEdge_4(E: TopoDS_Edge, P: Handle_Poly_Polygon3D): void;
  MakeEdge_5(E: TopoDS_Edge, N: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation): void;
  MakeEdge_6(E: TopoDS_Edge, N: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location): void;
  UpdateEdge_1(E: TopoDS_Edge, C: Handle_Geom_Curve, Tol: Quantity_AbsorbedDose): void;
  UpdateEdge_2(E: TopoDS_Edge, C: Handle_Geom_Curve, L: TopLoc_Location, Tol: Quantity_AbsorbedDose): void;
  UpdateEdge_3(E: TopoDS_Edge, C: Handle_Geom2d_Curve, F: TopoDS_Face, Tol: Quantity_AbsorbedDose): void;
  UpdateEdge_4(E: TopoDS_Edge, C1: Handle_Geom2d_Curve, C2: Handle_Geom2d_Curve, F: TopoDS_Face, Tol: Quantity_AbsorbedDose): void;
  UpdateEdge_5(E: TopoDS_Edge, C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Quantity_AbsorbedDose): void;
  UpdateEdge_6(E: TopoDS_Edge, C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Quantity_AbsorbedDose, Pf: gp_Pnt2d, Pl: gp_Pnt2d): void;
  UpdateEdge_7(E: TopoDS_Edge, C1: Handle_Geom2d_Curve, C2: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Quantity_AbsorbedDose): void;
  UpdateEdge_8(E: TopoDS_Edge, C1: Handle_Geom2d_Curve, C2: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Quantity_AbsorbedDose, Pf: gp_Pnt2d, Pl: gp_Pnt2d): void;
  UpdateEdge_9(E: TopoDS_Edge, P: Handle_Poly_Polygon3D): void;
  UpdateEdge_10(E: TopoDS_Edge, P: Handle_Poly_Polygon3D, L: TopLoc_Location): void;
  UpdateEdge_11(E: TopoDS_Edge, N: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation): void;
  UpdateEdge_12(E: TopoDS_Edge, N: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location): void;
  UpdateEdge_13(E: TopoDS_Edge, N1: Handle_Poly_PolygonOnTriangulation, N2: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation): void;
  UpdateEdge_14(E: TopoDS_Edge, N1: Handle_Poly_PolygonOnTriangulation, N2: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location): void;
  UpdateEdge_15(E: TopoDS_Edge, P: Handle_Poly_Polygon2D, S: TopoDS_Face): void;
  UpdateEdge_16(E: TopoDS_Edge, P: Handle_Poly_Polygon2D, S: Handle_Geom_Surface, T: TopLoc_Location): void;
  UpdateEdge_17(E: TopoDS_Edge, P1: Handle_Poly_Polygon2D, P2: Handle_Poly_Polygon2D, S: TopoDS_Face): void;
  UpdateEdge_18(E: TopoDS_Edge, P1: Handle_Poly_Polygon2D, P2: Handle_Poly_Polygon2D, S: Handle_Geom_Surface, L: TopLoc_Location): void;
  UpdateEdge_19(E: TopoDS_Edge, Tol: Quantity_AbsorbedDose): void;
  Continuity_1(E: TopoDS_Edge, F1: TopoDS_Face, F2: TopoDS_Face, C: GeomAbs_Shape): void;
  Continuity_2(E: TopoDS_Edge, S1: Handle_Geom_Surface, S2: Handle_Geom_Surface, L1: TopLoc_Location, L2: TopLoc_Location, C: GeomAbs_Shape): void;
  SameParameter(E: TopoDS_Edge, S: Standard_Boolean): void;
  SameRange(E: TopoDS_Edge, S: Standard_Boolean): void;
  Degenerated(E: TopoDS_Edge, D: Standard_Boolean): void;
  Range_1(E: TopoDS_Edge, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose, Only3d: Standard_Boolean): void;
  Range_2(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): void;
  Range_3(E: TopoDS_Edge, F: TopoDS_Face, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): void;
  Transfert_1(Ein: TopoDS_Edge, Eout: TopoDS_Edge): void;
  MakeVertex_1(V: TopoDS_Vertex): void;
  MakeVertex_2(V: TopoDS_Vertex, P: gp_Pnt, Tol: Quantity_AbsorbedDose): void;
  UpdateVertex_1(V: TopoDS_Vertex, P: gp_Pnt, Tol: Quantity_AbsorbedDose): void;
  UpdateVertex_2(V: TopoDS_Vertex, P: Quantity_AbsorbedDose, E: TopoDS_Edge, Tol: Quantity_AbsorbedDose): void;
  UpdateVertex_3(V: TopoDS_Vertex, P: Quantity_AbsorbedDose, E: TopoDS_Edge, F: TopoDS_Face, Tol: Quantity_AbsorbedDose): void;
  UpdateVertex_4(V: TopoDS_Vertex, P: Quantity_AbsorbedDose, E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Quantity_AbsorbedDose): void;
  UpdateVertex_5(Ve: TopoDS_Vertex, U: Quantity_AbsorbedDose, V: Quantity_AbsorbedDose, F: TopoDS_Face, Tol: Quantity_AbsorbedDose): void;
  UpdateVertex_6(V: TopoDS_Vertex, Tol: Quantity_AbsorbedDose): void;
  Transfert_2(Ein: TopoDS_Edge, Eout: TopoDS_Edge, Vin: TopoDS_Vertex, Vout: TopoDS_Vertex): void;
  delete(): void;
}

export declare class BRep_Tool {
  constructor();
  static IsClosed_1(S: TopoDS_Shape): Standard_Boolean;
  static Surface_1(F: TopoDS_Face, L: TopLoc_Location): Handle_Geom_Surface;
  static Surface_2(F: TopoDS_Face): Handle_Geom_Surface;
  static Triangulation(F: TopoDS_Face, L: TopLoc_Location): Handle_Poly_Triangulation;
  static Tolerance_1(F: TopoDS_Face): Quantity_AbsorbedDose;
  static NaturalRestriction(F: TopoDS_Face): Standard_Boolean;
  static IsGeometric_1(F: TopoDS_Face): Standard_Boolean;
  static IsGeometric_2(E: TopoDS_Edge): Standard_Boolean;
  static Curve_1(E: TopoDS_Edge, L: TopLoc_Location, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): Handle_Geom_Curve;
  static Curve_2(E: TopoDS_Edge, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): Handle_Geom_Curve;
  static Polygon3D(E: TopoDS_Edge, L: TopLoc_Location): Handle_Poly_Polygon3D;
  static CurveOnSurface_1(E: TopoDS_Edge, F: TopoDS_Face, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose, theIsStored: Standard_Boolean): Handle_Geom2d_Curve;
  static CurveOnSurface_2(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose, theIsStored: Standard_Boolean): Handle_Geom2d_Curve;
  static CurveOnPlane(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): Handle_Geom2d_Curve;
  static CurveOnSurface_3(E: TopoDS_Edge, C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): void;
  static CurveOnSurface_4(E: TopoDS_Edge, C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose, Index: Graphic3d_ZLayerId): void;
  static PolygonOnSurface_1(E: TopoDS_Edge, F: TopoDS_Face): Handle_Poly_Polygon2D;
  static PolygonOnSurface_2(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location): Handle_Poly_Polygon2D;
  static PolygonOnSurface_3(E: TopoDS_Edge, C: Handle_Poly_Polygon2D, S: Handle_Geom_Surface, L: TopLoc_Location): void;
  static PolygonOnSurface_4(E: TopoDS_Edge, C: Handle_Poly_Polygon2D, S: Handle_Geom_Surface, L: TopLoc_Location, Index: Graphic3d_ZLayerId): void;
  static PolygonOnTriangulation_1(E: TopoDS_Edge, T: Handle_Poly_Triangulation, L: TopLoc_Location): Handle_Poly_PolygonOnTriangulation;
  static PolygonOnTriangulation_2(E: TopoDS_Edge, P: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location): void;
  static PolygonOnTriangulation_3(E: TopoDS_Edge, P: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location, Index: Graphic3d_ZLayerId): void;
  static IsClosed_2(E: TopoDS_Edge, F: TopoDS_Face): Standard_Boolean;
  static IsClosed_3(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location): Standard_Boolean;
  static IsClosed_4(E: TopoDS_Edge, T: Handle_Poly_Triangulation, L: TopLoc_Location): Standard_Boolean;
  static Tolerance_2(E: TopoDS_Edge): Quantity_AbsorbedDose;
  static SameParameter(E: TopoDS_Edge): Standard_Boolean;
  static SameRange(E: TopoDS_Edge): Standard_Boolean;
  static Degenerated(E: TopoDS_Edge): Standard_Boolean;
  static Range_1(E: TopoDS_Edge, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): void;
  static Range_2(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): void;
  static Range_3(E: TopoDS_Edge, F: TopoDS_Face, First: Quantity_AbsorbedDose, Last: Quantity_AbsorbedDose): void;
  static UVPoints_1(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, PFirst: gp_Pnt2d, PLast: gp_Pnt2d): void;
  static UVPoints_2(E: TopoDS_Edge, F: TopoDS_Face, PFirst: gp_Pnt2d, PLast: gp_Pnt2d): void;
  static SetUVPoints_1(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, PFirst: gp_Pnt2d, PLast: gp_Pnt2d): void;
  static SetUVPoints_2(E: TopoDS_Edge, F: TopoDS_Face, PFirst: gp_Pnt2d, PLast: gp_Pnt2d): void;
  static HasContinuity_1(E: TopoDS_Edge, F1: TopoDS_Face, F2: TopoDS_Face): Standard_Boolean;
  static Continuity_1(E: TopoDS_Edge, F1: TopoDS_Face, F2: TopoDS_Face): GeomAbs_Shape;
  static HasContinuity_2(E: TopoDS_Edge, S1: Handle_Geom_Surface, S2: Handle_Geom_Surface, L1: TopLoc_Location, L2: TopLoc_Location): Standard_Boolean;
  static Continuity_2(E: TopoDS_Edge, S1: Handle_Geom_Surface, S2: Handle_Geom_Surface, L1: TopLoc_Location, L2: TopLoc_Location): GeomAbs_Shape;
  static HasContinuity_3(E: TopoDS_Edge): Standard_Boolean;
  static MaxContinuity(theEdge: TopoDS_Edge): GeomAbs_Shape;
  static Pnt(V: TopoDS_Vertex): gp_Pnt;
  static Tolerance_3(V: TopoDS_Vertex): Quantity_AbsorbedDose;
  static Parameter_1(theV: TopoDS_Vertex, theE: TopoDS_Edge, theParam: Quantity_AbsorbedDose): Standard_Boolean;
  static Parameter_2(V: TopoDS_Vertex, E: TopoDS_Edge): Quantity_AbsorbedDose;
  static Parameter_3(V: TopoDS_Vertex, E: TopoDS_Edge, F: TopoDS_Face): Quantity_AbsorbedDose;
  static Parameter_4(V: TopoDS_Vertex, E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location): Quantity_AbsorbedDose;
  static Parameters(V: TopoDS_Vertex, F: TopoDS_Face): gp_Pnt2d;
  static MaxTolerance(theShape: TopoDS_Shape, theSubShape: TopAbs_ShapeEnum): Quantity_AbsorbedDose;
  delete(): void;
}

export declare class gp_Trsf {
  SetMirror_1(P: gp_Pnt): void;
  SetMirror_2(A1: gp_Ax1): void;
  SetMirror_3(A2: gp_Ax2): void;
  SetRotation_1(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): void;
  SetRotation_2(R: gp_Quaternion): void;
  SetRotationPart(R: gp_Quaternion): void;
  SetScale(P: gp_Pnt, S: Quantity_AbsorbedDose): void;
  SetDisplacement(FromSystem1: gp_Ax3, ToSystem2: gp_Ax3): void;
  SetTransformation_1(FromSystem1: gp_Ax3, ToSystem2: gp_Ax3): void;
  SetTransformation_2(ToSystem: gp_Ax3): void;
  SetTransformation_3(R: gp_Quaternion, T: gp_Vec): void;
  SetTranslation_1(V: gp_Vec): void;
  SetTranslation_2(P1: gp_Pnt, P2: gp_Pnt): void;
  SetTranslationPart(V: gp_Vec): void;
  SetScaleFactor(S: Quantity_AbsorbedDose): void;
  SetForm(P: gp_TrsfForm): void;
  SetValues(a11: Quantity_AbsorbedDose, a12: Quantity_AbsorbedDose, a13: Quantity_AbsorbedDose, a14: Quantity_AbsorbedDose, a21: Quantity_AbsorbedDose, a22: Quantity_AbsorbedDose, a23: Quantity_AbsorbedDose, a24: Quantity_AbsorbedDose, a31: Quantity_AbsorbedDose, a32: Quantity_AbsorbedDose, a33: Quantity_AbsorbedDose, a34: Quantity_AbsorbedDose): void;
  IsNegative(): Standard_Boolean;
  Form(): gp_TrsfForm;
  ScaleFactor(): Quantity_AbsorbedDose;
  TranslationPart(): gp_XYZ;
  GetRotation_1(theAxis: gp_XYZ, theAngle: Quantity_AbsorbedDose): Standard_Boolean;
  GetRotation_2(): gp_Quaternion;
  VectorialPart(): gp_Mat;
  HVectorialPart(): gp_Mat;
  Value(Row: Graphic3d_ZLayerId, Col: Graphic3d_ZLayerId): Quantity_AbsorbedDose;
  Invert(): void;
  Inverted(): gp_Trsf;
  Multiplied(T: gp_Trsf): gp_Trsf;
  Multiply(T: gp_Trsf): void;
  PreMultiply(T: gp_Trsf): void;
  Power(N: Graphic3d_ZLayerId): void;
  Powered(N: Graphic3d_ZLayerId): gp_Trsf;
  Transforms_1(X: Quantity_AbsorbedDose, Y: Quantity_AbsorbedDose, Z: Quantity_AbsorbedDose): void;
  Transforms_2(Coord: gp_XYZ): void;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Trsf_1 extends gp_Trsf {
    constructor();
  }

  export declare class gp_Trsf_2 extends gp_Trsf {
    constructor(T: gp_Trsf2d);
  }

export declare class gp_Dir {
  SetCoord_1(Index: Graphic3d_ZLayerId, Xi: Quantity_AbsorbedDose): void;
  SetCoord_2(Xv: Quantity_AbsorbedDose, Yv: Quantity_AbsorbedDose, Zv: Quantity_AbsorbedDose): void;
  SetX(X: Quantity_AbsorbedDose): void;
  SetY(Y: Quantity_AbsorbedDose): void;
  SetZ(Z: Quantity_AbsorbedDose): void;
  SetXYZ(Coord: gp_XYZ): void;
  Coord_1(Index: Graphic3d_ZLayerId): Quantity_AbsorbedDose;
  Coord_2(Xv: Quantity_AbsorbedDose, Yv: Quantity_AbsorbedDose, Zv: Quantity_AbsorbedDose): void;
  X(): Quantity_AbsorbedDose;
  Y(): Quantity_AbsorbedDose;
  Z(): Quantity_AbsorbedDose;
  XYZ(): gp_XYZ;
  IsEqual(Other: gp_Dir, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsNormal(Other: gp_Dir, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsOpposite(Other: gp_Dir, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsParallel(Other: gp_Dir, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  Angle(Other: gp_Dir): Quantity_AbsorbedDose;
  AngleWithRef(Other: gp_Dir, VRef: gp_Dir): Quantity_AbsorbedDose;
  Cross(Right: gp_Dir): void;
  Crossed(Right: gp_Dir): gp_Dir;
  CrossCross(V1: gp_Dir, V2: gp_Dir): void;
  CrossCrossed(V1: gp_Dir, V2: gp_Dir): gp_Dir;
  Dot(Other: gp_Dir): Quantity_AbsorbedDose;
  DotCross(V1: gp_Dir, V2: gp_Dir): Quantity_AbsorbedDose;
  Reverse(): void;
  Reversed(): gp_Dir;
  Mirror_1(V: gp_Dir): void;
  Mirrored_1(V: gp_Dir): gp_Dir;
  Mirror_2(A1: gp_Ax1): void;
  Mirrored_2(A1: gp_Ax1): gp_Dir;
  Mirror_3(A2: gp_Ax2): void;
  Mirrored_3(A2: gp_Ax2): gp_Dir;
  Rotate(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): void;
  Rotated(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): gp_Dir;
  Transform(T: gp_Trsf): void;
  Transformed(T: gp_Trsf): gp_Dir;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Dir_1 extends gp_Dir {
    constructor();
  }

  export declare class gp_Dir_2 extends gp_Dir {
    constructor(V: gp_Vec);
  }

  export declare class gp_Dir_3 extends gp_Dir {
    constructor(Coord: gp_XYZ);
  }

  export declare class gp_Dir_4 extends gp_Dir {
    constructor(Xv: Quantity_AbsorbedDose, Yv: Quantity_AbsorbedDose, Zv: Quantity_AbsorbedDose);
  }

export declare class gp_Pnt {
  SetCoord_1(Index: Graphic3d_ZLayerId, Xi: Quantity_AbsorbedDose): void;
  SetCoord_2(Xp: Quantity_AbsorbedDose, Yp: Quantity_AbsorbedDose, Zp: Quantity_AbsorbedDose): void;
  SetX(X: Quantity_AbsorbedDose): void;
  SetY(Y: Quantity_AbsorbedDose): void;
  SetZ(Z: Quantity_AbsorbedDose): void;
  SetXYZ(Coord: gp_XYZ): void;
  Coord_1(Index: Graphic3d_ZLayerId): Quantity_AbsorbedDose;
  Coord_2(Xp: Quantity_AbsorbedDose, Yp: Quantity_AbsorbedDose, Zp: Quantity_AbsorbedDose): void;
  X(): Quantity_AbsorbedDose;
  Y(): Quantity_AbsorbedDose;
  Z(): Quantity_AbsorbedDose;
  XYZ(): gp_XYZ;
  Coord_3(): gp_XYZ;
  ChangeCoord(): gp_XYZ;
  BaryCenter(Alpha: Quantity_AbsorbedDose, P: gp_Pnt, Beta: Quantity_AbsorbedDose): void;
  IsEqual(Other: gp_Pnt, LinearTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  Distance(Other: gp_Pnt): Quantity_AbsorbedDose;
  SquareDistance(Other: gp_Pnt): Quantity_AbsorbedDose;
  Mirror_1(P: gp_Pnt): void;
  Mirrored_1(P: gp_Pnt): gp_Pnt;
  Mirror_2(A1: gp_Ax1): void;
  Mirrored_2(A1: gp_Ax1): gp_Pnt;
  Mirror_3(A2: gp_Ax2): void;
  Mirrored_3(A2: gp_Ax2): gp_Pnt;
  Rotate(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): void;
  Rotated(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): gp_Pnt;
  Scale(P: gp_Pnt, S: Quantity_AbsorbedDose): void;
  Scaled(P: gp_Pnt, S: Quantity_AbsorbedDose): gp_Pnt;
  Transform(T: gp_Trsf): void;
  Transformed(T: gp_Trsf): gp_Pnt;
  Translate_1(V: gp_Vec): void;
  Translated_1(V: gp_Vec): gp_Pnt;
  Translate_2(P1: gp_Pnt, P2: gp_Pnt): void;
  Translated_2(P1: gp_Pnt, P2: gp_Pnt): gp_Pnt;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Pnt_1 extends gp_Pnt {
    constructor();
  }

  export declare class gp_Pnt_2 extends gp_Pnt {
    constructor(Coord: gp_XYZ);
  }

  export declare class gp_Pnt_3 extends gp_Pnt {
    constructor(Xp: Quantity_AbsorbedDose, Yp: Quantity_AbsorbedDose, Zp: Quantity_AbsorbedDose);
  }

export declare class gp_Vec {
  SetCoord_1(Index: Graphic3d_ZLayerId, Xi: Quantity_AbsorbedDose): void;
  SetCoord_2(Xv: Quantity_AbsorbedDose, Yv: Quantity_AbsorbedDose, Zv: Quantity_AbsorbedDose): void;
  SetX(X: Quantity_AbsorbedDose): void;
  SetY(Y: Quantity_AbsorbedDose): void;
  SetZ(Z: Quantity_AbsorbedDose): void;
  SetXYZ(Coord: gp_XYZ): void;
  Coord_1(Index: Graphic3d_ZLayerId): Quantity_AbsorbedDose;
  Coord_2(Xv: Quantity_AbsorbedDose, Yv: Quantity_AbsorbedDose, Zv: Quantity_AbsorbedDose): void;
  X(): Quantity_AbsorbedDose;
  Y(): Quantity_AbsorbedDose;
  Z(): Quantity_AbsorbedDose;
  XYZ(): gp_XYZ;
  IsEqual(Other: gp_Vec, LinearTolerance: Quantity_AbsorbedDose, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsNormal(Other: gp_Vec, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsOpposite(Other: gp_Vec, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsParallel(Other: gp_Vec, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  Angle(Other: gp_Vec): Quantity_AbsorbedDose;
  AngleWithRef(Other: gp_Vec, VRef: gp_Vec): Quantity_AbsorbedDose;
  Magnitude(): Quantity_AbsorbedDose;
  SquareMagnitude(): Quantity_AbsorbedDose;
  Add(Other: gp_Vec): void;
  Added(Other: gp_Vec): gp_Vec;
  Subtract(Right: gp_Vec): void;
  Subtracted(Right: gp_Vec): gp_Vec;
  Multiply(Scalar: Quantity_AbsorbedDose): void;
  Multiplied(Scalar: Quantity_AbsorbedDose): gp_Vec;
  Divide(Scalar: Quantity_AbsorbedDose): void;
  Divided(Scalar: Quantity_AbsorbedDose): gp_Vec;
  Cross(Right: gp_Vec): void;
  Crossed(Right: gp_Vec): gp_Vec;
  CrossMagnitude(Right: gp_Vec): Quantity_AbsorbedDose;
  CrossSquareMagnitude(Right: gp_Vec): Quantity_AbsorbedDose;
  CrossCross(V1: gp_Vec, V2: gp_Vec): void;
  CrossCrossed(V1: gp_Vec, V2: gp_Vec): gp_Vec;
  Dot(Other: gp_Vec): Quantity_AbsorbedDose;
  DotCross(V1: gp_Vec, V2: gp_Vec): Quantity_AbsorbedDose;
  Normalize(): void;
  Normalized(): gp_Vec;
  Reverse(): void;
  Reversed(): gp_Vec;
  SetLinearForm_1(A1: Quantity_AbsorbedDose, V1: gp_Vec, A2: Quantity_AbsorbedDose, V2: gp_Vec, A3: Quantity_AbsorbedDose, V3: gp_Vec, V4: gp_Vec): void;
  SetLinearForm_2(A1: Quantity_AbsorbedDose, V1: gp_Vec, A2: Quantity_AbsorbedDose, V2: gp_Vec, A3: Quantity_AbsorbedDose, V3: gp_Vec): void;
  SetLinearForm_3(A1: Quantity_AbsorbedDose, V1: gp_Vec, A2: Quantity_AbsorbedDose, V2: gp_Vec, V3: gp_Vec): void;
  SetLinearForm_4(A1: Quantity_AbsorbedDose, V1: gp_Vec, A2: Quantity_AbsorbedDose, V2: gp_Vec): void;
  SetLinearForm_5(A1: Quantity_AbsorbedDose, V1: gp_Vec, V2: gp_Vec): void;
  SetLinearForm_6(V1: gp_Vec, V2: gp_Vec): void;
  Mirror_1(V: gp_Vec): void;
  Mirrored_1(V: gp_Vec): gp_Vec;
  Mirror_2(A1: gp_Ax1): void;
  Mirrored_2(A1: gp_Ax1): gp_Vec;
  Mirror_3(A2: gp_Ax2): void;
  Mirrored_3(A2: gp_Ax2): gp_Vec;
  Rotate(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): void;
  Rotated(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): gp_Vec;
  Scale(S: Quantity_AbsorbedDose): void;
  Scaled(S: Quantity_AbsorbedDose): gp_Vec;
  Transform(T: gp_Trsf): void;
  Transformed(T: gp_Trsf): gp_Vec;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

  export declare class gp_Vec_1 extends gp_Vec {
    constructor();
  }

  export declare class gp_Vec_2 extends gp_Vec {
    constructor(V: gp_Dir);
  }

  export declare class gp_Vec_3 extends gp_Vec {
    constructor(Coord: gp_XYZ);
  }

  export declare class gp_Vec_4 extends gp_Vec {
    constructor(Xv: Quantity_AbsorbedDose, Yv: Quantity_AbsorbedDose, Zv: Quantity_AbsorbedDose);
  }

  export declare class gp_Vec_5 extends gp_Vec {
    constructor(P1: gp_Pnt, P2: gp_Pnt);
  }

export declare class gp_Ax1 {
  SetDirection(V: gp_Dir): void;
  SetLocation(P: gp_Pnt): void;
  Direction(): gp_Dir;
  Location(): gp_Pnt;
  IsCoaxial(Other: gp_Ax1, AngularTolerance: Quantity_AbsorbedDose, LinearTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsNormal(Other: gp_Ax1, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsOpposite(Other: gp_Ax1, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  IsParallel(Other: gp_Ax1, AngularTolerance: Quantity_AbsorbedDose): Standard_Boolean;
  Angle(Other: gp_Ax1): Quantity_AbsorbedDose;
  Reverse(): void;
  Reversed(): gp_Ax1;
  Mirror_1(P: gp_Pnt): void;
  Mirrored_1(P: gp_Pnt): gp_Ax1;
  Mirror_2(A1: gp_Ax1): void;
  Mirrored_2(A1: gp_Ax1): gp_Ax1;
  Mirror_3(A2: gp_Ax2): void;
  Mirrored_3(A2: gp_Ax2): gp_Ax1;
  Rotate(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): void;
  Rotated(A1: gp_Ax1, Ang: Quantity_AbsorbedDose): gp_Ax1;
  Scale(P: gp_Pnt, S: Quantity_AbsorbedDose): void;
  Scaled(P: gp_Pnt, S: Quantity_AbsorbedDose): gp_Ax1;
  Transform(T: gp_Trsf): void;
  Transformed(T: gp_Trsf): gp_Ax1;
  Translate_1(V: gp_Vec): void;
  Translated_1(V: gp_Vec): gp_Ax1;
  Translate_2(P1: gp_Pnt, P2: gp_Pnt): void;
  Translated_2(P1: gp_Pnt, P2: gp_Pnt): gp_Ax1;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Ax1_1 extends gp_Ax1 {
    constructor();
  }

  export declare class gp_Ax1_2 extends gp_Ax1 {
    constructor(P: gp_Pnt, V: gp_Dir);
  }

export declare class BRepPrimAPI_MakeSphere extends BRepPrimAPI_MakeOneAxis {
  OneAxis(): Standard_Address;
  Sphere(): BRepPrim_Sphere;
  delete(): void;
}

  export declare class BRepPrimAPI_MakeSphere_1 extends BRepPrimAPI_MakeSphere {
    constructor(R: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_2 extends BRepPrimAPI_MakeSphere {
    constructor(R: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_3 extends BRepPrimAPI_MakeSphere {
    constructor(R: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_4 extends BRepPrimAPI_MakeSphere {
    constructor(R: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose, angle3: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_5 extends BRepPrimAPI_MakeSphere {
    constructor(Center: gp_Pnt, R: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_6 extends BRepPrimAPI_MakeSphere {
    constructor(Center: gp_Pnt, R: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_7 extends BRepPrimAPI_MakeSphere {
    constructor(Center: gp_Pnt, R: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_8 extends BRepPrimAPI_MakeSphere {
    constructor(Center: gp_Pnt, R: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose, angle3: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_9 extends BRepPrimAPI_MakeSphere {
    constructor(Axis: gp_Ax2, R: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_10 extends BRepPrimAPI_MakeSphere {
    constructor(Axis: gp_Ax2, R: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_11 extends BRepPrimAPI_MakeSphere {
    constructor(Axis: gp_Ax2, R: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeSphere_12 extends BRepPrimAPI_MakeSphere {
    constructor(Axis: gp_Ax2, R: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose, angle3: Quantity_AbsorbedDose);
  }

export declare class BRepPrimAPI_MakeCylinder extends BRepPrimAPI_MakeOneAxis {
  OneAxis(): Standard_Address;
  Cylinder(): BRepPrim_Cylinder;
  delete(): void;
}

  export declare class BRepPrimAPI_MakeCylinder_1 extends BRepPrimAPI_MakeCylinder {
    constructor(R: Quantity_AbsorbedDose, H: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeCylinder_2 extends BRepPrimAPI_MakeCylinder {
    constructor(R: Quantity_AbsorbedDose, H: Quantity_AbsorbedDose, Angle: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeCylinder_3 extends BRepPrimAPI_MakeCylinder {
    constructor(Axes: gp_Ax2, R: Quantity_AbsorbedDose, H: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeCylinder_4 extends BRepPrimAPI_MakeCylinder {
    constructor(Axes: gp_Ax2, R: Quantity_AbsorbedDose, H: Quantity_AbsorbedDose, Angle: Quantity_AbsorbedDose);
  }

export declare class BRepPrimAPI_MakeTorus extends BRepPrimAPI_MakeOneAxis {
  OneAxis(): Standard_Address;
  Torus(): BRepPrim_Torus;
  delete(): void;
}

  export declare class BRepPrimAPI_MakeTorus_1 extends BRepPrimAPI_MakeTorus {
    constructor(R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeTorus_2 extends BRepPrimAPI_MakeTorus {
    constructor(R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeTorus_3 extends BRepPrimAPI_MakeTorus {
    constructor(R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeTorus_4 extends BRepPrimAPI_MakeTorus {
    constructor(R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeTorus_5 extends BRepPrimAPI_MakeTorus {
    constructor(Axes: gp_Ax2, R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeTorus_6 extends BRepPrimAPI_MakeTorus {
    constructor(Axes: gp_Ax2, R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeTorus_7 extends BRepPrimAPI_MakeTorus {
    constructor(Axes: gp_Ax2, R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeTorus_8 extends BRepPrimAPI_MakeTorus {
    constructor(Axes: gp_Ax2, R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, angle1: Quantity_AbsorbedDose, angle2: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

export declare class BRepPrimAPI_MakeOneAxis extends BRepBuilderAPI_MakeShape {
  OneAxis(): Standard_Address;
  Build(): void;
  Face(): TopoDS_Face;
  Shell(): TopoDS_Shell;
  Solid(): TopoDS_Solid;
  delete(): void;
}

export declare class BRepPrimAPI_MakeCone extends BRepPrimAPI_MakeOneAxis {
  OneAxis(): Standard_Address;
  Cone(): BRepPrim_Cone;
  delete(): void;
}

  export declare class BRepPrimAPI_MakeCone_1 extends BRepPrimAPI_MakeCone {
    constructor(R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, H: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeCone_2 extends BRepPrimAPI_MakeCone {
    constructor(R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, H: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeCone_3 extends BRepPrimAPI_MakeCone {
    constructor(Axes: gp_Ax2, R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, H: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeCone_4 extends BRepPrimAPI_MakeCone {
    constructor(Axes: gp_Ax2, R1: Quantity_AbsorbedDose, R2: Quantity_AbsorbedDose, H: Quantity_AbsorbedDose, angle: Quantity_AbsorbedDose);
  }

export declare class BRepPrimAPI_MakeBox extends BRepBuilderAPI_MakeShape {
  Init_1(theDX: Quantity_AbsorbedDose, theDY: Quantity_AbsorbedDose, theDZ: Quantity_AbsorbedDose): void;
  Init_2(thePnt: gp_Pnt, theDX: Quantity_AbsorbedDose, theDY: Quantity_AbsorbedDose, theDZ: Quantity_AbsorbedDose): void;
  Init_3(thePnt1: gp_Pnt, thePnt2: gp_Pnt): void;
  Init_4(theAxes: gp_Ax2, theDX: Quantity_AbsorbedDose, theDY: Quantity_AbsorbedDose, theDZ: Quantity_AbsorbedDose): void;
  Wedge(): BRepPrim_Wedge;
  Build(): void;
  Shell(): TopoDS_Shell;
  Solid(): TopoDS_Solid;
  BottomFace(): TopoDS_Face;
  BackFace(): TopoDS_Face;
  FrontFace(): TopoDS_Face;
  LeftFace(): TopoDS_Face;
  RightFace(): TopoDS_Face;
  TopFace(): TopoDS_Face;
  delete(): void;
}

  export declare class BRepPrimAPI_MakeBox_1 extends BRepPrimAPI_MakeBox {
    constructor();
  }

  export declare class BRepPrimAPI_MakeBox_2 extends BRepPrimAPI_MakeBox {
    constructor(dx: Quantity_AbsorbedDose, dy: Quantity_AbsorbedDose, dz: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeBox_3 extends BRepPrimAPI_MakeBox {
    constructor(P: gp_Pnt, dx: Quantity_AbsorbedDose, dy: Quantity_AbsorbedDose, dz: Quantity_AbsorbedDose);
  }

  export declare class BRepPrimAPI_MakeBox_4 extends BRepPrimAPI_MakeBox {
    constructor(P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepPrimAPI_MakeBox_5 extends BRepPrimAPI_MakeBox {
    constructor(Axes: gp_Ax2, dx: Quantity_AbsorbedDose, dy: Quantity_AbsorbedDose, dz: Quantity_AbsorbedDose);
  }

export declare class TopTools_ListOfShape extends NCollection_BaseList {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Size(): Standard_Integer;
  Assign(theOther: TopTools_ListOfShape): TopTools_ListOfShape;
  Clear(theAllocator: Handle_NCollection_BaseAllocator): void;
  First_1(): TopoDS_Shape;
  First_2(): TopoDS_Shape;
  Last_1(): TopoDS_Shape;
  Last_2(): TopoDS_Shape;
  Append_1(theItem: TopoDS_Shape): TopoDS_Shape;
  Append_3(theOther: TopTools_ListOfShape): void;
  Prepend_1(theItem: TopoDS_Shape): TopoDS_Shape;
  Prepend_2(theOther: TopTools_ListOfShape): void;
  RemoveFirst(): void;
  Reverse(): void;
  delete(): void;
}

  export declare class TopTools_ListOfShape_1 extends TopTools_ListOfShape {
    constructor();
  }

  export declare class TopTools_ListOfShape_2 extends TopTools_ListOfShape {
    constructor(theAllocator: Handle_NCollection_BaseAllocator);
  }

  export declare class TopTools_ListOfShape_3 extends TopTools_ListOfShape {
    constructor(theOther: TopTools_ListOfShape);
  }

export declare class TopTools_IndexedMapOfShape extends NCollection_BaseMap {
  cbegin(): any;
  cend(): any;
  Exchange(theOther: TopTools_IndexedMapOfShape): void;
  Assign(theOther: TopTools_IndexedMapOfShape): TopTools_IndexedMapOfShape;
  ReSize(theExtent: Standard_Integer): void;
  Add(theKey1: TopoDS_Shape): Standard_Integer;
  Contains(theKey1: TopoDS_Shape): Standard_Boolean;
  Substitute(theIndex: Standard_Integer, theKey1: TopoDS_Shape): void;
  Swap(theIndex1: Standard_Integer, theIndex2: Standard_Integer): void;
  RemoveLast(): void;
  RemoveFromIndex(theIndex: Standard_Integer): void;
  RemoveKey(theKey1: TopoDS_Shape): Standard_Boolean;
  FindKey(theIndex: Standard_Integer): TopoDS_Shape;
  FindIndex(theKey1: TopoDS_Shape): Standard_Integer;
  Clear_1(doReleaseMemory: Standard_Boolean): void;
  Clear_2(theAllocator: Handle_NCollection_BaseAllocator): void;
  Size(): Standard_Integer;
  delete(): void;
}

  export declare class TopTools_IndexedMapOfShape_1 extends TopTools_IndexedMapOfShape {
    constructor();
  }

  export declare class TopTools_IndexedMapOfShape_2 extends TopTools_IndexedMapOfShape {
    constructor(theNbBuckets: Standard_Integer, theAllocator: Handle_NCollection_BaseAllocator);
  }

  export declare class TopTools_IndexedMapOfShape_3 extends TopTools_IndexedMapOfShape {
    constructor(theOther: TopTools_IndexedMapOfShape);
  }

export declare class TopTools_IndexedDataMapOfShapeListOfShape extends NCollection_BaseMap {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Exchange(theOther: TopTools_IndexedDataMapOfShapeListOfShape): void;
  Assign(theOther: TopTools_IndexedDataMapOfShapeListOfShape): TopTools_IndexedDataMapOfShapeListOfShape;
  ReSize(N: Standard_Integer): void;
  Add(theKey1: TopoDS_Shape, theItem: TopTools_ListOfShape): Standard_Integer;
  Contains(theKey1: TopoDS_Shape): Standard_Boolean;
  Substitute(theIndex: Standard_Integer, theKey1: TopoDS_Shape, theItem: TopTools_ListOfShape): void;
  Swap(theIndex1: Standard_Integer, theIndex2: Standard_Integer): void;
  RemoveLast(): void;
  RemoveFromIndex(theIndex: Standard_Integer): void;
  RemoveKey(theKey1: TopoDS_Shape): void;
  FindKey(theIndex: Standard_Integer): TopoDS_Shape;
  FindFromIndex(theIndex: Standard_Integer): TopTools_ListOfShape;
  ChangeFromIndex(theIndex: Standard_Integer): TopTools_ListOfShape;
  FindIndex(theKey1: TopoDS_Shape): Standard_Integer;
  ChangeFromKey(theKey1: TopoDS_Shape): TopTools_ListOfShape;
  Seek(theKey1: TopoDS_Shape): TopTools_ListOfShape;
  ChangeSeek(theKey1: TopoDS_Shape): TopTools_ListOfShape;
  Clear_1(doReleaseMemory: Standard_Boolean): void;
  Clear_2(theAllocator: Handle_NCollection_BaseAllocator): void;
  Size(): Standard_Integer;
  delete(): void;
}

  export declare class TopTools_IndexedDataMapOfShapeListOfShape_1 extends TopTools_IndexedDataMapOfShapeListOfShape {
    constructor();
  }

  export declare class TopTools_IndexedDataMapOfShapeListOfShape_2 extends TopTools_IndexedDataMapOfShapeListOfShape {
    constructor(theNbBuckets: Standard_Integer, theAllocator: Handle_NCollection_BaseAllocator);
  }

  export declare class TopTools_IndexedDataMapOfShapeListOfShape_3 extends TopTools_IndexedDataMapOfShapeListOfShape {
    constructor(theOther: TopTools_IndexedDataMapOfShapeListOfShape);
  }

export declare class BRepAlgoAPI_Fuse extends BRepAlgoAPI_BooleanOperation {
  delete(): void;
}

  export declare class BRepAlgoAPI_Fuse_1 extends BRepAlgoAPI_Fuse {
    constructor();
  }

  export declare class BRepAlgoAPI_Fuse_2 extends BRepAlgoAPI_Fuse {
    constructor(PF: BOPAlgo_PaveFiller);
  }

  export declare class BRepAlgoAPI_Fuse_3 extends BRepAlgoAPI_Fuse {
    constructor(S1: TopoDS_Shape, S2: TopoDS_Shape);
  }

  export declare class BRepAlgoAPI_Fuse_4 extends BRepAlgoAPI_Fuse {
    constructor(S1: TopoDS_Shape, S2: TopoDS_Shape, aDSF: BOPAlgo_PaveFiller);
  }

export declare class BRepAlgoAPI_Algo extends BRepBuilderAPI_MakeShape {
  Shape(): TopoDS_Shape;
  Clear(): void;
  SetRunParallel(theFlag: Standard_Boolean): void;
  RunParallel(): Standard_Boolean;
  SetFuzzyValue(theFuzz: Quantity_AbsorbedDose): void;
  FuzzyValue(): Quantity_AbsorbedDose;
  HasErrors(): Standard_Boolean;
  HasWarnings(): Standard_Boolean;
  HasError(theType: Handle_Standard_Type): Standard_Boolean;
  HasWarning(theType: Handle_Standard_Type): Standard_Boolean;
  DumpErrors(theOS: Standard_OStream): void;
  DumpWarnings(theOS: Standard_OStream): void;
  ClearWarnings(): void;
  GetReport(): Handle_Message_Report;
  SetProgressIndicator(theProgress: Message_ProgressScope): void;
  SetUseOBB(theUseOBB: Standard_Boolean): void;
  delete(): void;
}

export declare class BRepAlgoAPI_Common extends BRepAlgoAPI_BooleanOperation {
  delete(): void;
}

  export declare class BRepAlgoAPI_Common_1 extends BRepAlgoAPI_Common {
    constructor();
  }

  export declare class BRepAlgoAPI_Common_2 extends BRepAlgoAPI_Common {
    constructor(PF: BOPAlgo_PaveFiller);
  }

  export declare class BRepAlgoAPI_Common_3 extends BRepAlgoAPI_Common {
    constructor(S1: TopoDS_Shape, S2: TopoDS_Shape);
  }

  export declare class BRepAlgoAPI_Common_4 extends BRepAlgoAPI_Common {
    constructor(S1: TopoDS_Shape, S2: TopoDS_Shape, PF: BOPAlgo_PaveFiller);
  }

export declare class BRepAlgoAPI_Cut extends BRepAlgoAPI_BooleanOperation {
  delete(): void;
}

  export declare class BRepAlgoAPI_Cut_1 extends BRepAlgoAPI_Cut {
    constructor();
  }

  export declare class BRepAlgoAPI_Cut_2 extends BRepAlgoAPI_Cut {
    constructor(PF: BOPAlgo_PaveFiller);
  }

  export declare class BRepAlgoAPI_Cut_3 extends BRepAlgoAPI_Cut {
    constructor(S1: TopoDS_Shape, S2: TopoDS_Shape);
  }

  export declare class BRepAlgoAPI_Cut_4 extends BRepAlgoAPI_Cut {
    constructor(S1: TopoDS_Shape, S2: TopoDS_Shape, aDSF: BOPAlgo_PaveFiller, bFWD: Standard_Boolean);
  }

export declare class BRepAlgoAPI_BuilderAlgo extends BRepAlgoAPI_Algo {
  SetArguments(theLS: TopTools_ListOfShape): void;
  Arguments(): TopTools_ListOfShape;
  SetNonDestructive(theFlag: Standard_Boolean): void;
  NonDestructive(): Standard_Boolean;
  SetGlue(theGlue: BOPAlgo_GlueEnum): void;
  Glue(): BOPAlgo_GlueEnum;
  SetCheckInverted(theCheck: Standard_Boolean): void;
  CheckInverted(): Standard_Boolean;
  Build(): void;
  SimplifyResult(theUnifyEdges: Standard_Boolean, theUnifyFaces: Standard_Boolean, theAngularTol: Quantity_AbsorbedDose): void;
  Modified(theS: TopoDS_Shape): TopTools_ListOfShape;
  Generated(theS: TopoDS_Shape): TopTools_ListOfShape;
  IsDeleted(aS: TopoDS_Shape): Standard_Boolean;
  HasModified(): Standard_Boolean;
  HasGenerated(): Standard_Boolean;
  HasDeleted(): Standard_Boolean;
  SetToFillHistory(theHistFlag: Standard_Boolean): void;
  HasHistory(): Standard_Boolean;
  SectionEdges(): TopTools_ListOfShape;
  DSFiller(): BOPAlgo_PPaveFiller;
  Builder(): BOPAlgo_PBuilder;
  History(): Handle_BRepTools_History;
  delete(): void;
}

  export declare class BRepAlgoAPI_BuilderAlgo_1 extends BRepAlgoAPI_BuilderAlgo {
    constructor();
  }

  export declare class BRepAlgoAPI_BuilderAlgo_2 extends BRepAlgoAPI_BuilderAlgo {
    constructor(thePF: BOPAlgo_PaveFiller);
  }

export declare class BRepAlgoAPI_BooleanOperation extends BRepAlgoAPI_BuilderAlgo {
  Shape1(): TopoDS_Shape;
  Shape2(): TopoDS_Shape;
  SetTools(theLS: TopTools_ListOfShape): void;
  Tools(): TopTools_ListOfShape;
  SetOperation(theBOP: BOPAlgo_Operation): void;
  Operation(): BOPAlgo_Operation;
  Build(): void;
  delete(): void;
}

  export declare class BRepAlgoAPI_BooleanOperation_1 extends BRepAlgoAPI_BooleanOperation {
    constructor();
  }

  export declare class BRepAlgoAPI_BooleanOperation_2 extends BRepAlgoAPI_BooleanOperation {
    constructor(thePF: BOPAlgo_PaveFiller);
  }

export declare class BRepMesh_DiscretRoot extends Standard_Transient {
  SetShape(theShape: TopoDS_Shape): void;
  Shape(): TopoDS_Shape;
  IsDone(): Standard_Boolean;
  Perform(theRange: Message_ProgressRange): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class BRepMesh_IncrementalMesh extends BRepMesh_DiscretRoot {
  Perform_1(theRange: Message_ProgressRange): void;
  Perform_2(theContext: any, theRange: Message_ProgressRange): void;
  Parameters(): IMeshTools_Parameters;
  ChangeParameters(): IMeshTools_Parameters;
  IsModified(): Standard_Boolean;
  GetStatusFlags(): Graphic3d_ZLayerId;
  static Discret(theShape: TopoDS_Shape, theLinDeflection: Quantity_AbsorbedDose, theAngDeflection: Quantity_AbsorbedDose, theAlgo: BRepMesh_DiscretRoot): Graphic3d_ZLayerId;
  static IsParallelDefault(): Standard_Boolean;
  static SetParallelDefault(isInParallel: Standard_Boolean): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class BRepMesh_IncrementalMesh_1 extends BRepMesh_IncrementalMesh {
    constructor();
  }

  export declare class BRepMesh_IncrementalMesh_2 extends BRepMesh_IncrementalMesh {
    constructor(theShape: TopoDS_Shape, theLinDeflection: Quantity_AbsorbedDose, isRelative: Standard_Boolean, theAngDeflection: Quantity_AbsorbedDose, isInParallel: Standard_Boolean);
  }

  export declare class BRepMesh_IncrementalMesh_3 extends BRepMesh_IncrementalMesh {
    constructor(theShape: TopoDS_Shape, theParameters: IMeshTools_Parameters, theRange: Message_ProgressRange);
  }

export declare class NCollection_BaseList {
  Extent(): Graphic3d_ZLayerId;
  IsEmpty(): Standard_Boolean;
  Allocator(): Handle_NCollection_BaseAllocator;
  delete(): void;
}

export declare class NCollection_BaseMap {
  NbBuckets(): Graphic3d_ZLayerId;
  Extent(): Graphic3d_ZLayerId;
  IsEmpty(): Standard_Boolean;
  Statistics(S: Standard_OStream): void;
  Allocator(): Handle_NCollection_BaseAllocator;
  delete(): void;
}

export declare class StdPrs_ToolTriangulatedShape {
  constructor();
  static IsTriangulated(theShape: TopoDS_Shape): Standard_Boolean;
  static IsClosed(theShape: TopoDS_Shape): Standard_Boolean;
  static ComputeNormals_1(theFace: TopoDS_Face, theTris: Handle_Poly_Triangulation): void;
  static ComputeNormals_2(theFace: TopoDS_Face, theTris: Handle_Poly_Triangulation, thePolyConnect: Poly_Connect): void;
  static Normal(theFace: TopoDS_Face, thePolyConnect: Poly_Connect, theNormals: TColgp_Array1OfDir): void;
  static GetDeflection(theShape: TopoDS_Shape, theDrawer: Handle_Prs3d_Drawer): Quantity_AbsorbedDose;
  static IsTessellated(theShape: TopoDS_Shape, theDrawer: Handle_Prs3d_Drawer): Standard_Boolean;
  static Tessellate(theShape: TopoDS_Shape, theDrawer: Handle_Prs3d_Drawer): Standard_Boolean;
  static ClearOnOwnDeflectionChange(theShape: TopoDS_Shape, theDrawer: Handle_Prs3d_Drawer, theToResetCoeff: Standard_Boolean): void;
  delete(): void;
}

export declare class TColStd_Array1OfInteger {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Init(theValue: Standard_Integer): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  IsEmpty(): Standard_Boolean;
  Lower(): Standard_Integer;
  Upper(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  IsAllocated(): Standard_Boolean;
  Assign(theOther: TColStd_Array1OfInteger): TColStd_Array1OfInteger;
  Move(theOther: TColStd_Array1OfInteger): TColStd_Array1OfInteger;
  First(): Standard_Integer;
  ChangeFirst(): Standard_Integer;
  Last(): Standard_Integer;
  ChangeLast(): Standard_Integer;
  Value(theIndex: Standard_Integer): Standard_Integer;
  ChangeValue(theIndex: Standard_Integer): Standard_Integer;
  SetValue(theIndex: Standard_Integer, theItem: Standard_Integer): void;
  Resize(theLower: Standard_Integer, theUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColStd_Array1OfInteger_1 extends TColStd_Array1OfInteger {
    constructor();
  }

  export declare class TColStd_Array1OfInteger_2 extends TColStd_Array1OfInteger {
    constructor(theLower: Standard_Integer, theUpper: Standard_Integer);
  }

  export declare class TColStd_Array1OfInteger_3 extends TColStd_Array1OfInteger {
    constructor(theOther: TColStd_Array1OfInteger);
  }

  export declare class TColStd_Array1OfInteger_4 extends TColStd_Array1OfInteger {
    constructor(theOther: TColStd_Array1OfInteger);
  }

  export declare class TColStd_Array1OfInteger_5 extends TColStd_Array1OfInteger {
    constructor(theBegin: Standard_Integer, theLower: Standard_Integer, theUpper: Standard_Integer);
  }

export declare class TColgp_Array1OfDir {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Init(theValue: gp_Dir): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  IsEmpty(): Standard_Boolean;
  Lower(): Standard_Integer;
  Upper(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  IsAllocated(): Standard_Boolean;
  Assign(theOther: TColgp_Array1OfDir): TColgp_Array1OfDir;
  Move(theOther: TColgp_Array1OfDir): TColgp_Array1OfDir;
  First(): gp_Dir;
  ChangeFirst(): gp_Dir;
  Last(): gp_Dir;
  ChangeLast(): gp_Dir;
  Value(theIndex: Standard_Integer): gp_Dir;
  ChangeValue(theIndex: Standard_Integer): gp_Dir;
  SetValue(theIndex: Standard_Integer, theItem: gp_Dir): void;
  Resize(theLower: Standard_Integer, theUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColgp_Array1OfDir_1 extends TColgp_Array1OfDir {
    constructor();
  }

  export declare class TColgp_Array1OfDir_2 extends TColgp_Array1OfDir {
    constructor(theLower: Standard_Integer, theUpper: Standard_Integer);
  }

  export declare class TColgp_Array1OfDir_3 extends TColgp_Array1OfDir {
    constructor(theOther: TColgp_Array1OfDir);
  }

  export declare class TColgp_Array1OfDir_4 extends TColgp_Array1OfDir {
    constructor(theOther: TColgp_Array1OfDir);
  }

  export declare class TColgp_Array1OfDir_5 extends TColgp_Array1OfDir {
    constructor(theBegin: gp_Dir, theLower: Standard_Integer, theUpper: Standard_Integer);
  }

export declare class TColgp_Array1OfPnt {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Init(theValue: gp_Pnt): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  IsEmpty(): Standard_Boolean;
  Lower(): Standard_Integer;
  Upper(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  IsAllocated(): Standard_Boolean;
  Assign(theOther: TColgp_Array1OfPnt): TColgp_Array1OfPnt;
  Move(theOther: TColgp_Array1OfPnt): TColgp_Array1OfPnt;
  First(): gp_Pnt;
  ChangeFirst(): gp_Pnt;
  Last(): gp_Pnt;
  ChangeLast(): gp_Pnt;
  Value(theIndex: Standard_Integer): gp_Pnt;
  ChangeValue(theIndex: Standard_Integer): gp_Pnt;
  SetValue(theIndex: Standard_Integer, theItem: gp_Pnt): void;
  Resize(theLower: Standard_Integer, theUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColgp_Array1OfPnt_1 extends TColgp_Array1OfPnt {
    constructor();
  }

  export declare class TColgp_Array1OfPnt_2 extends TColgp_Array1OfPnt {
    constructor(theLower: Standard_Integer, theUpper: Standard_Integer);
  }

  export declare class TColgp_Array1OfPnt_3 extends TColgp_Array1OfPnt {
    constructor(theOther: TColgp_Array1OfPnt);
  }

  export declare class TColgp_Array1OfPnt_4 extends TColgp_Array1OfPnt {
    constructor(theOther: TColgp_Array1OfPnt);
  }

  export declare class TColgp_Array1OfPnt_5 extends TColgp_Array1OfPnt {
    constructor(theBegin: gp_Pnt, theLower: Standard_Integer, theUpper: Standard_Integer);
  }

type Standard_Boolean = boolean;
type Standard_Byte = number;
type Standard_Character = number;
type Standard_CString = string;
type Standard_Integer = number;
type Standard_Real = number;
type Standard_ShortReal = number;
type Standard_Size = number;

declare namespace FS {
  interface Lookup {
      path: string;
      node: FSNode;
  }

  interface FSStream {}
  interface FSNode {}
  interface ErrnoError {}

  let ignorePermissions: boolean;
  let trackingDelegate: any;
  let tracking: any;
  let genericErrors: any;

  //
  // paths
  //
  function lookupPath(path: string, opts: any): Lookup;
  function getPath(node: FSNode): string;

  //
  // nodes
  //
  function isFile(mode: number): boolean;
  function isDir(mode: number): boolean;
  function isLink(mode: number): boolean;
  function isChrdev(mode: number): boolean;
  function isBlkdev(mode: number): boolean;
  function isFIFO(mode: number): boolean;
  function isSocket(mode: number): boolean;

  //
  // devices
  //
  function major(dev: number): number;
  function minor(dev: number): number;
  function makedev(ma: number, mi: number): number;
  function registerDevice(dev: number, ops: any): void;

  //
  // core
  //
  function syncfs(populate: boolean, callback: (e: any) => any): void;
  function syncfs(callback: (e: any) => any, populate?: boolean): void;
  function mount(type: any, opts: any, mountpoint: string): any;
  function unmount(mountpoint: string): void;

  function mkdir(path: string, mode?: number): any;
  function mkdev(path: string, mode?: number, dev?: number): any;
  function symlink(oldpath: string, newpath: string): any;
  function rename(old_path: string, new_path: string): void;
  function rmdir(path: string): void;
  function readdir(path: string): any;
  function unlink(path: string): void;
  function readlink(path: string): string;
  function stat(path: string, dontFollow?: boolean): any;
  function lstat(path: string): any;
  function chmod(path: string, mode: number, dontFollow?: boolean): void;
  function lchmod(path: string, mode: number): void;
  function fchmod(fd: number, mode: number): void;
  function chown(path: string, uid: number, gid: number, dontFollow?: boolean): void;
  function lchown(path: string, uid: number, gid: number): void;
  function fchown(fd: number, uid: number, gid: number): void;
  function truncate(path: string, len: number): void;
  function ftruncate(fd: number, len: number): void;
  function utime(path: string, atime: number, mtime: number): void;
  function open(path: string, flags: string, mode?: number, fd_start?: number, fd_end?: number): FSStream;
  function close(stream: FSStream): void;
  function llseek(stream: FSStream, offset: number, whence: number): any;
  function read(stream: FSStream, buffer: ArrayBufferView, offset: number, length: number, position?: number): number;
  function write(
      stream: FSStream,
      buffer: ArrayBufferView,
      offset: number,
      length: number,
      position?: number,
      canOwn?: boolean,
  ): number;
  function allocate(stream: FSStream, offset: number, length: number): void;
  function mmap(
      stream: FSStream,
      buffer: ArrayBufferView,
      offset: number,
      length: number,
      position: number,
      prot: number,
      flags: number,
  ): any;
  function ioctl(stream: FSStream, cmd: any, arg: any): any;
  function readFile(path: string, opts: { encoding: 'binary'; flags?: string }): Uint8Array;
  function readFile(path: string, opts: { encoding: 'utf8'; flags?: string }): string;
  function readFile(path: string, opts?: { flags?: string }): Uint8Array;
  function writeFile(path: string, data: string | ArrayBufferView, opts?: { flags?: string }): void;

  //
  // module-level FS code
  //
  function cwd(): string;
  function chdir(path: string): void;
  function init(
      input: null | (() => number | null),
      output: null | ((c: number) => any),
      error: null | ((c: number) => any),
  ): void;

  function createLazyFile(
      parent: string | FSNode,
      name: string,
      url: string,
      canRead: boolean,
      canWrite: boolean,
  ): FSNode;
  function createPreloadedFile(
      parent: string | FSNode,
      name: string,
      url: string,
      canRead: boolean,
      canWrite: boolean,
      onload?: () => void,
      onerror?: () => void,
      dontCreateFile?: boolean,
      canOwn?: boolean,
  ): void;
  function createDataFile(
      parent: string | FSNode,
      name: string,
      data: ArrayBufferView | string,
      canRead: boolean,
      canWrite: boolean,
      canOwn: boolean,
  ): FSNode;
  interface AnalysisResults {
    isRoot: boolean,
    exists: boolean,
    error: Error,
    name: string,
    path: any,
    object: any,
    parentExists: boolean,
    parentPath: any,
    parentObject: any
  }
  function analyzePath(path: string): AnalysisResults;
}


export type OpenCascadeInstance = {FS: typeof FS} & {
  Message_ProgressRange: typeof Message_ProgressRange;
  Message_ProgressRange_1: typeof Message_ProgressRange_1;
  Message_ProgressRange_2: typeof Message_ProgressRange_2;
  Standard_Transient: typeof Standard_Transient;
  Standard_Transient_1: typeof Standard_Transient_1;
  Standard_Transient_2: typeof Standard_Transient_2;
  TopAbs_Orientation: TopAbs_Orientation;
  TopAbs_ShapeEnum: TopAbs_ShapeEnum;
  BRepBuilderAPI_Command: typeof BRepBuilderAPI_Command;
  BRepBuilderAPI_MakeShape: typeof BRepBuilderAPI_MakeShape;
  TopExp_Explorer: typeof TopExp_Explorer;
  TopExp_Explorer_1: typeof TopExp_Explorer_1;
  TopExp_Explorer_2: typeof TopExp_Explorer_2;
  TopExp: typeof TopExp;
  TopLoc_Location: typeof TopLoc_Location;
  TopLoc_Location_1: typeof TopLoc_Location_1;
  TopLoc_Location_2: typeof TopLoc_Location_2;
  TopLoc_Location_3: typeof TopLoc_Location_3;
  TopoDS_Builder: typeof TopoDS_Builder;
  TopoDS_Shape: typeof TopoDS_Shape;
  TopoDS_Edge: typeof TopoDS_Edge;
  TopoDS_Face: typeof TopoDS_Face;
  TopoDS: typeof TopoDS;
  Poly_Triangle: typeof Poly_Triangle;
  Poly_Triangle_1: typeof Poly_Triangle_1;
  Poly_Triangle_2: typeof Poly_Triangle_2;
  Poly_Connect: typeof Poly_Connect;
  Poly_Connect_1: typeof Poly_Connect_1;
  Poly_Connect_2: typeof Poly_Connect_2;
  Handle_Poly_PolygonOnTriangulation: typeof Handle_Poly_PolygonOnTriangulation;
  Handle_Poly_PolygonOnTriangulation_1: typeof Handle_Poly_PolygonOnTriangulation_1;
  Handle_Poly_PolygonOnTriangulation_2: typeof Handle_Poly_PolygonOnTriangulation_2;
  Handle_Poly_PolygonOnTriangulation_3: typeof Handle_Poly_PolygonOnTriangulation_3;
  Handle_Poly_PolygonOnTriangulation_4: typeof Handle_Poly_PolygonOnTriangulation_4;
  Poly_PolygonOnTriangulation: typeof Poly_PolygonOnTriangulation;
  Poly_PolygonOnTriangulation_1: typeof Poly_PolygonOnTriangulation_1;
  Poly_PolygonOnTriangulation_2: typeof Poly_PolygonOnTriangulation_2;
  Poly_PolygonOnTriangulation_3: typeof Poly_PolygonOnTriangulation_3;
  Handle_Poly_Triangulation: typeof Handle_Poly_Triangulation;
  Handle_Poly_Triangulation_1: typeof Handle_Poly_Triangulation_1;
  Handle_Poly_Triangulation_2: typeof Handle_Poly_Triangulation_2;
  Handle_Poly_Triangulation_3: typeof Handle_Poly_Triangulation_3;
  Handle_Poly_Triangulation_4: typeof Handle_Poly_Triangulation_4;
  Poly_Triangulation: typeof Poly_Triangulation;
  Poly_Triangulation_1: typeof Poly_Triangulation_1;
  Poly_Triangulation_2: typeof Poly_Triangulation_2;
  Poly_Triangulation_3: typeof Poly_Triangulation_3;
  Poly_Triangulation_4: typeof Poly_Triangulation_4;
  Poly_Array1OfTriangle: typeof Poly_Array1OfTriangle;
  Poly_Array1OfTriangle_1: typeof Poly_Array1OfTriangle_1;
  Poly_Array1OfTriangle_2: typeof Poly_Array1OfTriangle_2;
  Poly_Array1OfTriangle_3: typeof Poly_Array1OfTriangle_3;
  Poly_Array1OfTriangle_4: typeof Poly_Array1OfTriangle_4;
  Poly_Array1OfTriangle_5: typeof Poly_Array1OfTriangle_5;
  Handle_Poly_Polygon3D: typeof Handle_Poly_Polygon3D;
  Handle_Poly_Polygon3D_1: typeof Handle_Poly_Polygon3D_1;
  Handle_Poly_Polygon3D_2: typeof Handle_Poly_Polygon3D_2;
  Handle_Poly_Polygon3D_3: typeof Handle_Poly_Polygon3D_3;
  Handle_Poly_Polygon3D_4: typeof Handle_Poly_Polygon3D_4;
  BRepTools: typeof BRepTools;
  BRep_Builder: typeof BRep_Builder;
  BRep_Tool: typeof BRep_Tool;
  gp_Trsf: typeof gp_Trsf;
  gp_Trsf_1: typeof gp_Trsf_1;
  gp_Trsf_2: typeof gp_Trsf_2;
  gp_Dir: typeof gp_Dir;
  gp_Dir_1: typeof gp_Dir_1;
  gp_Dir_2: typeof gp_Dir_2;
  gp_Dir_3: typeof gp_Dir_3;
  gp_Dir_4: typeof gp_Dir_4;
  gp_Pnt: typeof gp_Pnt;
  gp_Pnt_1: typeof gp_Pnt_1;
  gp_Pnt_2: typeof gp_Pnt_2;
  gp_Pnt_3: typeof gp_Pnt_3;
  gp_Vec: typeof gp_Vec;
  gp_Vec_1: typeof gp_Vec_1;
  gp_Vec_2: typeof gp_Vec_2;
  gp_Vec_3: typeof gp_Vec_3;
  gp_Vec_4: typeof gp_Vec_4;
  gp_Vec_5: typeof gp_Vec_5;
  gp_Ax1: typeof gp_Ax1;
  gp_Ax1_1: typeof gp_Ax1_1;
  gp_Ax1_2: typeof gp_Ax1_2;
  BRepPrimAPI_MakeSphere: typeof BRepPrimAPI_MakeSphere;
  BRepPrimAPI_MakeSphere_1: typeof BRepPrimAPI_MakeSphere_1;
  BRepPrimAPI_MakeSphere_2: typeof BRepPrimAPI_MakeSphere_2;
  BRepPrimAPI_MakeSphere_3: typeof BRepPrimAPI_MakeSphere_3;
  BRepPrimAPI_MakeSphere_4: typeof BRepPrimAPI_MakeSphere_4;
  BRepPrimAPI_MakeSphere_5: typeof BRepPrimAPI_MakeSphere_5;
  BRepPrimAPI_MakeSphere_6: typeof BRepPrimAPI_MakeSphere_6;
  BRepPrimAPI_MakeSphere_7: typeof BRepPrimAPI_MakeSphere_7;
  BRepPrimAPI_MakeSphere_8: typeof BRepPrimAPI_MakeSphere_8;
  BRepPrimAPI_MakeSphere_9: typeof BRepPrimAPI_MakeSphere_9;
  BRepPrimAPI_MakeSphere_10: typeof BRepPrimAPI_MakeSphere_10;
  BRepPrimAPI_MakeSphere_11: typeof BRepPrimAPI_MakeSphere_11;
  BRepPrimAPI_MakeSphere_12: typeof BRepPrimAPI_MakeSphere_12;
  BRepPrimAPI_MakeCylinder: typeof BRepPrimAPI_MakeCylinder;
  BRepPrimAPI_MakeCylinder_1: typeof BRepPrimAPI_MakeCylinder_1;
  BRepPrimAPI_MakeCylinder_2: typeof BRepPrimAPI_MakeCylinder_2;
  BRepPrimAPI_MakeCylinder_3: typeof BRepPrimAPI_MakeCylinder_3;
  BRepPrimAPI_MakeCylinder_4: typeof BRepPrimAPI_MakeCylinder_4;
  BRepPrimAPI_MakeTorus: typeof BRepPrimAPI_MakeTorus;
  BRepPrimAPI_MakeTorus_1: typeof BRepPrimAPI_MakeTorus_1;
  BRepPrimAPI_MakeTorus_2: typeof BRepPrimAPI_MakeTorus_2;
  BRepPrimAPI_MakeTorus_3: typeof BRepPrimAPI_MakeTorus_3;
  BRepPrimAPI_MakeTorus_4: typeof BRepPrimAPI_MakeTorus_4;
  BRepPrimAPI_MakeTorus_5: typeof BRepPrimAPI_MakeTorus_5;
  BRepPrimAPI_MakeTorus_6: typeof BRepPrimAPI_MakeTorus_6;
  BRepPrimAPI_MakeTorus_7: typeof BRepPrimAPI_MakeTorus_7;
  BRepPrimAPI_MakeTorus_8: typeof BRepPrimAPI_MakeTorus_8;
  BRepPrimAPI_MakeOneAxis: typeof BRepPrimAPI_MakeOneAxis;
  BRepPrimAPI_MakeCone: typeof BRepPrimAPI_MakeCone;
  BRepPrimAPI_MakeCone_1: typeof BRepPrimAPI_MakeCone_1;
  BRepPrimAPI_MakeCone_2: typeof BRepPrimAPI_MakeCone_2;
  BRepPrimAPI_MakeCone_3: typeof BRepPrimAPI_MakeCone_3;
  BRepPrimAPI_MakeCone_4: typeof BRepPrimAPI_MakeCone_4;
  BRepPrimAPI_MakeBox: typeof BRepPrimAPI_MakeBox;
  BRepPrimAPI_MakeBox_1: typeof BRepPrimAPI_MakeBox_1;
  BRepPrimAPI_MakeBox_2: typeof BRepPrimAPI_MakeBox_2;
  BRepPrimAPI_MakeBox_3: typeof BRepPrimAPI_MakeBox_3;
  BRepPrimAPI_MakeBox_4: typeof BRepPrimAPI_MakeBox_4;
  BRepPrimAPI_MakeBox_5: typeof BRepPrimAPI_MakeBox_5;
  TopTools_ListOfShape: typeof TopTools_ListOfShape;
  TopTools_ListOfShape_1: typeof TopTools_ListOfShape_1;
  TopTools_ListOfShape_2: typeof TopTools_ListOfShape_2;
  TopTools_ListOfShape_3: typeof TopTools_ListOfShape_3;
  TopTools_IndexedMapOfShape: typeof TopTools_IndexedMapOfShape;
  TopTools_IndexedMapOfShape_1: typeof TopTools_IndexedMapOfShape_1;
  TopTools_IndexedMapOfShape_2: typeof TopTools_IndexedMapOfShape_2;
  TopTools_IndexedMapOfShape_3: typeof TopTools_IndexedMapOfShape_3;
  TopTools_IndexedDataMapOfShapeListOfShape: typeof TopTools_IndexedDataMapOfShapeListOfShape;
  TopTools_IndexedDataMapOfShapeListOfShape_1: typeof TopTools_IndexedDataMapOfShapeListOfShape_1;
  TopTools_IndexedDataMapOfShapeListOfShape_2: typeof TopTools_IndexedDataMapOfShapeListOfShape_2;
  TopTools_IndexedDataMapOfShapeListOfShape_3: typeof TopTools_IndexedDataMapOfShapeListOfShape_3;
  BRepAlgoAPI_Fuse: typeof BRepAlgoAPI_Fuse;
  BRepAlgoAPI_Fuse_1: typeof BRepAlgoAPI_Fuse_1;
  BRepAlgoAPI_Fuse_2: typeof BRepAlgoAPI_Fuse_2;
  BRepAlgoAPI_Fuse_3: typeof BRepAlgoAPI_Fuse_3;
  BRepAlgoAPI_Fuse_4: typeof BRepAlgoAPI_Fuse_4;
  BRepAlgoAPI_Algo: typeof BRepAlgoAPI_Algo;
  BRepAlgoAPI_Common: typeof BRepAlgoAPI_Common;
  BRepAlgoAPI_Common_1: typeof BRepAlgoAPI_Common_1;
  BRepAlgoAPI_Common_2: typeof BRepAlgoAPI_Common_2;
  BRepAlgoAPI_Common_3: typeof BRepAlgoAPI_Common_3;
  BRepAlgoAPI_Common_4: typeof BRepAlgoAPI_Common_4;
  BRepAlgoAPI_Cut: typeof BRepAlgoAPI_Cut;
  BRepAlgoAPI_Cut_1: typeof BRepAlgoAPI_Cut_1;
  BRepAlgoAPI_Cut_2: typeof BRepAlgoAPI_Cut_2;
  BRepAlgoAPI_Cut_3: typeof BRepAlgoAPI_Cut_3;
  BRepAlgoAPI_Cut_4: typeof BRepAlgoAPI_Cut_4;
  BRepAlgoAPI_BuilderAlgo: typeof BRepAlgoAPI_BuilderAlgo;
  BRepAlgoAPI_BuilderAlgo_1: typeof BRepAlgoAPI_BuilderAlgo_1;
  BRepAlgoAPI_BuilderAlgo_2: typeof BRepAlgoAPI_BuilderAlgo_2;
  BRepAlgoAPI_BooleanOperation: typeof BRepAlgoAPI_BooleanOperation;
  BRepAlgoAPI_BooleanOperation_1: typeof BRepAlgoAPI_BooleanOperation_1;
  BRepAlgoAPI_BooleanOperation_2: typeof BRepAlgoAPI_BooleanOperation_2;
  BRepMesh_DiscretRoot: typeof BRepMesh_DiscretRoot;
  BRepMesh_IncrementalMesh: typeof BRepMesh_IncrementalMesh;
  BRepMesh_IncrementalMesh_1: typeof BRepMesh_IncrementalMesh_1;
  BRepMesh_IncrementalMesh_2: typeof BRepMesh_IncrementalMesh_2;
  BRepMesh_IncrementalMesh_3: typeof BRepMesh_IncrementalMesh_3;
  NCollection_BaseList: typeof NCollection_BaseList;
  NCollection_BaseMap: typeof NCollection_BaseMap;
  StdPrs_ToolTriangulatedShape: typeof StdPrs_ToolTriangulatedShape;
  TColStd_Array1OfInteger: typeof TColStd_Array1OfInteger;
  TColStd_Array1OfInteger_1: typeof TColStd_Array1OfInteger_1;
  TColStd_Array1OfInteger_2: typeof TColStd_Array1OfInteger_2;
  TColStd_Array1OfInteger_3: typeof TColStd_Array1OfInteger_3;
  TColStd_Array1OfInteger_4: typeof TColStd_Array1OfInteger_4;
  TColStd_Array1OfInteger_5: typeof TColStd_Array1OfInteger_5;
  TColgp_Array1OfDir: typeof TColgp_Array1OfDir;
  TColgp_Array1OfDir_1: typeof TColgp_Array1OfDir_1;
  TColgp_Array1OfDir_2: typeof TColgp_Array1OfDir_2;
  TColgp_Array1OfDir_3: typeof TColgp_Array1OfDir_3;
  TColgp_Array1OfDir_4: typeof TColgp_Array1OfDir_4;
  TColgp_Array1OfDir_5: typeof TColgp_Array1OfDir_5;
  TColgp_Array1OfPnt: typeof TColgp_Array1OfPnt;
  TColgp_Array1OfPnt_1: typeof TColgp_Array1OfPnt_1;
  TColgp_Array1OfPnt_2: typeof TColgp_Array1OfPnt_2;
  TColgp_Array1OfPnt_3: typeof TColgp_Array1OfPnt_3;
  TColgp_Array1OfPnt_4: typeof TColgp_Array1OfPnt_4;
  TColgp_Array1OfPnt_5: typeof TColgp_Array1OfPnt_5;
};

declare function init(): Promise<OpenCascadeInstance>;

export default init;
