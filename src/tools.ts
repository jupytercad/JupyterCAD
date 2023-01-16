import { LabIcon } from '@jupyterlab/ui-components';

import jvControlLight from '../style/icon/jvcontrol.svg';
import minimizeIConStr from '../style/icon/minimize.svg';

export const jcLightIcon = new LabIcon({
  name: 'jupytercad:control-light',
  svgstr: jvControlLight
});

export const minimizeIcon = new LabIcon({
  name: 'jupytercad:minimize-icon',
  svgstr: minimizeIConStr
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

export function nearest(n: number, tol: number): number {
  const round = Math.round(n);
  if (Math.abs(round - n) < tol) {
    return round;
  } else {
    return n;
  }
}
