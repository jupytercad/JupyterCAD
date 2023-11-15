import jcadPlugin from './jcadplugin/plugins';
import {
  annotationPlugin,
  trackerPlugin,
  workerRegistryPlugin
} from './plugin';

export * from './workerregistry';
export * from './factory';
export default [
  trackerPlugin,
  annotationPlugin,
  workerRegistryPlugin,
  jcadPlugin
];
