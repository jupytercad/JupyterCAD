/**
 * This file defines a class for rendering measurements of a 3D object.
 * It uses `three.js` to create dimension lines and labels for a given bounding box.
 */
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * A class that displays the dimensions of a THREE.Box3.
 * It creates visual annotations (lines and labels) for the X, Y, and Z dimensions.
 * The measurement can be axis-aligned or oriented by providing a position and quaternion.
 */
export class Measurement {
  private _group: THREE.Group;
  private _box: THREE.Box3;
  private _quaternion?: THREE.Quaternion;
  private _position?: THREE.Vector3;

  /**
   * Constructor for the Measurement class.
   * @param box The bounding box to measure.
   * @param position Optional position to apply to the measurement group for oriented measurements.
   * @param quaternion Optional quaternion to apply to the measurement group for oriented measurements.
   */
  constructor(
    box: THREE.Box3,
    position?: THREE.Vector3,
    quaternion?: THREE.Quaternion
  ) {
    this._box = box;
    this._position = position;
    this._quaternion = quaternion;
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

    // Create dimension lines only for dimensions with a size greater than a small epsilon.
    // This is useful for hiding zero-dimension measurements for 2D objects like edges.
    if (size.x > 1e-6) {
      this.createDimensionLine(
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, min.z),
        'X',
        size.x
      );
    }
    if (size.y > 1e-6) {
      this.createDimensionLine(
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(max.x, max.y, min.z),
        'Y',
        size.y
      );
    }
    if (size.z > 1e-6) {
      this.createDimensionLine(
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, max.z),
        'Z',
        size.z
      );
    }

    // The annotations are created for an axis-aligned box at the origin, so transform
    // the group to match the object's actual position and orientation (if provided).
    if (this._quaternion) {
      this._group.quaternion.copy(this._quaternion);
    }
    if (this._position) {
      this._group.position.copy(this._position);
    }
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
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);

    // Create a solid white line (to go behind the dashed line to improve
    // contrast when measurements pass over objects)
    const whiteLineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 4,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 0.85
    });
    const whiteLine = new THREE.Line(geometry, whiteLineMaterial);
    whiteLine.renderOrder = 0; // Ensure white line renders just before the dashed line
    this._group.add(whiteLine);

    // Create the dashed line
    const dashLineMaterial = new THREE.LineDashedMaterial({
      color: 0x000000,
      linewidth: 1,
      scale: 1,
      dashSize: 0.1,
      gapSize: 0.1,
      depthTest: false, // Render lines on top of other objects for better visibility
      depthWrite: false,
      transparent: true
    });
    const dashLine = new THREE.Line(geometry.clone(), dashLineMaterial);
    dashLine.computeLineDistances();
    dashLine.renderOrder = 1; // Ensure dashed line renders on top of the solid white line
    this._group.add(dashLine);

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
