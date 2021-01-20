import { init } from './lib';

window.onload = function() {
  const bloch = init(
    document.getElementById("stateContainer"),
    document.getElementById("matrixContainer"),
    document.getElementById("canvasContainer"),
    document.getElementById("buttonContainer"),
  );

  bloch.resizeCanvas();

  window.onresize = function() {
    bloch.resizeCanvas();
  };
};