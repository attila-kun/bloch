import { sqrt } from 'mathjs';
import { makeBloch } from './bloch';
import { evaluate } from './parser';

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
  bloch.setRotationAxis(sqrt(1/2), 0, sqrt(1/2), 3.14);
  bloch.setQuantumStateVector(3.14/4, 3.14/4);

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
  canvas.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('mouseup', onMouseUp, false);
  window.addEventListener('mousemove', onMouseMove, false);

}

window.onload = function() {

  function titleText() {
    const element = document.createElement('div');
    element.innerHTML = "Enter a unitary matrix:";
    return element;
  }

  function createInput() {
    const inputContainer = document.createElement('div');

    inputContainer.innerHTML = `
    <table>
    <thead>
    </thead>
    <tbody>
        <tr>
            <td><input class="u00"/></td>
            <td><input class="u01"/></td>
        </tr>
        <tr>
            <td><input class="u10"/></td>
            <td><input class="u11"/></td>
        </tr>
    </tbody>
    </table>
    `;

    const u00: HTMLInputElement = inputContainer.querySelector('.u00');
    const u01: HTMLInputElement = inputContainer.querySelector('.u01');
    const u10: HTMLInputElement = inputContainer.querySelector('.u10');
    const u11: HTMLInputElement = inputContainer.querySelector('.u11');

    return {
      element: inputContainer,
      setMatrix(u00Text: string, u01Text: string, u10Text: string, u11Text: string) {
        u00.value = u00Text;
        u01.value = u01Text;
        u10.value = u10Text;
        u11.value = u11Text;
      },
      getMatrix() {
        return [
          [evaluate(u00.value), evaluate(u01.value)],
          [evaluate(u10.value), evaluate(u11.value)]
        ];
      }
    };
  }

  function createCanvas() {
    const element = document.createElement('canvas');
    element.width = 1000;
    element.height = 500;
    return element;
  }

  document.body.appendChild(titleText());
  const matrixInput = createInput();
  document.body.appendChild(matrixInput.element);
  let canvas = createCanvas();
  document.body.appendChild(canvas);
  main(canvas);

  matrixInput.setMatrix('sqrt(1/2)', 'sqrt(1/2)', 'sqrt(1/2)', '-sqrt(1/2)');
  console.log(matrixInput.getMatrix());
};