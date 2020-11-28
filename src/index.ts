import * as _ from 'lodash';
import * as THREE from 'three';

function main(canvas: HTMLCanvasElement) {  
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  // light
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 0, 20);
    scene.add(light);
  }

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

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let previousMousePosition = { x: 0, y: 0 };
  let isDragging = false;

  const object = new THREE.Object3D();
  object.add(makeSphere());
  object.add(makeArrow(1, 0, 0));
  object.add(makeArrow(0, 1, 0));
  object.add(makeArrow(0, 0, 1));
  scene.add(object);

  function onMouseDown(event: MouseEvent) { isDragging = true; }
  function onMouseUp(event: MouseEvent) { isDragging = false; }

  function onMouseMove(event: MouseEvent) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left)/canvas.width)*2 - 1;
    mouse.y = -(((event.clientY - rect.top)/canvas.height)*2 - 1);

    let deltaMove = {
      x: event.offsetX-previousMousePosition.x,
      y: event.offsetY-previousMousePosition.y
    };

    if (isDragging) {
      const sensitivity = 0.01;
      object.rotation.y += deltaMove.x * sensitivity;
      object.rotation.x += deltaMove.y * sensitivity;
    }

    previousMousePosition = { x: event.offsetX, y: event.offsetY };
  }

  function render(time: number) {

    function toRadians(angle: number) {
      return angle * (Math.PI / 180);
    }

    time *= 0.001;  // convert time to seconds    

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    const arrowHead = intersects.find(o => o.object.parent.type === 'ArrowHelper' && o.object.type === 'Mesh');
    if (arrowHead) {
      console.log('arrow hover', arrowHead);
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // TODO: cleanup  
  window.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('mouseup', onMouseUp, false);
  window.addEventListener('mousemove', onMouseMove, false);  

}

window.onload = function() {  

  function titleText() {
    const element = document.createElement('div');
    element.innerHTML = _.join(['Hello', 'webpack2'], ' ');  
    return element;
  }

  function createCanvas() {
    const element = document.createElement('canvas');
    element.width = 1000;
    element.height = 500;
    return element;
  }
  
  document.body.appendChild(titleText());
  let canvas = createCanvas();
  document.body.appendChild(canvas);
  main(canvas);
};