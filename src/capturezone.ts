import {IntersectionMap, UUIDMap, objectsToMap} from './utils';

export type UserEvent = {
  type: 'mousedown' | 'mouseup' | 'mousemove',
  x: number,
  y: number,
  deltaX?: number,
  deltaY?: number
};

type Callback = (event: UserEvent, intersects: IntersectionMap) => void;
type UUIDS = {uuid: string}[];

export abstract class CaptureZone {

  protected uuids: UUIDMap;
  protected _isActive: boolean;

  constructor(ids: UUIDS) {
    this.uuids = objectsToMap(ids);
  }

  abstract process(event: UserEvent, intersects: IntersectionMap): void;

  deactivate(): void {
    this._isActive = false;
  };

  isActive(): boolean {
    return this._isActive;
  }

  protected isTargeted(intersects: IntersectionMap): boolean {
    for (let uuid in this.uuids) {
      if (intersects[uuid])
        return true;
    }
    return false;
  }
}

export class DragCaptureZone extends CaptureZone {

  protected dragCallback: Callback;

  constructor(objects: {uuid: string}[]) {
    super(objects);
  }

  onDrag(callback: Callback) { this.dragCallback = callback; }

  process(event: UserEvent, intersects: IntersectionMap): void {
    if (!this._isActive && event.type === 'mousedown' && this.isTargeted(intersects)) {
      this._isActive = true;
      return;
    } else if (this._isActive && event.type === 'mousemove') {
      this.dragCallback(event, intersects);
      return;
    }

    this._isActive = false;
  }

  protected isTargeted(intersects: IntersectionMap): boolean {
    if (this.uuids['background'])
      return true;

    return super.isTargeted(intersects);
  }
}

export class HoverCaptureZone extends CaptureZone {

  private hoverInCallback: Callback;
  private hoverOutCallback: Callback;

  constructor(objects: {uuid: string}[]) {
    super(objects);
  }

  onHoverIn(callback: Callback) { this.hoverInCallback = callback; }
  onHoverOut(callback: Callback) { this.hoverOutCallback = callback; }

  process(event: UserEvent, intersects: IntersectionMap): void {

    const isTargeted = this.isTargeted(intersects);

    if (!this._isActive && event.type === 'mousemove' && isTargeted) { // not hovered -> hovered
      this._isActive = true;
      this.hoverInCallback(event, intersects);
      return;
    }
    if (this._isActive && event.type === 'mousemove' && isTargeted) { // hovered -> hovered
      return;
    } else if (this._isActive
      && (event.type === 'mousemove' && !isTargeted // hovered -> not hovered
      || event.type !== 'mousemove') // non-hover gesture
    ) {
      this._isActive = false;
      this.hoverOutCallback(event, intersects);
      return;
    }

    this._isActive = false;
  }

  deactivate() {
    if (this._isActive) {
      this.hoverOutCallback(null, null);
    }
    super.deactivate();
  }
}