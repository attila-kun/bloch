import * as THREE from 'three';
import { createText } from './utils';

export class AxisLabels {

  private parent: THREE.Object3D;
  private xLabel: THREE.Mesh;
  private yLabel: THREE.Mesh;
  private zLabel: THREE.Mesh;
  private basis0Label: THREE.Mesh;
  private basis1Label: THREE.Mesh;

  constructor(parent: THREE.Object3D, textLayer: THREE.Object3D) {
    this.parent = parent;
    this.xLabel = createText('x');
    this.yLabel = createText('y');
    this.zLabel = createText('z');
    this.basis0Label = createText('|0>');
    this.basis1Label = createText('|1>');
    textLayer.add(this.xLabel);
    textLayer.add(this.yLabel);
    textLayer.add(this.zLabel);
    textLayer.add(this.basis0Label);
    textLayer.add(this.basis1Label);
  }

  align() {
    this.alignLabelToAxis(new THREE.Vector3(1, 0, 0), this.xLabel);
    this.alignLabelToAxis(new THREE.Vector3(0, 1, 0), this.yLabel);
    this.alignLabelToAxis(new THREE.Vector3(0, 0, 1), this.zLabel);
    this.alignLabelToAxis(new THREE.Vector3(0, 0, 1.15), this.basis0Label);
    this.alignLabelToAxis(new THREE.Vector3(0, 0, -1.15), this.basis1Label);
  }

  private alignLabelToAxis(axis: THREE.Vector3, label: THREE.Mesh) {
    const worldVector3 = this.parent.localToWorld(axis);
    label.position.set(worldVector3.x, worldVector3.y, 0);
  }
}