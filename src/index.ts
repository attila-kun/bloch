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

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  function render(time: number) {
    time *= 0.001;  // convert time to seconds

    cube.rotation.x = time;
    cube.rotation.y = time;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

window.onload = function() {  

  function titleText() {
    const element = document.createElement('div');
    element.innerHTML = _.join(['Hello', 'webpack2'], ' ');  
    return element;
  }

  function createCanvas() {
    const element = document.createElement('canvas');    
    return element;
  }
  
  document.body.appendChild(titleText());
  let canvas = createCanvas();
  document.body.appendChild(canvas);
  main(canvas);
};