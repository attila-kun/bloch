import {CaptureZone, DragCaptureZone, UserEvent} from './capturezone';
import {AxisLabels} from './axislabels';
import * as THREE from 'three';
import {createSphere, intersectionsToMap, IntersectionMap, createArrow, polarToCaertesian} from './utils';
import {RotationAxis} from './rotationaxis';
import {StateVector} from './statevector';

export type QuantumStateChangeCallback = (theta: number, phi: number) => void;

export function makeBloch(
  canvas: HTMLCanvasElement,
  quantumStateChangedCallback: QuantumStateChangeCallback
  ) {

  setCursor(false);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    preserveDrawingBuffer: true // needed for saving the image into file
  });
  const cameraPos = new THREE.Vector3(0, 0, 2);

  // TODO: move to separate manager
  const captureZones: CaptureZone[] = [];
  const events: UserEvent[] = [];

  const near = 0.1;
  const far = 5;
  const xExtent = 1.5;
  const yExtent = 1.5;
  const aspectRatio = xExtent / yExtent;
  const camera = new THREE.OrthographicCamera(-xExtent, xExtent, yExtent, -yExtent, near, far);
  camera.position.add(cameraPos);

  const scene = new THREE.Scene();

  // light
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 0, 2);
    scene.add(light);
  }

  const object = new THREE.Object3D();
  const textLayer = new THREE.Object3D();
  object.rotateX(-Math.PI/4);
  object.rotateZ(-(Math.PI/2 + Math.PI/4));
  const sphere = createSphere();
  object.add(sphere);
  object.add(createArrow(1, 0, 0));
  object.add(createArrow(0, 1, 0));
  object.add(createArrow(0, 0, 1));

  const rotationAxis = new RotationAxis();
  object.add(rotationAxis.getContainer());

  const _stateVector = new StateVector(textLayer, captureZones);
  object.add(_stateVector.getContainer());

  _stateVector.setTextVisibility(window.localStorage.getItem('bloch-showDragMe') !== 'false');

  _stateVector.onDrag((event: UserEvent, intersects: IntersectionMap) => {
    window.localStorage.setItem('bloch-showDragMe', 'false');
    const sphereIntersection = intersects[sphere.uuid];
    if (sphereIntersection) { // mouse is over sphere
      const point = sphere.worldToLocal(sphereIntersection.point);
      point.normalize();
      setStateVectorToPoint(point);
    } else { // mouse is away from sphere
      const point = object.worldToLocal(new THREE.Vector3(event.x, event.y/aspectRatio, 0)).normalize();
      setStateVectorToPoint(point);
    }
    _stateVector.setTextVisibility(false);
  });

  function setStateVectorToPoint(point: THREE.Vector3) {
    const { theta, phi } = _stateVector.setStateVectorToPoint(point)
    rotationAxis.setArc(point);
    quantumStateChangedCallback(theta, phi);
  }

  _stateVector.onHoverIn(setCursor.bind(null, true));
  _stateVector.onHoverOut(setCursor.bind(null, false));

  const dragCaptureZone = new DragCaptureZone([{uuid: 'background'}]);
  dragCaptureZone.onDrag((event: UserEvent) => {
    const sensitivity = 0.01;
    rotate(event.deltaY * sensitivity, 0, event.deltaX * sensitivity);
    _stateVector.updateText();
  });
  captureZones.push(dragCaptureZone);

  const axisLabels = new AxisLabels(object, textLayer);
  textLayer.position.set(0, 0, 1); // the plane should be between the camera and the sphere
  scene.add(textLayer);
  scene.add(object);
  object.updateWorldMatrix(true, true);

  const raycaster = new THREE.Raycaster();

  function rotate(x: number, y: number, z: number) {
    object.rotation.x += x;
    object.rotation.y += y;
    object.rotation.z += z;
  }

  function setCursor(state: boolean) {
    canvas.style.cursor = state ? 'grab' : 'all-scroll';
  }

  return {

    render() {
      axisLabels.align();

      {
        while (events.length) {

          const event = events.shift();
          raycaster.setFromCamera(event, camera);
          const intersects: IntersectionMap = intersectionsToMap(raycaster.intersectObjects(scene.children, true));
          const activeZone: CaptureZone = captureZones.find(zone => zone.isActive());
          const captureZonesMinusActive: CaptureZone[] = captureZones.filter(zone => zone !== activeZone);

          if (activeZone) {
            activeZone.process(event, intersects);

            if (activeZone.isActive())
              continue;
          }

          for (let i = 0; i < captureZonesMinusActive.length; i++) {
            const captureZone = captureZonesMinusActive[i];

            captureZone.process(event, intersects)
            if (captureZone.isActive()) {
              break;
            }
          }
        }
      }

      renderer.render(scene, camera);
    },

    setQuantumStateVector(theta: number, phi: number) {
      setStateVectorToPoint(new THREE.Vector3(...polarToCaertesian(theta, phi)));
    },

    setRotationAxis(x: number, y: number, z: number, rotationAngle: number) {
      rotationAxis.setDirection(new THREE.Vector3(x, y, z), rotationAngle);
      rotationAxis.setArc(_stateVector.getStateVector());
    },

    onMouseDown(x: number, y: number) {
      events.push({type: 'mousedown', x, y});
    },

    onMouseUp(x: number, y: number) {
      events.push({type: 'mouseup', x, y});
    },

    onMouseMove(x: number, y: number, deltaX: number, deltaY: number) {
      events.push({type: 'mousemove', x, y, deltaX, deltaY});
    }
  };
}