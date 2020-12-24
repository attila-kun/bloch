import {ArrowHelper, BufferGeometry, EllipseCurve, Intersection, Line, LineBasicMaterial, Vector3} from 'three';
import {cos, sin} from 'mathjs';

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

export function makeArc(radians: number, radius: number): THREE.Line {
  const curve = new EllipseCurve(
    0,  0,            // ax, aY
    radius, radius,           // xRadius, yRadius
    0,  radians,      // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  );

  const points = curve.getPoints(50).map(point => new Vector3(point.x, point.y, 0));
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color : 0xffffff });
  return new Line(geometry, material);
}