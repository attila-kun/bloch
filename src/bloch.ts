import * as THREE from 'three';

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

export function makeBloch(canvas: HTMLCanvasElement) {

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

  const object = new THREE.Object3D();
  object.add(makeSphere());
  object.add(makeArrow(1, 0, 0));
  object.add(makeArrow(0, 1, 0));
  object.add(makeArrow(0, 0, 1));
  scene.add(object);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  return {

    render() {      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      const arrowHead = intersects.find(o => o.object.parent.type === 'ArrowHelper' && o.object.type === 'Mesh');
      if (arrowHead) {
        console.log('arrow hover', arrowHead);
      }
  
      renderer.render(scene, camera);
    },

    rotate(x: number, y: number, z: number) {
      object.rotation.x += x;
      object.rotation.y += y;
      object.rotation.z += z;
    },

    updateMouse(x: number, y: number) {
        mouse.x = x;
        mouse.y = y;
    }
  };
}