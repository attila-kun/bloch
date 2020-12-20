import * as THREE from 'three';

export function createText(text: string, renderOrder?: number): THREE.Mesh {
  //create image
  var bitmap = document.createElement('canvas');
  var g = bitmap.getContext('2d');
  bitmap.width = 45;
  bitmap.height = 45;
  g.font = 'Bold 40px Arial';

  g.fillStyle = 'white';
  g.fillText(text, 0, 40);
  g.strokeStyle = 'black';
  g.strokeText(text, 0, 40);

  // canvas contents will be used for a texture
  var texture = new THREE.Texture(bitmap)
  texture.needsUpdate = true;

  const textSize = 0.15;
  const geometry = new THREE.PlaneGeometry(textSize, textSize, 1);
  const material = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide, transparent: true});
  const plane = new THREE.Mesh(geometry, material);
  plane.renderOrder = renderOrder ?? 0;
  material.map = texture;
  return plane;
}

export class AxisLabels {

  private parent: THREE.Object3D;
  private xLabel: THREE.Mesh;
  private yLabel: THREE.Mesh;
  private zLabel: THREE.Mesh;

  public layer: THREE.Object3D;

  constructor(parent: THREE.Object3D) {
    this.parent = parent;
    this.layer = new THREE.Object3D();
    this.xLabel = createText('x');
    this.yLabel = createText('y');
    this.zLabel = createText('z');
    this.layer.add(this.xLabel);
    this.layer.add(this.yLabel);
    this.layer.add(this.zLabel);
  }

  align() {
    this.alignLabelToAxis(new THREE.Vector3(1, 0, 0), this.xLabel);
    this.alignLabelToAxis(new THREE.Vector3(0, 1, 0), this.yLabel);
    this.alignLabelToAxis(new THREE.Vector3(0, 0, 1), this.zLabel);
  }

  private alignLabelToAxis(axis: THREE.Vector3, label: THREE.Mesh) {
    const worldVector3 = this.parent.localToWorld(axis);
    label.position.set(worldVector3.x, worldVector3.y, 0);
  }
}