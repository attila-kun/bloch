import { cos, sin } from "mathjs";

export class QuantumStateInput {
  private container: HTMLElement;
  private parent: HTMLElement;
  private input: HTMLInputElement;

  constructor(p: HTMLElement) {
    this.parent = p;
    this.container = document.createElement('div');
    this.container.innerHTML = `
    <table>
    <thead>
    </thead>
    <tbody>
        <tr>
            <td><input style="width: 325px"/></td>
        </tr>
    </tbody>
    </table>
    `;
    this.input = this.container.querySelector('input');
    this.parent.appendChild(this.container);
  }

  update(theta: number, phi: number) {
    const precision = 3;
    const str = `${cos(theta/2).toFixed(precision)}|0> + e^(i${phi.toFixed(precision)}) ${sin(theta/2).toFixed(precision)}|1>`
    this.input.value = str;
  }
}