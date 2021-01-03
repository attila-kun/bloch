import { acos, cos, pi, sin } from "mathjs";
import { BufferGeometry, Line, LineDashedMaterial, Mesh, Object3D, Vector2, Vector3 } from "three";
import { createText } from "./axislabels";
import { CaptureZone, DragCaptureZone, HoverCaptureZone, UserEvent } from "./capturezone";
import { IntersectionMap, makeArc, makePaddedArrow, PaddedArrow, polarToCaertesian } from "./utils";

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
  private parent: Object3D; // TODO: use separate container instead
  private _stateVector: Vector3;
  private arrow: PaddedArrow;
  private phiLabel: Mesh;
  private thetaLabel: Mesh;
  private thetaArc: Line;
  private phiArc: Line;
  private phiLine: Line;
  private onDragCallback: OnDragCallback;
  private onHoverInCallback: OnHoverInCallback;
  private onHoverOutCallback: OnHoverOutCallback;

  constructor(p: Object3D, captureZones: CaptureZone[]) {
    this.parent = p;

    this.phiLabel = createText("Φ", -1);
    this.parent.add(this.phiLabel);

    this.thetaLabel = createText("θ", -1);
    this.parent.add(this.thetaLabel);

    this._stateVector = new Vector3(0, 0, 1);
    this.arrow = makePaddedArrow(this._stateVector.x, this._stateVector.y, this._stateVector.z);
    this.parent.add(this.arrow.getContainer());

    const dragZone = new DragCaptureZone([this.arrow.getDragZone()]);
    const hoverZone = new HoverCaptureZone([this.arrow.getDragZone()]);

    dragZone.onDrag((event: UserEvent, intersects: IntersectionMap) => this.onDragCallback(event, intersects));
    captureZones.push(dragZone);

    hoverZone.onHoverIn(() => this.onHoverInCallback());
    hoverZone.onHoverOut(() => this.onHoverOutCallback());
    captureZones.push(hoverZone);
  }

  getStateVector() {
    return this._stateVector.clone();
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
        this.parent.remove(o);
      }

      const newObject = createCallback();
      this.parent.add(newObject);
      return newObject;
    };

    this.thetaArc = removeCreateAdd(this.thetaArc, () => {
      const arc = makeArc(theta, HELPER_RADIUS);
      arc.rotateY(-pi/2);
      arc.rotateX(phi-pi/2);
      return arc;
    });

    const projectedRadius = HELPER_RADIUS * cos(Math.max(pi/2 - theta, 0));
    this.phiArc = removeCreateAdd(this.phiArc, () => makeArc(phi, projectedRadius));

    this.phiLine = removeCreateAdd(this.phiLine, () => {
      const line = makaeDashedLine(new Vector3(projectedRadius, 0, 0));
      line.rotateZ(phi);
      this.parent.add(line);
      return line;
    });

    {
      const offset = -0.1;
      const x = cos(phi/2) * (projectedRadius + offset);
      const y = sin(phi/2) * (projectedRadius + offset);
      this.phiLabel.position.set(x, y, 0);
      this.phiLabel.rotation.set(0, 0, pi/2+phi/2);
    }

    this.thetaLabel.position.set(...polarToCaertesian(theta/2+0.07, phi, 0.5));
    this.thetaLabel.rotation.set(pi/2, phi, -theta/2);

    this.arrow.setDirection(point);
    return { theta, phi };
  }
}