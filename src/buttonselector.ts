export type Options<T> = { key: T, value: string}[];
export type OnClickCallback = (option: string) => void;

function createHTML<T>(keyValues: {key: T, value: string}[]) {
  let result = '';
  for (let i = 0; i < keyValues.length; i++) {
    const key = keyValues[i].key;
    const value = keyValues[i].value;
    result += `<button name="${key}">${value}</button>`;
  }
  return result;
}

export class ButtonSelector<T> {

  private parent: HTMLElement;

  constructor(p: HTMLElement, onClick: OnClickCallback, options: Options<T>) {

    this.parent = p;
    const gateSelectorContainer = document.createElement('div');
    gateSelectorContainer.innerHTML = createHTML(options);

    gateSelectorContainer.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => onClick(button.name));
    });

    this.parent.appendChild(gateSelectorContainer);
  }
}