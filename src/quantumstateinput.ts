import { acos, asin, cos, sin } from "mathjs";

type OnChangeCallback = (theta: number, phi: number) => void;

const AMPLITUDE0 = 'amplitude0';
const AMPLITUDE1 = 'amplitude1';
const PHASE = 'phase';

export class QuantumStateInput {
  private container: HTMLElement;
  private parent: HTMLElement;
  private amplitude0: HTMLInputElement;
  private amplitude1: HTMLInputElement;
  private phase: HTMLInputElement;
  private onChangeCallback: OnChangeCallback;

  constructor(p: HTMLElement, callback: OnChangeCallback) {
    this.parent = p;
    this.onChangeCallback = callback;
    this.container = document.createElement('div');
    this.container.innerHTML = `
    <table>
    <thead>
    </thead>
    <tbody>
        <tr>
            <td><input name="${AMPLITUDE0}" style="width: 55px"/></td>
            <td>|0> + exp</td>
            <td>(<input name="${PHASE}" style="width: 55px"/>)</td>
            <td><input name="${AMPLITUDE1}" style="width: 55px"/></td>
            <td>|1></td>
        </tr>
    </tbody>
    </table>
    `;
    this.amplitude0 = this.container.querySelector(`[name=${AMPLITUDE0}]`);
    this.amplitude1 = this.container.querySelector(`[name=${AMPLITUDE1}]`);
    this.phase = this.container.querySelector(`[name=${PHASE}]`);

    [this.amplitude0, this.amplitude1, this.phase].forEach(input => {
      input.addEventListener('change', this.onInputChange); // TODO: cleanup
    });

    this.parent.appendChild(this.container);
  }

  update(theta: number, phi: number) {
    const precision = 3;
    this.amplitude0.value = String(cos(theta/2).toFixed(precision));
    this.phase.value = 'i' + String(phi.toFixed(precision));
    this.amplitude1.value = String(sin(theta/2).toFixed(precision));
  }

  private onInputChange = (event: Event) => {
    const targetName: string = (event.target as HTMLInputElement).name;

    let theta;
    switch(targetName) {
      case AMPLITUDE1:
      theta = asin(parseFloat(this.amplitude1.value)) * 2;
      break;

      case AMPLITUDE0:
      default:
        theta = acos(parseFloat(this.amplitude0.value)) * 2;
        break;
    }

    const phi = parseFloat(this.phase.value.replace('i', ''));
    this.onChangeCallback(theta, phi);
  };
}