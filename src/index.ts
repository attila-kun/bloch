import { makeBloch } from './bloch';
import { calculateOriantation } from './eigen';
import { MatrixInput } from './matrixinput';

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

  return bloch;
}

window.onload = function() {

  function titleText() {
    const element = document.createElement('div');
    element.innerHTML = "Enter a unitary matrix:";
    return element;
  }

  function createGateSelector(onClick: (option: string) => void) {
    const gateSelectorContainer = document.createElement('div');
    gateSelectorContainer.innerHTML = `
      <button name="X">X</button>
      <button name="Y">Y</button>
      <button name="Z">Z</button>
      <button name="H">H</button>
    `;

    gateSelectorContainer.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        onClick(button.name);
      });
    });

    return {
      element: gateSelectorContainer
    };
  }

  function createCanvas() {
    const element = document.createElement('canvas');
    element.width = 1000;
    element.height = 500;
    return element;
  }

  document.body.appendChild(titleText());
  const matrixInput = new MatrixInput(document.body);
  const gateSelector = createGateSelector((option: string) => {
    const optionToMatrix: { [key: string]: [[string, string], [string, string]] } = {
      'X': [['0', '1'], ['1', '0']],
      'Y': [['0', '-i'], ['i', '0']],
      'Z': [['1', '0'], ['0', '-1']],
      'H': [['sqrt(1/2)', 'sqrt(1/2)'], ['sqrt(1/2)', '-sqrt(1/2)']]
    }
    matrixInput.setMatrix(optionToMatrix[option]);
    const matrix = matrixInput.getMatrix();
    const orientation = calculateOriantation(matrix);
    bloch.setRotationAxis(orientation.x, orientation.y, orientation.z, orientation.rotationAngle);
  });
  document.body.appendChild(gateSelector.element);
  let canvas = createCanvas();
  document.body.appendChild(canvas);
  const bloch = main(canvas);
};