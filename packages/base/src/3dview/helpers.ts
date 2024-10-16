import { IParsedShape } from '@jupytercad/schema';
import * as THREE from 'three';
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree
} from 'three-mesh-bvh';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';

import { getCSSVariableColor } from '../tools';

export const DEFAULT_LINEWIDTH = 2;
export const SELECTED_LINEWIDTH = 6;

// Apply the BVH extension

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export const DEFAULT_MESH_COLOR_CSS = '--jp-inverse-layout-color4';
export const DEFAULT_EDGE_COLOR_CSS = '--jp-inverse-layout-color2';
export const BOUNDING_BOX_COLOR_CSS = '--jp-brand-color0';
export const SELECTION_BOUNDING_BOX = 'selectionBoundingBox';

export const DEFAULT_MESH_COLOR = new THREE.Color(
  getCSSVariableColor(DEFAULT_MESH_COLOR_CSS)
);
export const DEFAULT_EDGE_COLOR = new THREE.Color(
  getCSSVariableColor(DEFAULT_EDGE_COLOR_CSS)
);
export const BOUNDING_BOX_COLOR = new THREE.Color(
  getCSSVariableColor(BOUNDING_BOX_COLOR_CSS)
);

export type BasicMesh = THREE.Mesh<
  THREE.BufferGeometry,
  THREE.MeshBasicMaterial | THREE.MeshPhongMaterial
>;

/**
 * The interface for a 3D pointer
 */
export interface IPointer {
  parent: BasicMesh;
  readonly mesh: BasicMesh;
}

/**
 * The result of mesh picking, contains the picked mesh and the 3D position of the pointer.
 */
export interface IPickedResult {
  mesh: BasicMesh;
  position: THREE.Vector3;
}

export function projectVector(options: {
  vector: THREE.Vector3;
  camera: THREE.Camera;
  width: number;
  height: number;
}): THREE.Vector2 {
  const { vector, camera, width, height } = options;
  const copy = new THREE.Vector3().copy(vector);

  copy.project(camera);

  return new THREE.Vector2(
    (0.5 + copy.x / 2) * width,
    (0.5 - copy.y / 2) * height
  );
}

export function computeExplodedState(options: {
  mesh: BasicMesh;
  boundingGroup: THREE.Box3;
  factor: number;
}) {
  const { mesh, boundingGroup, factor } = options;
  const center = new THREE.Vector3();
  boundingGroup.getCenter(center);

  const oldGeometryCenter = new THREE.Vector3();
  mesh.geometry.boundingBox?.getCenter(oldGeometryCenter);

  const centerToMesh = new THREE.Vector3(
    oldGeometryCenter.x - center.x,
    oldGeometryCenter.y - center.y,
    oldGeometryCenter.z - center.z
  );
  const distance = centerToMesh.length() * factor;

  centerToMesh.normalize();

  const newGeometryCenter = new THREE.Vector3(
    oldGeometryCenter.x + distance * centerToMesh.x,
    oldGeometryCenter.y + distance * centerToMesh.y,
    oldGeometryCenter.z + distance * centerToMesh.z
  );

  return {
    oldGeometryCenter,
    newGeometryCenter,
    vector: centerToMesh,
    distance
  };
}

export function buildShape(options: {
  objName: string;
  data: IParsedShape;
  clippingPlanes: THREE.Plane[];
  selected: boolean;
  isSolid: boolean;
  objColor?: THREE.Color | string | number;
}): {
  meshGroup: THREE.Group;
  mainMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>;
  edgesMeshes: LineSegments2[];
} | null {
  const { objName, data, isSolid, clippingPlanes, objColor } = options;
  const { faceList, edgeList, jcObject } = data;

  const vertices: Array<number> = [];
  const triangles: Array<number> = [];

  let vInd = 0;
  if (faceList.length === 0 && edgeList.length === 0) {
    return null;
  }
  for (const face of faceList) {
    // Copy Vertices into three.js Vector3 List
    const vertexCoorLength = face.vertexCoord.length;
    for (let ii = 0; ii < vertexCoorLength; ii++) {
      vertices.push(face.vertexCoord[ii]);
    }
    // Sort Triangles into a three.js Face List
    const triIndexesLength = face.triIndexes.length;
    for (let i = 0; i < triIndexesLength; i += 3) {
      triangles.push(
        face.triIndexes[i + 0] + vInd,
        face.triIndexes[i + 1] + vInd,
        face.triIndexes[i + 2] + vInd
      );
    }

    vInd += vertexCoorLength / 3;
  }

  const color = objColor || DEFAULT_MESH_COLOR;
  const visible = jcObject.visible;

  // Compile the connected vertices and faces into a model
  // And add to the scene
  // We need one material per-mesh because we will set the uniform color independently later
  // it's too bad Three.js does not easily allow setting uniforms independently per-mesh
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(color),
    wireframe: false,
    flatShading: false,
    clippingPlanes,
    shininess: 0
  });

  const geometry = new THREE.BufferGeometry();

  geometry.setIndex(triangles);
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  if (vertices.length > 0) {
    geometry.computeBoundsTree();
  }

  const meshGroup = new THREE.Group();
  meshGroup.name = `${objName}-group`;
  meshGroup.visible = visible;

  // We only build the stencil logic for solid meshes
  if (isSolid) {
    const baseMat = new THREE.MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    const mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = clippingPlanes;
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;
    const backFaces = new THREE.Mesh(geometry, mat0);
    backFaces.name = `${objName}-back`;
    meshGroup.add(backFaces);

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = clippingPlanes;
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;
    const frontFaces = new THREE.Mesh(geometry, mat1);
    frontFaces.name = `${objName}-front`;
    meshGroup.add(frontFaces);
  } else {
    material.side = THREE.DoubleSide;
  }

  const mainMesh = new THREE.Mesh(geometry, material);
  mainMesh.name = objName;
  mainMesh.userData = {
    type: 'shape'
  };

  let edgeIdx = 0;
  const edgesMeshes: LineSegments2[] = [];
  for (const edge of edgeList) {
    const edgeMaterial = new LineMaterial({
      linewidth: DEFAULT_LINEWIDTH,
      color: new THREE.Color(DEFAULT_EDGE_COLOR).getHex(),
      clippingPlanes,
      // Depth offset so that lines are most always on top of faces
      polygonOffset: true,
      polygonOffsetFactor: -5,
      polygonOffsetUnits: -5
    });
    const edgeGeometry = new LineGeometry();
    edgeGeometry.setPositions(edge.vertexCoord);
    const edgesMesh = new LineSegments2(edgeGeometry, edgeMaterial);
    edgesMesh.name = `edge-${objName}-${edgeIdx}`;
    edgesMesh.userData = {
      type: 'edge',
      edgeIndex: edgeIdx,
      parent: objName
    };

    edgesMeshes.push(edgesMesh);
    meshGroup.add(edgesMesh);
    edgeIdx++;
  }

  meshGroup.add(mainMesh);

  return { meshGroup, mainMesh, edgesMeshes };
}
