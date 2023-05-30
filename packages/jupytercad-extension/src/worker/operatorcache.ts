import { TopoDS_Shape } from '@jupytercad/jupytercad-opencascade';

import { IJCadContent, Parts } from '../_interface/jcad';
import { hashCode } from './utils';
import { IDict } from '../types';

const SHAPE_CACHE = new Map<string, TopoDS_Shape>();

const PRIMITIVE_OPERATORS = [
  'Part::Box',
  'Part::Cylinder',
  'Part::Sphere',
  'Part::Cone',
  'Part::Torus'
] as const;
const BOOLEAN_OPERATORS = [
  'Part::Cut',
  'Part::MultiFuse',
  'Part::Extrusion',
  'Part::MultiCommon'
] as const;

const MISC_OPERATORS = ['BrepFile', 'Sketcher::SketchObject'] as const;

export function expand_operator(
  name: Parts | 'BrepFile',
  args: any,
  content: IJCadContent
): IDict {
  const expanded_args = {};
  if (PRIMITIVE_OPERATORS.includes(name as any)) {
    expanded_args[name] = args;
  } else if (BOOLEAN_OPERATORS.includes(name as any)) {
    switch (name as (typeof BOOLEAN_OPERATORS)[number]) {
      case 'Part::Cut': {
        const cutArgs = JSON.parse(JSON.stringify(args));
        const { Base, Tool } = cutArgs;
        const baseData = content.objects.filter(item => item.name === Base)[0];
        const toolData = content.objects.filter(item => item.name === Tool)[0];
        cutArgs.Base = expand_operator(
          baseData.shape!,
          baseData.parameters,
          content
        );
        cutArgs.Tool = expand_operator(
          toolData.shape!,
          toolData.parameters,
          content
        );
        expanded_args[name] = cutArgs;
        break;
      }
      case 'Part::Extrusion':
        break;
      case 'Part::MultiCommon':
        break;
      case 'Part::MultiFuse':
        break;
      default:
        break;
    }
  } else if (MISC_OPERATORS.includes(name as any)) {
    expanded_args[name] = args;
  } else {
    expanded_args[name] = args;
  }

  return expanded_args;
}

export function operatorCache<T>(
  name: Parts | 'BrepFile',
  ops: (args: T, content: IJCadContent) => TopoDS_Shape | undefined
) {
  return (args: T, content: IJCadContent): TopoDS_Shape | undefined => {
    const hash = `${hashCode(
      JSON.stringify(expand_operator(name, args, content))
    )}`;
    if (SHAPE_CACHE.has(hash)) {
      return SHAPE_CACHE.get(hash)!;
    } else {
      const shape = ops(args, content);
      if (shape) {
        SHAPE_CACHE.set(hash, shape);
      }
      return shape;
    }
  };
}
