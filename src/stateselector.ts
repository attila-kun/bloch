import { ButtonSelector, OnClickCallback } from './buttonselector';

export enum SelectedState {
  state0 = 'state0',
  state1 = 'state1',
  statePlus = 'statePlus',
  stateMinus = 'stateMinus',
}

export class StateSelector extends ButtonSelector<SelectedState> {

  constructor(p: HTMLElement, onClick: OnClickCallback) {

    super(p, onClick, [
      {
        key: SelectedState.state0,
        value: '|0>'
      },
      {
        key: SelectedState.state1,
        value: '|1>'
      },
      {
        key: SelectedState.statePlus,
        value: '|+>'
      },
      {
        key: SelectedState.stateMinus,
        value: '|->'
      }
    ]);
  }
}