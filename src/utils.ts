import {Intersection, Object3D} from 'three';

type Map<T> = { [key: string]: T };
export type IntersectionMap = Map<Intersection>;
export type ObjectMap = Map<Object3D>;

function toMap<T>(list: T[], keyExtractor: (item: T) => string) {
  let map: Map<T> = {};
  for (let i = 0; i < list.length; i++) {
    map[keyExtractor(list[i])] = list[i];
  }
  return map;
}

export function objectsToMap(objects: Object3D[]) {
  return toMap(objects, object => object.uuid);
}

export function intersectionsToMap(intersections: Intersection[]) {
  return toMap(intersections, intersection => intersection.object.uuid);
}