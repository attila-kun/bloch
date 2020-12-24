import {makeArrow} from './utils';
import {ArrowHelper, Geometry, Object3D, PointsMaterial, Points, Vector3} from 'three';

export class RotationAxis
{
  private direction: Vector3;
  private dot: Points;
  private parent: Object3D;
  private arrowHelper: ArrowHelper;

  constructor(p: Object3D) {
    this.parent = p;
    this.arrowHelper = makeArrow(1, 0, 0, 0xff0000);
    this.parent.add(this.arrowHelper);

    const dotGeometry = new Geometry();
    dotGeometry.vertices.push(new Vector3(0, 0, 0));
    const dotMaterial = new PointsMaterial( { size: 10, sizeAttenuation: false } );
    this.dot = new Points( dotGeometry, dotMaterial );
    this.parent.add(this.dot);
  }

  setDirection(dir: Vector3, rotationAngle: number) {
    this.direction = dir;
    this.arrowHelper.setDirection(this.direction);
  }

  setArc(referencePoint: Vector3) {
    const closestPointOnLine = this.direction.clone().multiplyScalar(referencePoint.dot(this.direction));
    this.dot.position.set(closestPointOnLine.x, closestPointOnLine.y, closestPointOnLine.z);
  }
}