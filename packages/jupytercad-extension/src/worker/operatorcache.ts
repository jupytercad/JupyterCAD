import { TopoDS_Shape } from '@jupytercad/jupytercad-opencascade';

import { IJCadContent, Parts } from '../_interface/jcad';
import { IDict } from '../types';
import { hashCode } from './utils';

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
        const expandedArgs = JSON.parse(JSON.stringify(args));
        const { Base, Tool } = expandedArgs;
        const baseData = content.objects.filter(item => item.name === Base);
        const toolData = content.objects.filter(item => item.name === Tool);
        if (baseData.length > 0) {
          expandedArgs.Base = expand_operator(
            baseData[0].shape!,
            baseData[0].parameters,
            content
          );
        }
        if (toolData.length > 0) {
          expandedArgs.Tool = expand_operator(
            toolData[0].shape!,
            toolData[0].parameters,
            content
          );
        }
        expanded_args[name] = expandedArgs;
        break;
      }
      case 'Part::Extrusion': {
        const expandedArgs = JSON.parse(JSON.stringify(args));
        const { Base } = expandedArgs;
        const baseData = content.objects.filter(item => item.name === Base);

        if (baseData.length > 0) {
          expandedArgs.Base = expand_operator(
            baseData[0].shape!,
            baseData[0].parameters,
            content
          );
        }
        expanded_args[name] = expandedArgs;
        break;
      }
      case 'Part::MultiCommon':
      case 'Part::MultiFuse': {
        const expandedArgs = JSON.parse(JSON.stringify(args));
        const { Shapes } = expandedArgs;
        const newShapes: IDict[] = [];
        Shapes.forEach(element => {
          const elementData = content.objects.filter(
            item => item.name === element
          );
          if (elementData.length > 0) {
            newShapes.push(
              expand_operator(
                elementData[0].shape!,
                elementData[0].parameters,
                content
              )
            );
          }
        });
        expandedArgs.Shapes = newShapes;
        expanded_args[name] = expandedArgs;
        break;
      }
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
    const expandedArgs = expand_operator(name, args, content);
    const hash = `${hashCode(JSON.stringify(expandedArgs))}`;
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
