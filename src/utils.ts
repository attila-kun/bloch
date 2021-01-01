import {ArrowHelper, AxesHelper, BufferGeometry, ConeGeometry, DoubleSide, EllipseCurve, Intersection, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Object3D, Vector3} from 'three';
import {acos, atan, atan2, cos, equal, pi, sin} from 'mathjs';

type Map<T> = { [key: string]: T };
export type IntersectionMap = Map<Intersection>;
export type UUIDMap = Map<true>;

function toMap<T, V>(list: T[], keyExtractor: (item: T) => string, valueExtractor: (item: T) => V) {
  let map: Map<V> = {};
  for (let i = 0; i < list.length; i++) {
    map[keyExtractor(list[i])] = valueExtractor(list[i]);
  }
  return map;
}

export function objectsToMap(objects: {uuid: string}[]): UUIDMap {
  return toMap(objects, object => object.uuid, () => true);
}

export function intersectionsToMap(intersections: Intersection[]) {
  return toMap(intersections, intersection => intersection.object.uuid, intersection => intersection);
}

export function polarToCaertesian(theta: number, phi: number, r: number = 1): [number, number, number] {
  const x = r * sin(theta) * cos(phi);
  const y = r * sin(theta) * sin(phi);
  const z = r * cos(theta);
  return [x, y, z];
}

export function makeArrow(x: number, y: number, z: number, hex: number = 0xffff00): ArrowHelper {
  const dir = new Vector3(x, y, z);
  dir.normalize();
  const origin = new Vector3(0, 0, 0);
  const length = 1;
  return new ArrowHelper(dir, origin, length, hex);
}

const CONE_HEIGHT = 0.2;

function makeInvisibleCone(x: number, y: number, z: number): Object3D {
  const geometry = new ConeGeometry(0.1, CONE_HEIGHT, 16);
  const material = new MeshBasicMaterial({ visible: false });
  const coneContainer = new Object3D();
  const cone = new Mesh(geometry, material);
  coneContainer.add(cone);
  return coneContainer;
}

// Arrow that has a larger, invisible region sorrounding its tip to make it easier for the user to click.
class PaddedArrow {
  private container: Object3D;
  private visibleArrow: ArrowHelper;
  private invisibleArrow: Object3D;

  constructor(hex: number) {
    this.container = new Object3D();
    this.visibleArrow = makeArrow(1, 0, 0);
    this.invisibleArrow = makeInvisibleCone(1, 0, 0);
    this.invisibleArrow.rotateZ(-pi/2);
    this.invisibleArrow.position.set(1-CONE_HEIGHT/2, 0, 0);
    this.container.add(this.visibleArrow, this.invisibleArrow);
  }

  setDirection(dir: Vector3) {
    dir = dir.clone().normalize();
    const theta = acos(dir.z);
    const phi = atan2(dir.y, dir.x);
    this.container.rotation.set(0, 0, phi);
    this.container.rotateY(theta-pi/2);
  }

  getDragZone() {
    return this.invisibleArrow.children[0];
  }

  getContainer() {
    return this.container;
  }
}

export function makePaddedArrow(x: number, y: number, z: number, hex: number = 0xffff00): PaddedArrow {
  const paddedArrow = new PaddedArrow(hex);
  paddedArrow.setDirection(new Vector3(x, y, z));
  return paddedArrow;
}

export function makeArc(radians: number, radius: number): THREE.Line {
  const curve = new EllipseCurve(
    0,  0,            // ax, aY
    radius, radius,   // xRadius, yRadius
    0,  radians,      // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  );

  const points = curve.getPoints(equal(radians, 0) ? 0 : 50).map(point => new Vector3(point.x, point.y, 0));
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color : 0xffffff });
  return new Line(geometry, material);
}