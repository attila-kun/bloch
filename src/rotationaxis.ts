import {createArc, createArrow} from './utils';
import {ArrowHelper, ConeGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3, Line, Vector2, SphereGeometry, MeshPhongMaterial} from 'three';
import {abs, complex, equal} from 'mathjs';

const COLOR = 0x5F4B8BFF;

// Renders the rotation axis and rotation angle of the unitary matrix entered by the user.
export class RotationAxis
{
  private arc: Line;
  private direction: Vector3;
  private dot: Mesh;
  private container: Object3D;
  private arrowHelper0: ArrowHelper;
  private arrowHelper1: ArrowHelper;
  private rotationAngle: number;

  constructor() {
    this.container = new Object3D();
    this.arrowHelper0 = createArrow(1, 0, 0, COLOR);
    this.container.add(this.arrowHelper0);
    this.arrowHelper1 = createArrow(-1, 0, 0, COLOR);
    this.container.add(this.arrowHelper1);

    const dotGeometry = new SphereGeometry(0.03, 10, 10);
    const dotMaterial = new MeshPhongMaterial({color: 0x44aa88});
    this.dot = new Mesh(dotGeometry, dotMaterial);
    this.container.add(this.dot);
    this.container.visible = false;
  }

  getContainer(): Object3D {
    return this.container;
  }

  setDirection(dir: Vector3, angle: number) {
    this.container.visible = true;
    this.direction = dir;
    this.arrowHelper0.setDirection(this.direction);
    this.arrowHelper1.setDirection(this.direction.clone().multiplyScalar(-1));
    this.rotationAngle = angle;
  }

  setArc(quantumStatePoint: Vector3) {
    if (!this.direction)
      return;

    const cosineAngle = quantumStatePoint.dot(this.direction);

    const closestPointOnLine = this.direction.clone().multiplyScalar(cosineAngle);
    const closestPointOnLineCoords: [number, number, number] = [closestPointOnLine.x, closestPointOnLine.y, closestPointOnLine.z];
    this.dot.position.set(...closestPointOnLineCoords);

    if (this.arc)
      this.container.remove(this.arc);

    const distance = quantumStatePoint.clone().sub(closestPointOnLine).length();
    this.arc = createArc(this.rotationAngle, distance, COLOR);
    this.container.add(this.arc);

    this.arc.position.set(...closestPointOnLineCoords);
    this.arc.lookAt(this.arc.worldToLocal(this.container.localToWorld(this.direction.clone())));
    this.arc.updateWorldMatrix(true, true);

    const localQuantumStatePoint = this.arc.worldToLocal(this.container.localToWorld(quantumStatePoint.clone()));
    const projectedQuantumStatePoint = new Vector2(localQuantumStatePoint.x, localQuantumStatePoint.y).normalize();
    const angle = complex(projectedQuantumStatePoint.x, projectedQuantumStatePoint.y).toPolar().phi;
    this.arc.rotateZ(angle);

    // cone at the end of the arc
    {
      const geometry = new ConeGeometry(0.02, 0.06, 16);
      const material = new MeshBasicMaterial({color: COLOR});
      const coneContainer = new Object3D();
      const cone = new Mesh(geometry, material);
      coneContainer.add(cone);
      this.arc.add(coneContainer);
      cone.position.set(distance, 0, 0);
      coneContainer.rotateZ(this.rotationAngle);
    }

    this.arc.visible = !equal(abs(cosineAngle), 1);
  }

  setVisibility(visible: boolean) {
    this.container.visible = visible;
  }
}