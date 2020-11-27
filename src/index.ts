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

  function makeArrow(): THREE.ArrowHelper {
    const dir = new THREE.Vector3( 1, 0, 0 );
    dir.normalize();
    const origin = new THREE.Vector3( 0, 0, 0 );
    const length = 1;
    const hex = 0xffff00;
    return new THREE.ArrowHelper( dir, origin, length, hex );  
  }  

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const object = new THREE.Object3D();
  object.add(makeSphere());
  const arrow = makeArrow();
  object.add(arrow);
  scene.add(object);

  function onMouseMove(event: MouseEvent) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left)/canvas.width)*2 - 1;
    mouse.y = -(((event.clientY - rect.top)/canvas.height)*2 - 1);
  }

  function render(time: number) {
    time *= 0.001;  // convert time to seconds
    object.rotation.z = time;
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