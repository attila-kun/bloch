import { init } from './lib';

window.onload = function() {
  const bloch = init(
    document.getElementById("stateContainer"),
    document.getElementById("matrixContainer"),
    document.getElementById("canvasContainer"),
    document.getElementById("buttonContainer"),
  );

  function resizeCanvas() {
    const container = document.getElementById("container");
    const settings = document.getElementById("settings");
    const canvasRoot = document.getElementById("canvasRoot");

    const containerRect = container.getBoundingClientRect();
    const settingsRect = settings.getBoundingClientRect();
    const canvasRootRect = canvasRoot.getBoundingClientRect();

    if (settingsRect.top < canvasRootRect.top) { // wrapped
      canvasRoot.style.height = String(containerRect.height - settingsRect.height) + 'px';
    } else { // not wrapped, settings and canvas are next to each other
      canvasRoot.style.height = null;
    }

    const size = Math.min(canvasRoot.clientWidth, canvasRoot.clientHeight);
    bloch.resizeCanvas(size);
  }

  window.onresize = resizeCanvas;
  resizeCanvas();
};