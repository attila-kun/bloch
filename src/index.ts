import { makeBloch, QuantumStateChangeCallback } from './bloch';
import { calculateOriantation, Matrix2x2 } from './eigen';
import { MatrixInput } from './matrixinput';
import { QuantumStateInput } from './quantumstateinput';

// calculate mouse position in normalized device coordinates
// (-1 to +1) for both components
function toNormalizedCoordinates(canvas: HTMLCanvasElement, event: MouseEvent): [number, number] {
  const rect = canvas.getBoundingClientRect();
  return [
    ((event.clientX - rect.left)/canvas.width)*2 - 1,
    -(((event.clientY - rect.top)/canvas.height)*2 - 1)
  ];
}

function main(canvas: HTMLCanvasElement, quantumStateChanged: QuantumStateChangeCallback) {

  let previousMousePosition = { x: 0, y: 0 };
  const bloch = makeBloch(canvas, quantumStateChanged);
  bloch.setQuantumStateVector(3.14/4, 3.14/4);

  function onPointerDown(event: MouseEvent) {
    previousMousePosition = { x: event.offsetX, y: event.offsetY };
    bloch.onMouseDown(...toNormalizedCoordinates(canvas, event));
  }

  function onPointerUp(event: MouseEvent) { bloch.onMouseUp(...toNormalizedCoordinates(canvas, event)); }

  function onPointerMove(event: MouseEvent) {

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
  canvas.addEventListener('pointerdown', onPointerDown, false);
  window.addEventListener('pointerup', onPointerUp, false);
  window.addEventListener('pointermove', onPointerMove, false);

  return bloch;
}

window.onload = function() {

  function titleText(text: string) {
    const element = document.createElement('div');
    element.innerHTML = text;
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

  function createSaveImageButton(getDataURLCallback: () => string) {
    const container = document.createElement('div');

    const button = document.createElement('button');
    button.textContent = 'Save image';
    container.appendChild(button);

    const link = document.createElement('a');
    container.appendChild(link);

    // TODO: clenaup
    button.addEventListener('click', () => {
      link.setAttribute('download', 'bloch.png');
      link.setAttribute('href', getDataURLCallback());
      link.click();
    });

    return container;
  }

  function createCanvas() {
    const element = document.createElement('canvas');
    element.width = 1000;
    element.height = 500;
    element.style.setProperty('touch-action', 'none');
    return element;
  }

  document.body.appendChild(titleText("Quantum state:"));
  const quantumStateInput = new QuantumStateInput(document.body, (theta: number, phi: number) => bloch.setQuantumStateVector(theta, phi));

  document.body.appendChild(titleText("Enter a unitary matrix:"));
  const matrixInput = new MatrixInput(document.body, (matrix: Matrix2x2) => setMatrixOnBloch(matrix));
  const gateSelector = createGateSelector((option: string) => {
    const optionToMatrix: { [key: string]: [[string, string], [string, string]] } = {
      'X': [['0', '1'], ['1', '0']],
      'Y': [['0', '-i'], ['i', '0']],
      'Z': [['1', '0'], ['0', '-1']],
      'H': [['sqrt(1/2)', 'sqrt(1/2)'], ['sqrt(1/2)', '-sqrt(1/2)']]
    }
    matrixInput.setMatrix(optionToMatrix[option]);
    setMatrixOnBloch(matrixInput.getMatrix());
  });

  const setMatrixOnBloch = (matrix: Matrix2x2) => {
    const orientation = calculateOriantation(matrix);
    bloch.setRotationAxis(orientation.x, orientation.y, orientation.z, orientation.rotationAngle);
  };

  document.body.appendChild(gateSelector.element);

  document.body.appendChild(createSaveImageButton(() =>
    canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")  // here is the most important part because if you dont replace you will get a DOM 18 exception.
  ));

  let canvas = createCanvas();
  document.body.appendChild(canvas);
  const bloch = main(canvas, (theta, phi) => quantumStateInput.update(theta, phi));
};