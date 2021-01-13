import { makeBloch, QuantumStateChangeCallback } from './bloch';
import { calculateOriantation, Matrix2x2 } from './eigen';
import { GateSelector, SelectedGate } from './gateselector';
import { SelectedState, StateSelector } from './stateselector';
import { MatrixInput } from './matrixinput';
import { QuantumStateInput } from './quantumstateinput';
import { pi } from 'mathjs';

// calculate mouse position in normalized device coordinates
// (-1 to +1) for both components
function toNormalizedCoordinates(canvas: HTMLCanvasElement, event: MouseEvent): [number, number] {
  const rect = canvas.getBoundingClientRect();
  return [
    ((event.clientX - rect.left)/canvas.width)*2 - 1,
    -(((event.clientY - rect.top)/canvas.height)*2 - 1)
  ];
}

function initCanvas(canvas: HTMLCanvasElement, quantumStateChanged: QuantumStateChangeCallback) {

  let previousMousePosition = { x: 0, y: 0 };
  const bloch = makeBloch(canvas, quantumStateChanged);
  bloch.setQuantumStateVector(3.14/4, 3.14/2);

  function onPointerDown(event: MouseEvent) {
    previousMousePosition = { x: event.pageX, y: event.pageY };
    bloch.onMouseDown(...toNormalizedCoordinates(canvas, event));
  }

  function onPointerUp(event: MouseEvent) { bloch.onMouseUp(...toNormalizedCoordinates(canvas, event)); }

  function onPointerMove(event: MouseEvent) {

    let deltaMove = {
      x: event.pageX-previousMousePosition.x,
      y: event.pageY-previousMousePosition.y
    };

    bloch.onMouseMove(
      ...toNormalizedCoordinates(canvas, event),
      deltaMove.x,
      deltaMove.y
    );

    previousMousePosition = { x: event.pageX, y: event.pageY };
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
  new StateSelector(stateContainer, (option: string) => {
    const optionToPhiAndTheta: any = {
      [SelectedState.state0]: { theta: 0, phi: 0 },
      [SelectedState.state1]: { theta: pi, phi: 0 },
      [SelectedState.statePlus]: { theta: pi/2, phi: 0 },
      [SelectedState.stateMinus]: { theta: pi/2, phi: pi },
    }

    const { theta, phi } = optionToPhiAndTheta[option];
    quantumStateInput.update(theta, phi);
    bloch.setQuantumStateVector(theta, phi);
  });

  const matrixInput = new MatrixInput(matrixContainer, (matrix: Matrix2x2) => setMatrixOnBloch(matrix));
  new GateSelector(matrixContainer, (option: string) => {
    const optionToMatrix: { [key: string]: [[string, string], [string, string]] } = {
      [SelectedGate.X]: [['0', '1'], ['1', '0']],
      [SelectedGate.Y]: [['0', '-i'], ['i', '0']],
      [SelectedGate.Z]: [['1', '0'], ['0', '-1']],
      [SelectedGate.H]: [['sqrt(1/2)', 'sqrt(1/2)'], ['sqrt(1/2)', '-sqrt(1/2)']],
      [SelectedGate.Clear]: [['', ''], ['', '']]
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

  buttonContainer.appendChild(createSaveImageButton(() =>
    canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")  // here is the most important part because if you dont replace you will get a DOM 18 exception.
  ));

  let canvas = createCanvas();
  canvasContainer.appendChild(canvas);
  const bloch = initCanvas(canvas, (theta, phi) => quantumStateInput.update(theta, phi));
};