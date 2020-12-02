import * as _ from 'lodash';
import * as THREE from 'three';
import { makeBloch } from './bloch';

function main(canvas: HTMLCanvasElement) {

  let previousMousePosition = { x: 0, y: 0 };
  let isDragging = false;
  const bloch = makeBloch(canvas);

  function onMouseDown(event: MouseEvent) { isDragging = true; }

  function onMouseUp(event: MouseEvent) { isDragging = false; }

  function onMouseMove(event: MouseEvent) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    const rect = canvas.getBoundingClientRect();
    bloch.updateMouse(
      ((event.clientX - rect.left)/canvas.width)*2 - 1,
      -(((event.clientY - rect.top)/canvas.height)*2 - 1)
    );

    let deltaMove = {
      x: event.offsetX-previousMousePosition.x,
      y: event.offsetY-previousMousePosition.y
    };

    if (isDragging) {
      const sensitivity = 0.01;
      bloch.rotate(deltaMove.y * sensitivity, 0, deltaMove.x * sensitivity);
    }

    previousMousePosition = { x: event.offsetX, y: event.offsetY };
  }

  bloch.setQuantumStateVector(Math.PI/4, Math.PI/4); // TODO: remove

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