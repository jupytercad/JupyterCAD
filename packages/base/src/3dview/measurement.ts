/**
 * This file defines a class for rendering measurements of a 3D object.
 * It uses `three.js` to create dimension lines and labels for a given bounding box.
 */
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * A class that displays the dimensions of a THREE.Box3.
 * It creates visual annotations (lines and labels) for the X, Y, and Z dimensions.
 */
export class Measurement {
  private _group: THREE.Group;
  private _box: THREE.Box3;

  /**
   * Constructor for the Measurement class.
   * @param box The bounding box to measure.
   */
  constructor(box: THREE.Box3) {
    this._box = box;
    this._group = new THREE.Group();
    this.createAnnotations();
  }

  /**
   * Removes all annotations from the scene.
   */
  clearAnnotations() {
    this._group.clear();
  }

  /**
   * Creates the dimension lines and labels for the bounding box.
   */
  createAnnotations() {
    if (!this._box) {
      return;
    }

    const size = new THREE.Vector3();
    this._box.getSize(size);

    const min = this._box.min;
    const max = this._box.max;

    // Create dimension lines for X, Y, and Z axes
    this.createDimensionLine(
      new THREE.Vector3(min.x, min.y, min.z),
      new THREE.Vector3(max.x, min.y, min.z),
      'X',
      size.x
    );
    this.createDimensionLine(
      new THREE.Vector3(max.x, min.y, min.z),
      new THREE.Vector3(max.x, max.y, min.z),
      'Y',
      size.y
    );
    this.createDimensionLine(
      new THREE.Vector3(max.x, max.y, min.z),
      new THREE.Vector3(max.x, max.y, max.z),
      'Z',
      size.z
    );
  }

  /**
   * Creates a single dimension line with a label.
   * @param start The start point of the line.
   * @param end The end point of the line.
   * @param axis The axis name ('X', 'Y', or 'Z').
   * @param value The length of the dimension.
   */
  createDimensionLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    axis: string,
    value: number
  ) {
    // Create the dashed line
    const material = new THREE.LineDashedMaterial({
      color: 0x000000,
      linewidth: 1,
      scale: 1,
      dashSize: 0.1,
      gapSize: 0.1
    });
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    this._group.add(line);

    // Create the label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'measurement-label';
    labelDiv.textContent = `${axis}: ${value.toFixed(2)}`;
    labelDiv.style.color = 'black';
    labelDiv.style.fontSize = '12px';
    labelDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    labelDiv.style.padding = '2px 5px';
    labelDiv.style.borderRadius = '3px';

    const label = new CSS2DObject(labelDiv);

    // Position the label at the midpoint of the line
    const midPoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);
    label.position.copy(midPoint);

    this._group.add(label);
  }

  /**
   * Getter for the THREE.Group containing the measurement annotations.
   * This group can be added to a THREE.Scene to be rendered.
   */
  public get group(): THREE.Group {
    return this._group;
  }
}
