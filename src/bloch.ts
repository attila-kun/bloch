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

  const textSize = 0.1;
  const geometry = new THREE.PlaneGeometry(textSize, textSize, 1 );
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

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
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
  object.add(makeSphere());
  object.add(makeArrow(1, 0, 0));
  object.add(makeArrow(0, 1, 0));
  object.add(makeArrow(0, 0, 1));
  object.add(makeArc());

  // axis labels
  const textPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1); // the plane should be between the camera and the sphere
  const textLayer = new THREE.Object3D();  
  textLayer.position.set(0, 0, textPlane.constant); // the text layer should coincide with the text plane
  const xLabel = makeText('x');
  const yLabel = makeText('y');
  const zLabel = makeText('z');
  textLayer.add(xLabel);
  textLayer.add(yLabel);
  textLayer.add(zLabel);

  scene.add(textLayer);
  scene.add(object);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function alignLabelToAxis(axis: THREE.Vector3, label: THREE.Mesh) {
    const xWorldVector3 = object.localToWorld(axis);    
    const target = new THREE.Vector3(0, 0, 0);
  
    // Project the axis coordinates to a plane in front of the camera to achieve a floating effect for the axis labels.
    // This is to ensure that the labels only change their vertical and horizontal positions but not their size or orientation as the user drags the Bloch sphere.
    textPlane.intersectLine(new THREE.Line3(cameraPos, xWorldVector3), target);      
    label.position.set(target.x, target.y, 0);
  }  

  return {

    render() {      
      raycaster.setFromCamera(mouse, camera);

      alignLabelToAxis(new THREE.Vector3(1, 0, 0), xLabel);
      alignLabelToAxis(new THREE.Vector3(0, 1, 0), yLabel);
      alignLabelToAxis(new THREE.Vector3(0, 0, 1), zLabel);

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