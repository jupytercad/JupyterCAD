import { JupyterFrontEnd, LabShell } from '@jupyterlab/application';

export type IShell = Shell;

/**
 * The application shell.
 */

export class Shell extends LabShell implements JupyterFrontEnd.IShell {}
