import { CaptureZone, DragCaptureZone, HoverCaptureZone, UserEvent } from "./capturezone";
import { acos, cos, pi, sin } from "mathjs";
import { createPaddedArrow, PaddedArrow } from "./paddedarrow";
import { BufferGeometry, Line, LineDashedMaterial, Mesh, Object3D, Vector2, Vector3 } from "three";
import { createText, IntersectionMap, createArc, polarToCaertesian } from "./utils";

type OnDragCallback = any;
type OnHoverInCallback = any;
type OnHoverOutCallback = any;

const HELPER_RADIUS = 0.6;

function makaeDashedLine(endPoint: THREE.Vector3): THREE.Line {

  const gap = 0.025;
  const geometry = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), endPoint]);
  const material = new LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    scale: 1,
    dashSize: gap,
    gapSize: gap,
  });

  const line = new Line(geometry, material);
  line.computeLineDistances();
  return line;
}

export class StateVector {
  private container: Object3D;
  private _stateVector: Vector3;
  private arrow: PaddedArrow;
  private phiLabel: Mesh;
  private thetaLabel: Mesh;
  private thetaArc: Line;
  private phiArc: Line;
  private phiLine: Line;
  private dragMe: Mesh;
  private onDragCallback: OnDragCallback;
  private onHoverInCallback: OnHoverInCallback;
  private onHoverOutCallback: OnHoverOutCallback;

  constructor(textLayer: Object3D, captureZones: CaptureZone[]) {
    this.container = new Object3D();

    this.phiLabel = createText("Φ", { renderOrder: -1});
    this.container.add(this.phiLabel);

    this.thetaLabel = createText("θ", { renderOrder: -1});
    this.container.add(this.thetaLabel);

    this._stateVector = new Vector3(0, 0, 1);
    this.arrow = createPaddedArrow(this._stateVector.x, this._stateVector.y, this._stateVector.z);
    this.container.add(this.arrow.getContainer());

    const dragZone = new DragCaptureZone([this.arrow.getDragZone()]);
    const hoverZone = new HoverCaptureZone([this.arrow.getDragZone()]);

    dragZone.onDrag((event: UserEvent, intersects: IntersectionMap) => this.onDragCallback(event, intersects));
    captureZones.push(dragZone);

    hoverZone.onHoverIn(() => this.onHoverInCallback());
    hoverZone.onHoverOut(() => this.onHoverOutCallback());
    captureZones.push(hoverZone);

    this.dragMe = createText("drag me", { width: 0.5});
    textLayer.add(this.dragMe);
  }

  getContainer() {
    return this.container;
  }

  getStateVector() {
    return this._stateVector.clone();
  }

  setTextVisibility(visible: boolean) {
    this.dragMe.visible = visible;
  }

  onDrag(callback: OnDragCallback) { this.onDragCallback = callback; }
  onHoverIn(callback: OnHoverInCallback) { this.onHoverInCallback = callback; }
  onHoverOut(callback: OnHoverOutCallback) { this.onHoverOutCallback = callback; }

  setArrowColor(hex: number) {
    this.arrow.setColor(hex);
  }

  setStateVectorToPoint(point: Vector3) {
    this._stateVector = point;
    const theta = acos(point.dot(new Vector3(0, 0, 1)));
    let phi = acos((new Vector2(point.x, point.y).normalize()).dot(new Vector2(1, 0)));
    if (point.dot(new Vector3(0, 1, 0)) < 0)
      phi = pi * 2 - phi;

    const removeCreateAdd = <T extends Object3D>(o: T, createCallback: () => T): T => {
      if (o) {
        this.container.remove(o);
      }

      const newObject = createCallback();
      this.container.add(newObject);
      return newObject;
    };

    this.thetaArc = removeCreateAdd(this.thetaArc, () => {
      const arc = createArc(theta, HELPER_RADIUS);
      arc.rotateY(-pi/2);
      arc.rotateX(phi-pi/2);
      return arc;
    });

    const projectedRadius = HELPER_RADIUS * cos(Math.max(pi/2 - theta, 0));
    this.phiArc = removeCreateAdd(this.phiArc, () => createArc(phi, projectedRadius));

    this.phiLine = removeCreateAdd(this.phiLine, () => {
      const line = makaeDashedLine(new Vector3(projectedRadius, 0, 0));
      line.rotateZ(phi);
      this.container.add(line);
      return line;
    });

    {
      const radialOffset = -0.075;
      const angularOffset = 0.1;
      const x = cos(phi/2 + angularOffset) * (projectedRadius + radialOffset);
      const y = sin(phi/2 + angularOffset) * (projectedRadius + radialOffset);
      this.phiLabel.position.set(x, y, 0);
      this.phiLabel.rotation.set(0, 0, pi/2+phi/2);
      this.phiLabel.visible = projectedRadius**2 * phi / pi > 0.02; // only render if the sector drawn for the phi angle is large enough to accomodate for the label
    }

    const alignmentTheta = theta/2+0.09;
    this.thetaLabel.position.set(...polarToCaertesian(alignmentTheta, phi, 0.5));
    this.thetaLabel.rotation.set(pi/2, phi, -alignmentTheta);
    this.thetaLabel.visible = theta > 0.2; // only render if there is enough spcae for the label to appear

    this.arrow.setDirection(point);
    this.updateText();

    return { theta, phi };
  }

  updateText() {
    const worldPoint = this.container.localToWorld(this._stateVector.clone().multiplyScalar(1.3));
    this.dragMe.position.set(worldPoint.x, worldPoint.y, 0);
  }
}