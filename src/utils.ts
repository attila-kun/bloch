import {ArrowHelper, BufferGeometry, DoubleSide, EllipseCurve, Intersection, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PlaneGeometry, SphereGeometry, Texture, Vector3} from 'three';
import {acos, atan2, cos, equal, pi, sin} from 'mathjs';

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

export function createArrow(x: number, y: number, z: number, hex: number = 0xffff00): ArrowHelper {
  const dir = new Vector3(x, y, z);
  dir.normalize();
  const origin = new Vector3(0, 0, 0);
  const length = 1;
  return new ArrowHelper(dir, origin, length, hex);
}

export function createSphere(): Mesh {
  const geometry = new SphereGeometry(1, 40, 40);
  const material = new MeshPhongMaterial( {color: 0x44aa88} );
  material.transparent = true;
  material.opacity = 0.2;
  return new Mesh(geometry, material);
}

export function createArc(radians: number, radius: number): Line {
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

export function createText(
  text: string,
  options: {
    renderOrder?: number,
    width?: number,
    height?: number
  } = {}
): Mesh {

  const TEXT_SIZE = 0.15;
  options.width = options.width ?? TEXT_SIZE;
  options.height = options.height ?? TEXT_SIZE;

  //create image
  const bitmap = document.createElement('canvas');
  const g = bitmap.getContext('2d');
  bitmap.width = 60 * options.width / TEXT_SIZE;;
  bitmap.height = 60 * options.height / TEXT_SIZE;
  g.font = 'Bold 40px Arial';

  g.fillStyle = 'white';
  g.fillText(text, 0, 40);
  g.strokeStyle = 'black';
  g.strokeText(text, 0, 40);

  // canvas contents will be used for a texture
  const texture = new Texture(bitmap)
  texture.needsUpdate = true;

  const geometry = new PlaneGeometry(options.width, options.height, 1);
  const material = new MeshBasicMaterial({color: 0xffffff, side: DoubleSide, transparent: true});
  const plane = new Mesh(geometry, material);
  plane.renderOrder = options.renderOrder ?? 0;
  material.map = texture;
  return plane;
}