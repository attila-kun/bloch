import {CaptureZone, DragCaptureZone, UserEvent} from './capture-zone';
import * as THREE from 'three';
import {intersectionsToMap, IntersectionMap} from './utils';

function makeSphere(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1, 40, 40);
  const material = new THREE.MeshPhongMaterial( {color: 0x44aa88} );
  material.transparent = true;
  material.opacity = 0.7;
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

function makeText(text: string): THREE.Mesh {
  //create image
  var bitmap = document.createElement('canvas');
  var g = bitmap.getContext('2d');
  bitmap.width = 25;
  bitmap.height = 25;
  g.font = 'Bold 20px Arial';

  g.fillStyle = 'white';
  g.fillText(text, 0, 20);
  g.strokeStyle = 'black';
  g.strokeText(text, 0, 20);

  // canvas contents will be used for a texture
  var texture = new THREE.Texture(bitmap)
  texture.needsUpdate = true;

  const textSize = 0.2;
  const geometry = new THREE.PlaneGeometry(textSize, textSize, 1);
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide, transparent: true});
  const plane = new THREE.Mesh(geometry, material);
  material.map = texture;
  return plane;
}

function makeArc(): THREE.Line {
  const curve = new THREE.EllipseCurve(
    0,  0,            // ax, aY
    0.5, 0.5,           // xRadius, yRadius
    0,  Math.PI/2,  // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  );

  const points = curve.getPoints(50).map(point => new THREE.Vector3(point.x, point.y, 0));
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
  return new THREE.Line( geometry, material);
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
  object.add(makeArc());

  const quantumStateVector = new THREE.Object3D();
  {
    const arrow = makeArrow(1, 1, 1);
    const dragZone = new DragCaptureZone([arrow.cone]);
    dragZone.onDrag((event: UserEvent, intersects: IntersectionMap) => {
      const sphereIntersection = intersects[sphere.uuid];
      if (sphereIntersection) {
        const point = sphere.worldToLocal(sphereIntersection.point);
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

  // axis labels
  const textLayer = new THREE.Object3D();
  textLayer.position.set(0, 0, 1); // the plane should be between the camera and the sphere
  const xLabel = makeText('x');
  const yLabel = makeText('y');
  const zLabel = makeText('z');
  textLayer.add(xLabel);
  textLayer.add(yLabel);
  textLayer.add(zLabel);

  scene.add(textLayer);
  scene.add(object);

  const raycaster = new THREE.Raycaster();

  function alignLabelToAxis(axis: THREE.Vector3, label: THREE.Mesh) {
    const worldVector3 = object.localToWorld(axis);
    label.position.set(worldVector3.x, worldVector3.y, 0);
  }

  function rotate(x: number, y: number, z: number) {
    object.rotation.x += x;
    object.rotation.y += y;
    object.rotation.z += z;
  }

  return {

    render() {
      alignLabelToAxis(new THREE.Vector3(1, 0, 0), xLabel);
      alignLabelToAxis(new THREE.Vector3(0, 1, 0), yLabel);
      alignLabelToAxis(new THREE.Vector3(0, 0, 1), zLabel);

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