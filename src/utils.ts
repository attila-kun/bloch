import {Intersection, Object3D} from 'three';

export type IntersectionMap = { [key: string]: boolean };

function toMap<T>(list: T[], keyExtractor: (item: T) => string) {
  let map: IntersectionMap = {};
  for (let i = 0; i < list.length; i++) {
    map[keyExtractor(list[i])] = true;
  }
  return map;
}

export function objectsToMap(objects: {uuid: string}[]) {
  return toMap(objects, object => object.uuid);
}

export function intersectionsToMap(intersections: Intersection[]) {
  return toMap(intersections, intersection => intersection.object.uuid);
}