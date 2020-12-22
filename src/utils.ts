import {Intersection} from 'three';
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