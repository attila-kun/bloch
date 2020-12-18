import * as _ from 'lodash';
import * as THREE from 'three';
import { makeBloch } from './bloch';

// calculate mouse position in normalized device coordinates
// (-1 to +1) for both components
function toNormalizedCoordinates(canvas: HTMLCanvasElement, event: MouseEvent): [number, number] {
  const rect = canvas.getBoundingClientRect();
  return [
    ((event.clientX - rect.left)/canvas.width)*2 - 1,
    -(((event.clientY - rect.top)/canvas.height)*2 - 1)
  ];
}

function main(canvas: HTMLCanvasElement) {

  let previousMousePosition = { x: 0, y: 0 };
  const bloch = makeBloch(canvas);

  function onMouseDown(event: MouseEvent) { bloch.onMouseDown(...toNormalizedCoordinates(canvas, event)); }

  function onMouseUp(event: MouseEvent) { bloch.onMouseUp(...toNormalizedCoordinates(canvas, event)); }

  function onMouseMove(event: MouseEvent) {

    let deltaMove = {
      x: event.offsetX-previousMousePosition.x,
      y: event.offsetY-previousMousePosition.y
    };

    bloch.onMouseMove(
      ...toNormalizedCoordinates(canvas, event),
      deltaMove.x,
      deltaMove.y
    );

    previousMousePosition = { x: event.offsetX, y: event.offsetY };
  }

  function render(time: number) {
    bloch.render();
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