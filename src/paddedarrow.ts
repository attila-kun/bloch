import { acos, atan2, pi } from "mathjs";
import { ArrowHelper, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from "three";
import { createArrow } from "./utils";

const SPHERE_RADIUS = 0.2;

function createInvisibleCone(x: number, y: number, z: number): Object3D {
  const geometry = new SphereGeometry(SPHERE_RADIUS, 10, 10);
  const material = new MeshBasicMaterial({ visible: false });
  const coneContainer = new Object3D();
  const cone = new Mesh(geometry, material);
  coneContainer.add(cone);
  return coneContainer;
}

// Arrow that has a larger, invisible region sorrounding its tip to make it easier for the user to click.
export class PaddedArrow {
  private container: Object3D;
  private visibleArrow: ArrowHelper;
  private invisibleCone: Object3D;

  constructor() {
    this.container = new Object3D();
    this.visibleArrow = createArrow(1, 0, 0);
    this.invisibleCone = createInvisibleCone(1, 0, 0);
    this.invisibleCone.rotateZ(-pi/2);
    this.invisibleCone.position.set(1-SPHERE_RADIUS/2, 0, 0);
    this.container.add(this.visibleArrow, this.invisibleCone);
  }

  setDirection(dir: Vector3) {
    dir = dir.clone().normalize();
    const theta = acos(dir.z);
    const phi = atan2(dir.y, dir.x);
    this.container.rotation.set(0, 0, phi);
    this.container.rotateY(theta-pi/2);
  }

  getDragZone() {
    return this.invisibleCone.children[0];
  }

  getContainer() {
    return this.container;
  }

  setColor(hex: number) {
    this.visibleArrow.setColor(hex);
  }
}

export function createPaddedArrow(x: number, y: number, z: number): PaddedArrow {
  const paddedArrow = new PaddedArrow();
  paddedArrow.setDirection(new Vector3(x, y, z));
  return paddedArrow;
}