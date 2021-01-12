import { init } from './lib';

window.onload = function() {
  init(
    document.getElementById("stateContainer"),
    document.getElementById("matrixContainer"),
    document.getElementById("canvasContainer"),
    document.getElementById("buttonContainer"),
  );
};