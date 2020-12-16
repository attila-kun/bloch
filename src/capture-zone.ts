import {Intersection} from 'three';

export type UserEvent = {
  type: 'mousedown' | 'mouseup' | 'mousemove',
  x: number,
  y: number,
  deltaX?: number,
  deltaY?: number
};

type Callback = (event: UserEvent) => void;

export abstract class CaptureZone
{
  onDrag(callback: Callback) {
    this.dragCallback = callback;
  }
  abstract process(isActive:boolean, event: UserEvent, intersects: Intersection[]): boolean;

  protected dragCallback: Callback;
}

export class DragCaptureZone extends CaptureZone
{
  process(isActive:boolean, event: UserEvent, intersects: Intersection[]): boolean {
    if (!isActive && event.type === 'mousedown') {
      return true;
    } else if (isActive && event.type === 'mousemove') {
      this.dragCallback(event);
      return true;
    }

    return false;
  }
}