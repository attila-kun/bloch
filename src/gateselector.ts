import { ButtonSelector, OnClickCallback } from './buttonselector';

export enum SelectedGate {
  X = 'X',
  Y = 'Y',
  Z = 'Z',
  H = 'H',
  Clear = 'Clear'
}

export class GateSelector extends ButtonSelector<SelectedGate> {

  constructor(p: HTMLElement, onClick: OnClickCallback) {

    super(p, onClick, [
      {
        key: SelectedGate.X,
        value: SelectedGate.X
      },
      {
        key: SelectedGate.Y,
        value: SelectedGate.Y
      },
      {
        key: SelectedGate.Z,
        value: SelectedGate.Z
      },
      {
        key: SelectedGate.H,
        value: SelectedGate.H
      },
      {
        key: SelectedGate.Clear,
        value: SelectedGate.Clear
      }
    ]);
  }
}