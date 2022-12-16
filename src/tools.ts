import { LabIcon } from '@jupyterlab/ui-components';

const jvControlLight =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><g class="jp-icon3" fill="#616161"><g><path d="M2,6c0.55,0,1-0.45,1-1V4c0-0.55,0.45-1,1-1h1c0.55,0,1-0.45,1-1S5.55,1,5,1H4C2.34,1,1,2.34,1,4v1C1,5.55,1.45,6,2,6z"/><path d="M5,21H4c-0.55,0-1-0.45-1-1v-1c0-0.55-0.45-1-1-1c-0.55,0-1,0.45-1,1v1c0,1.66,1.34,3,3,3h1c0.55,0,1-0.45,1-1 S5.55,21,5,21z"/><path d="M20,1h-1c-0.55,0-1,0.45-1,1s0.45,1,1,1h1c0.55,0,1,0.45,1,1v1c0,0.55,0.45,1,1,1c0.55,0,1-0.45,1-1V4 C23,2.34,21.66,1,20,1z"/><path d="M22,18c-0.55,0-1,0.45-1,1v1c0,0.55-0.45,1-1,1h-1c-0.55,0-1,0.45-1,1s0.45,1,1,1h1c1.66,0,3-1.34,3-3v-1 C23,18.45,22.55,18,22,18z"/><path d="M19,14.87V9.13c0-0.72-0.38-1.38-1-1.73l-5-2.88c-0.31-0.18-0.65-0.27-1-0.27s-0.69,0.09-1,0.27L6,7.39 C5.38,7.75,5,8.41,5,9.13v5.74c0,0.72,0.38,1.38,1,1.73l5,2.88c0.31,0.18,0.65,0.27,1,0.27s0.69-0.09,1-0.27l5-2.88 C18.62,16.25,19,15.59,19,14.87z M11,17.17l-4-2.3v-4.63l4,2.33V17.17z M12,10.84L8.04,8.53L12,6.25l3.96,2.28L12,10.84z M17,14.87l-4,2.3v-4.6l4-2.33V14.87z"/></g></g></svg>';

export const jcLightIcon = new LabIcon({
  name: 'jupytercad:control-light',
  svgstr: jvControlLight
});

export const debounce = (
  func: CallableFunction,
  timeout = 100
): CallableFunction => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};

export function itemFromName<T extends { name: string }>(
  name: string,
  arr: T[]
): T | undefined {
  for (const it of arr) {
    if (it.name === name) {
      return it;
    }
  }
  return undefined;
}

export function focusInputField(
  filePath?: string,
  fieldId?: string | null,
  value?: any,
  color?: string,
  lastSelectedPropFieldId?: string
): string | undefined {
  const propsToRemove = ['border-color', 'box-shadow'];
  let newSelected: string | undefined;
  if (!fieldId) {
    if (lastSelectedPropFieldId) {
      removeStyleFromProperty(filePath, lastSelectedPropFieldId, propsToRemove);
      if (value) {
        const el = getElementFromProperty(filePath, lastSelectedPropFieldId);
        if (el?.tagName?.toLowerCase() === 'input') {
          (el as HTMLInputElement).value = value;
        }
      }
      newSelected = undefined;
    }
  } else {
    if (fieldId !== lastSelectedPropFieldId) {
      removeStyleFromProperty(filePath, lastSelectedPropFieldId, propsToRemove);

      const el = getElementFromProperty(filePath, fieldId);
      if (el) {
        el.style.borderColor = color ?? 'red';
        el.style.boxShadow = `inset 0 0 4px ${color ?? 'red'}`;
      }
      newSelected = fieldId;
    }
  }
  return newSelected;
}

export function getElementFromProperty(
  filePath?: string | null,
  prop?: string | null
): HTMLElement | undefined | null {
  if (!filePath || !prop) {
    return;
  }
  const parent = document.querySelector(`[data-path="${filePath}"]`);

  if (parent) {
    const el = parent.querySelector(`[id$=${prop}]`);
    return el as HTMLElement;
  }
}

export function removeStyleFromProperty(
  filePath: string | null | undefined,
  prop: string | null | undefined,
  properties: string[]
): void {
  if (!filePath || !prop || properties.length === 0) {
    return;
  }
  const el = getElementFromProperty(filePath, prop);
  if (el) {
    properties.forEach(prop => el.style.removeProperty(prop));
  }
}
