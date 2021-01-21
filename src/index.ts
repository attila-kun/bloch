import { init } from './lib';

window.onload = function() {
  const bloch = init(
    document.getElementById("stateContainer"),
    document.getElementById("matrixContainer"),
    document.getElementById("canvasContainer"),
    document.getElementById("buttonContainer"),
  );

  function resizeCanvas() {
    const canvasContainer = document.getElementById("canvasContainer");
    bloch.resizeCanvas(canvasContainer.clientHeight);
  }

  window.onresize = resizeCanvas;
  resizeCanvas();
};