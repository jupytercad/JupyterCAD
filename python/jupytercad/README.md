# JupyterCAD - A JupyterLab extension for collaborative 3D geometry modeling.

[![lite-badge]][lite] [![docs-badge]][docs]

[lite-badge]: https://jupyterlite.rtfd.io/en/latest/_static/badge.svg
[lite]: https://jupytercad.github.io/JupyterCAD/
[docs-badge]: https://readthedocs.org/projects/jupytergis/badge/?version=latest
[docs]: https://jupytercad.readthedocs.io/

JupyterCAD is a JupyterLab extension for 3D geometry modeling with collaborative editing support. It is designed to allow multiple people to work on the same file at the same time, and to facilitate discussion and collaboration around the 3D shapes being created.

JupyterCAD has support for FreeCAD files, which makes it easy to import and export models from FreeCAD. It also has a range of features for creating and manipulating 3D shapes, including a variety of primitives, transformations, and Boolean operations.

![jupytercad](https://raw.githubusercontent.com/jupytercad/JupyterCAD/refs/heads/main/docs/source/assets/jupytercad-screenshot.png#gh-dark-mode-only)
![jupytercad](https://raw.githubusercontent.com/jupytercad/JupyterCAD/refs/heads/main/docs/source/assets/jupytercad-light-ss.png#gh-light-mode-only)

## Requirements

- JupyterLab >= 4.0.0
- freecad (optional)

## Installation

You can install JupyterCAD using conda/mamba (this installs freecad automatically):

```bash
mamba install -c conda-forge jupytercad
```

Or using pip:

```bash
pip install jupytercad
```

Once you have installed the extension, you should be able to open the CAD viewer in JupyterLab and create 3D shapes!

Additionally, you can install `jupytercad-freecad` and edit `.FCStd` files in JupyterLab.

## Documentation

Check out the JupyterCAD documentation on ReadTheDocs! https://jupytercad.readthedocs.io

## Contributing

JupyterCAD is an open-source project, and contributions are always welcome. If you would like to contribute to JupyterCAD, please fork the repository and submit a pull request.

See [CONTRIBUTING](https://github.com/jupytercad/JupyterCAD/blob/main/CONTRIBUTING.md) for dev installation instructions.

## License

JupyterCAD is licensed under the BSD 3-Clause License. See the LICENSE file for more information.
