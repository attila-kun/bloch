import {CaptureZone, DragCaptureZone, UserEvent} from './capture-zone';
import {AxisLabels, createText} from './axislabels';
import * as THREE from 'three';
import {acos, pi} from 'mathjs';
import {intersectionsToMap, IntersectionMap} from './utils';

const helperRadius = 0.6;

function makeSphere(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1, 40, 40);
  const material = new THREE.MeshPhongMaterial( {color: 0x44aa88} );
  material.transparent = true;
  material.opacity = 0.2;
  return new THREE.Mesh( geometry, material );
}

function makeArrow(x: number, y: number, z: number): THREE.ArrowHelper {
  const dir = new THREE.Vector3(x, y, z);
  dir.normalize();
  const origin = new THREE.Vector3(0, 0, 0);
  const length = 1;
  const hex = 0xffff00;
  return new THREE.ArrowHelper(dir, origin, length, hex);
}

function makeArc(radians: number): THREE.Line {
  const curve = new THREE.EllipseCurve(
    0,  0,            // ax, aY
    helperRadius, helperRadius,           // xRadius, yRadius
    0,  radians,  // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  );

  const points = curve.getPoints(50).map(point => new THREE.Vector3(point.x, point.y, 0));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color : 0xffffff });
  return new THREE.Line(geometry, material);
}

function makaeDashedLine(endPoint: THREE.Vector3): THREE.Line {

  const gap = 0.025;
  const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), endPoint]);
  const material = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    scale: 1,
    dashSize: gap,
    gapSize: gap,
  });

  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

export function makeBloch(canvas: HTMLCanvasElement) {

  const renderer = new THREE.WebGLRenderer({canvas});
  const cameraPos = new THREE.Vector3(0, 0, 2);

  // TODO: move to separate manager
  const captureZones: CaptureZone[] = [];
  let activeZone: CaptureZone = null;
  const events: UserEvent[] = [];

  const near = 0.1;
  const far = 5;
  const camera = new THREE.OrthographicCamera(-3, 3, 1.5, -1.5, near, far);
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
  object.rotateX(-Math.PI/4);
  object.rotateZ(-(Math.PI/2 + Math.PI/4));
  const sphere = makeSphere();
  object.add(sphere);
  object.add(makeArrow(1, 0, 0));
  object.add(makeArrow(0, 1, 0));
  object.add(makeArrow(0, 0, 1));

  const thetaText = createText("θ");
  thetaText.rotateZ(pi/2);
  thetaText.geometry.center().translate(0.05, -0.5, 0);
  const baseThetaRotationZ = thetaText.rotation.z;

  object.add(thetaText);

  let thetaArc: THREE.Line;
  let phiArc: THREE.Line;
  let phiLine: THREE.Line;

  const quantumStateVector = new THREE.Object3D();
  {
    const arrow = makeArrow(1, 1, 1);
    const dragZone = new DragCaptureZone([arrow.cone]);
    dragZone.onDrag((event: UserEvent, intersects: IntersectionMap) => {
      const sphereIntersection = intersects[sphere.uuid];
      if (sphereIntersection) {
        const point = sphere.worldToLocal(sphereIntersection.point);
        point.normalize();
        const theta = acos(point.dot(new THREE.Vector3(0, 0, 1)));
        let phi = acos((new THREE.Vector2(point.x, point.y).normalize()).dot(new THREE.Vector2(1, 0)));
        if (point.dot(new THREE.Vector3(0, 1, 0)) < 0)
          phi = pi * 2 - phi;

        if (thetaArc)
          object.remove(thetaArc);

        if (phiArc)
          object.remove(phiArc);

        if (phiLine)
          object.remove(phiLine)

        thetaArc = makeArc(theta);
        thetaArc.rotateY(-pi/2);
        thetaArc.rotateX(-pi/2);
        thetaArc.rotateX(phi);
        object.add(thetaArc);

        thetaText.rotation.set(0, 0, baseThetaRotationZ + phi/2);

        phiArc = makeArc(phi);
        object.add(phiArc);

        phiLine = makaeDashedLine(new THREE.Vector3(helperRadius, 0, 0));
        phiLine.rotateZ(phi);
        object.add(phiLine);

        arrow.setDirection(point);
      }
    });
    captureZones.push(dragZone);
    quantumStateVector.add(arrow);
    object.add(quantumStateVector);
  }

  const dragCaptureZone = new DragCaptureZone([{uuid: 'background'}]);
  dragCaptureZone.onDrag((event: UserEvent) => {
    const sensitivity = 0.01;
    rotate(event.deltaY * sensitivity, 0, event.deltaX * sensitivity);
  });
  captureZones.push(dragCaptureZone);

  const axisLabels = new AxisLabels(object);
  axisLabels.layer.position.set(0, 0, 1); // the plane should be between the camera and the sphere
  scene.add(axisLabels.layer);
  scene.add(object);

  const raycaster = new THREE.Raycaster();

  function rotate(x: number, y: number, z: number) {
    object.rotation.x += x;
    object.rotation.y += y;
    object.rotation.z += z;
  }

  return {

    render() {
      axisLabels.align();

      {
        while (events.length) {

          const event = events.shift();
          raycaster.setFromCamera(event, camera);
          let intersects: IntersectionMap = intersectionsToMap(raycaster.intersectObjects(scene.children, true));

          if (activeZone) {
            if (!activeZone.process(true, event, intersects)) {
              activeZone = null;
            }
          } else {
            for (let i = 0; i < captureZones.length; i++) {
              const captureZone = captureZones[i];
              if (captureZone.process(false, event, intersects)) {
                activeZone = captureZone;
                break;
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
    },

    setQuantumStateVector(radians: number, phase: number) {
      // TODO: stop rotating because it messes with .setDirection(...)
      quantumStateVector.rotation.set(0, 0, 0);
      quantumStateVector.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), radians);
      quantumStateVector.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), phase);
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