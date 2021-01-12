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
  bloch.setQuantumStateVector(3.14/4, 3.14/2);

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

export function init(
  stateContainer: HTMLElement,
  matrixContainer: HTMLElement,
  canvasContainer: HTMLElement,
  buttonContainer: HTMLElement
) {

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
      <button name="Clear">Clear</button>
    `;

    gateSelectorContainer.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => onClick(button.name));
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
    element.width = 500;
    element.height = 500;
    element.style.setProperty('touch-action', 'none');
    return element;
  }

  const quantumStateInput = new QuantumStateInput(stateContainer, (theta: number, phi: number) => bloch.setQuantumStateVector(theta, phi));

  const matrixInput = new MatrixInput(matrixContainer, (matrix: Matrix2x2) => setMatrixOnBloch(matrix));
  const gateSelector = createGateSelector((option: string) => {
    const optionToMatrix: { [key: string]: [[string, string], [string, string]] } = {
      'X': [['0', '1'], ['1', '0']],
      'Y': [['0', '-i'], ['i', '0']],
      'Z': [['1', '0'], ['0', '-1']],
      'H': [['sqrt(1/2)', 'sqrt(1/2)'], ['sqrt(1/2)', '-sqrt(1/2)']],
      'Clear': [['', ''], ['', '']]
    }
    matrixInput.setMatrix(optionToMatrix[option]);
    setMatrixOnBloch(matrixInput.getMatrix());
  });

  const setMatrixOnBloch = (matrix: Matrix2x2|null) => {
    if (matrix === null) {
      bloch.hideRotationAxis();
      return;
    }

    const orientation = calculateOriantation(matrix);
    bloch.setRotationAxis(orientation.x, orientation.y, orientation.z, orientation.rotationAngle);
  };

  matrixContainer.appendChild(gateSelector.element);

  buttonContainer.appendChild(createSaveImageButton(() =>
    canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")  // here is the most important part because if you dont replace you will get a DOM 18 exception.
  ));

  let canvas = createCanvas();
  canvasContainer.appendChild(canvas);
  const bloch = main(canvas, (theta, phi) => quantumStateInput.update(theta, phi));
};