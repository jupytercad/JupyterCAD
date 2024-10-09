# JupyterCAD Changelog

## 1.0.0 - Highlights

Below are the major highlights in `JupyterCAD` 1.0.0

### New packaging system

From 1.0.0, `JupyterCAD` is split into multiple python and javascript packages, this makes deploying and extending `JupyterCAD` easier.

- New python packages:
  - `jupytercad-core`: package contains core plugins for worker registry, jcad file support, document tracker, and annotation
  - `jupytercad-lab`: package contains plugins for lab interface and notebook support
  - `jupytercad-app`: the standalone `JupyterCAD` application
- New js packages:
  - `@jupytercad/schema`: package contains the schema of the JCAD file and related models/interfaces
  - `@jupytercad/opencascade`: the custom opencascade.js build for `JupyterCAD`
  - `@jupytercad/occ-worker`: the opencascade worker of `JupyterCAD`.
  - `@jupytercad/base`: package contains the UI components.

The current `jupytercad` PYPI package is still available, but it has become a meta-package to facilitate the installation of the application. Users can continue to install `JupyterCAD` with

```bash
pip install jupytercad
```

### New extension system

`JupyterCAD` now provides multiple tokens to allow extending its features by using the `JupyterLab` extension system. Users can register new file formats, register new operators, or add more post-processing capabilities to the application.

By using the new system, `FreeCAD` file format is supported through [an extension of `JupyterCAD`](https://github.com/jupytercad/jupytercad-freecad), users can install it with

```bash
pip install jupytercad-freecad
```

### New supported file format

`JupyterCAD` now can render the geometries of a STEP file. More improvement in the interoperability of the STEP file will be added in future versions.

<!-- <START NEW CHANGELOG ENTRY> -->

## 3.0.0a3

([Full Changelog](https://github.com/jupytercad/JupyterCAD/compare/@jupytercad/base@3.0.0-alpha.2...36bff8b5e9a8534c073008fea5ce1e61dfd5ee94))

### Enhancements made

- Add icons in filebrowser [#460](https://github.com/jupytercad/JupyterCAD/pull/460) ([@martinRenou](https://github.com/martinRenou))
- Reactive toolbar w.r.t. width [#455](https://github.com/jupytercad/JupyterCAD/pull/455) ([@arjxn-py](https://github.com/arjxn-py))
- Improve the UX of the clip-plane and wireframe buttons [#441](https://github.com/jupytercad/JupyterCAD/pull/441) ([@arjxn-py](https://github.com/arjxn-py))
- Add interactive axes helper [#440](https://github.com/jupytercad/JupyterCAD/pull/440) ([@arjxn-py](https://github.com/arjxn-py))
- Include Notebook API into lite kernel deployment [#364](https://github.com/jupytercad/JupyterCAD/pull/364) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Toggle buttons working correctly when multiple editors are open [#447](https://github.com/jupytercad/JupyterCAD/pull/447) ([@arjxn-py](https://github.com/arjxn-py))
- Update example for colors [#437](https://github.com/jupytercad/JupyterCAD/pull/437) ([@arjxn-py](https://github.com/arjxn-py))
- Fix lite build [#436](https://github.com/jupytercad/JupyterCAD/pull/436) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Reduce field of view of Camera [#465](https://github.com/jupytercad/JupyterCAD/pull/465) ([@arjxn-py](https://github.com/arjxn-py))
- Rename launcher button [#461](https://github.com/jupytercad/JupyterCAD/pull/461) ([@martinRenou](https://github.com/martinRenou))
- Try fixing galata workflow [#439](https://github.com/jupytercad/JupyterCAD/pull/439) ([@arjxn-py](https://github.com/arjxn-py))
- Lite deployment missing deps [#434](https://github.com/jupytercad/JupyterCAD/pull/434) ([@martinRenou](https://github.com/martinRenou))
- Lite deployment: Disable docprovider-extension [#433](https://github.com/jupytercad/JupyterCAD/pull/433) ([@martinRenou](https://github.com/martinRenou))
- Update `ThreeJS` [#418](https://github.com/jupytercad/JupyterCAD/pull/418) ([@arjxn-py](https://github.com/arjxn-py))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/JupyterCAD/graphs/contributors?from=2024-09-19&to=2024-10-09&type=c))

[@arjxn-py](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Aarjxn-py+updated%3A2024-09-19..2024-10-09&type=Issues) | [@github-actions](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Agithub-actions+updated%3A2024-09-19..2024-10-09&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3AmartinRenou+updated%3A2024-09-19..2024-10-09&type=Issues) | [@pre-commit-ci](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Apre-commit-ci+updated%3A2024-09-19..2024-10-09&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Atrungleduc+updated%3A2024-09-19..2024-10-09&type=Issues)

<!-- <END NEW CHANGELOG ENTRY> -->

## 3.0.0a2

([Full Changelog](https://github.com/jupytercad/JupyterCAD/compare/v3.0.0a1...e5acfcf87321b8f14a5c18b208e77ad45388dd3c))

### Enhancements made

- Add jcad icon in the launcher [#428](https://github.com/jupytercad/JupyterCAD/pull/428) ([@martinRenou](https://github.com/martinRenou))
- Use SharedModelFactory to create shared model [#425](https://github.com/jupytercad/JupyterCAD/pull/425) ([@davidbrochart](https://github.com/davidbrochart))

### Bugs fixed

- Fix python api [#422](https://github.com/jupytercad/JupyterCAD/pull/422) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

- Add link to playwright report in PR [#430](https://github.com/jupytercad/JupyterCAD/pull/430) ([@trungleduc](https://github.com/trungleduc))
- Bump jupyter-collaboration v3 [#429](https://github.com/jupytercad/JupyterCAD/pull/429) ([@davidbrochart](https://github.com/davidbrochart))
- Fix metadata [#424](https://github.com/jupytercad/JupyterCAD/pull/424) ([@davidbrochart](https://github.com/davidbrochart))

### Documentation improvements

- Remove non-relevant steps [#421](https://github.com/jupytercad/JupyterCAD/pull/421) ([@arjxn-py](https://github.com/arjxn-py))

### Other merged PRs

- Correct artifact output [#432](https://github.com/jupytercad/JupyterCAD/pull/432) ([@trungleduc](https://github.com/trungleduc))
- Save artifact data on failure [#431](https://github.com/jupytercad/JupyterCAD/pull/431) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/JupyterCAD/graphs/contributors?from=2024-09-16&to=2024-09-19&type=c))

[@arjxn-py](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Aarjxn-py+updated%3A2024-09-16..2024-09-19&type=Issues) | [@davidbrochart](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Adavidbrochart+updated%3A2024-09-16..2024-09-19&type=Issues) | [@github-actions](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Agithub-actions+updated%3A2024-09-16..2024-09-19&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3AmartinRenou+updated%3A2024-09-16..2024-09-19&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Atrungleduc+updated%3A2024-09-16..2024-09-19&type=Issues)

## 3.0.0a1

([Full Changelog](https://github.com/jupytercad/JupyterCAD/compare/@jupytercad/base@3.0.0-alpha.0...c1011c6a1d4e731956f30e5085ae6b7bd46d6a0e))

### Maintenance and upkeep improvements

- Fix dependencies pinning [#420](https://github.com/jupytercad/JupyterCAD/pull/420) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/JupyterCAD/graphs/contributors?from=2024-09-16&to=2024-09-16&type=c))

[@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3AmartinRenou+updated%3A2024-09-16..2024-09-16&type=Issues)

## 3.0.0a0

([Full Changelog](https://github.com/jupytercad/JupyterCAD/compare/@jupytercad/base@2.0.2...482f0cfc16b3ec459ee880c3fd21dc07f5f17e1b))

### Enhancements made

- Remove unneeded jupytercad_lab dependencies [#417](https://github.com/jupytercad/JupyterCAD/pull/417) ([@martinRenou](https://github.com/martinRenou))
- Smart color handling for edges based upon mesh luminance [#412](https://github.com/jupytercad/JupyterCAD/pull/412) ([@arjxn-py](https://github.com/arjxn-py))
- Add Color Customization for JupyterCAD Models [#397](https://github.com/jupytercad/JupyterCAD/pull/397) ([@arjxn-py](https://github.com/arjxn-py))
- Enable Damping for Smoother Model Movement [#395](https://github.com/jupytercad/JupyterCAD/pull/395) ([@arjxn-py](https://github.com/arjxn-py))
- Add python console to 3D view [#392](https://github.com/jupytercad/JupyterCAD/pull/392) ([@trungleduc](https://github.com/trungleduc))
- Enable Toggling Wireframe View [#390](https://github.com/jupytercad/JupyterCAD/pull/390) ([@arjxn-py](https://github.com/arjxn-py))
- Position & Axis inputs in a row [#389](https://github.com/jupytercad/JupyterCAD/pull/389) ([@arjxn-py](https://github.com/arjxn-py))
- Delete Object Keyboard Shortcut [#388](https://github.com/jupytercad/JupyterCAD/pull/388) ([@arjxn-py](https://github.com/arjxn-py))
- Improve shape metadata update logic [#385](https://github.com/jupytercad/JupyterCAD/pull/385) ([@trungleduc](https://github.com/trungleduc))
- Implement `Undo` & `Redo` keyboard shortcuts [#382](https://github.com/jupytercad/JupyterCAD/pull/382) ([@arjxn-py](https://github.com/arjxn-py))

### Bugs fixed

- Fix jupyterlite deployment [#409](https://github.com/jupytercad/JupyterCAD/pull/409) ([@trungleduc](https://github.com/trungleduc))
- Little darker shade of color for edges [#408](https://github.com/jupytercad/JupyterCAD/pull/408) ([@arjxn-py](https://github.com/arjxn-py))
- Replace toggle wireframe button to the right [#405](https://github.com/jupytercad/JupyterCAD/pull/405) ([@arjxn-py](https://github.com/arjxn-py))
- Fix python console in the standalone app [#402](https://github.com/jupytercad/JupyterCAD/pull/402) ([@trungleduc](https://github.com/trungleduc))
- Delete parent object if edge is selected with `[Delete]` key binding [#393](https://github.com/jupytercad/JupyterCAD/pull/393) ([@arjxn-py](https://github.com/arjxn-py))

### Maintenance and upkeep improvements

- Try fixing the upload of Github pages [#416](https://github.com/jupytercad/JupyterCAD/pull/416) ([@martinRenou](https://github.com/martinRenou))
- Exclude node_modules from sdists [#415](https://github.com/jupytercad/JupyterCAD/pull/415) ([@martinRenou](https://github.com/martinRenou))
- Update yjs-widgets dependency + make it shared [#414](https://github.com/jupytercad/JupyterCAD/pull/414) ([@martinRenou](https://github.com/martinRenou))
- Remove the guidata option [#413](https://github.com/jupytercad/JupyterCAD/pull/413) ([@arjxn-py](https://github.com/arjxn-py))
- Save jupyterlite build artifact [#404](https://github.com/jupytercad/JupyterCAD/pull/404) ([@trungleduc](https://github.com/trungleduc))
- Preview PR using appsharing.space [#403](https://github.com/jupytercad/JupyterCAD/pull/403) ([@trungleduc](https://github.com/trungleduc))
- Try fixing bot to update snapshots [#401](https://github.com/jupytercad/JupyterCAD/pull/401) ([@arjxn-py](https://github.com/arjxn-py))
- Fix bot to update snapshots [#400](https://github.com/jupytercad/JupyterCAD/pull/400) ([@arjxn-py](https://github.com/arjxn-py))
- Fix bot behaviour to update snapshots [#398](https://github.com/jupytercad/JupyterCAD/pull/398) ([@arjxn-py](https://github.com/arjxn-py))
- Bump ypywidgets v0.9 [#387](https://github.com/jupytercad/JupyterCAD/pull/387) ([@davidbrochart](https://github.com/davidbrochart))
- #78 Re-enable `jupyterlab.browser_check` [#386](https://github.com/jupytercad/JupyterCAD/pull/386) ([@arjxn-py](https://github.com/arjxn-py))
- Fix code format [#383](https://github.com/jupytercad/JupyterCAD/pull/383) ([@trungleduc](https://github.com/trungleduc))

### Documentation improvements

- Contributing Guide in `.rst` [#381](https://github.com/jupytercad/JupyterCAD/pull/381) ([@arjxn-py](https://github.com/arjxn-py))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/JupyterCAD/graphs/contributors?from=2024-07-19&to=2024-09-16&type=c))

[@arjxn-py](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Aarjxn-py+updated%3A2024-07-19..2024-09-16&type=Issues) | [@davidbrochart](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Adavidbrochart+updated%3A2024-07-19..2024-09-16&type=Issues) | [@github-actions](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Agithub-actions+updated%3A2024-07-19..2024-09-16&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3AmartinRenou+updated%3A2024-07-19..2024-09-16&type=Issues) | [@pre-commit-ci](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Apre-commit-ci+updated%3A2024-07-19..2024-09-16&type=Issues) | [@SylvainCorlay](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3ASylvainCorlay+updated%3A2024-07-19..2024-09-16&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Atrungleduc+updated%3A2024-07-19..2024-09-16&type=Issues)

## 2.0.2

([Full Changelog](https://github.com/jupytercad/JupyterCAD/compare/@jupytercad/base@2.0.1...6cc089370159836d407abf9a797f2f119b076768))

### Bugs fixed

- Pin reacttrs [#380](https://github.com/jupytercad/JupyterCAD/pull/380) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Update Contributing Guide for Development Installation [#379](https://github.com/jupytercad/JupyterCAD/pull/379) ([@arjxn-py](https://github.com/arjxn-py))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/JupyterCAD/graphs/contributors?from=2024-07-04&to=2024-07-19&type=c))

[@arjxn-py](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Aarjxn-py+updated%3A2024-07-04..2024-07-19&type=Issues) | [@github-actions](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Agithub-actions+updated%3A2024-07-04..2024-07-19&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3AmartinRenou+updated%3A2024-07-04..2024-07-19&type=Issues)

## 2.0.1

([Full Changelog](https://github.com/jupytercad/JupyterCAD/compare/@jupytercad/base@2.0.0...a115397ef4a459379e19fc7af4c3e5ac2bd2b142))

### Bugs fixed

- Fix rendering stl and step files [#377](https://github.com/jupytercad/JupyterCAD/pull/377) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/JupyterCAD/graphs/contributors?from=2024-07-01&to=2024-07-04&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Agithub-actions+updated%3A2024-07-01..2024-07-04&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Atrungleduc+updated%3A2024-07-01..2024-07-04&type=Issues)

## 2.0.0 Highlights

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v1.0.1...v2.0.0))

### Enhancements made

- Edge operators [#340](https://github.com/jupytercad/jupytercad/pull/340) ([@martinRenou](https://github.com/martinRenou))
- Implement clipping [#333](https://github.com/jupytercad/jupytercad/pull/333) ([@martinRenou](https://github.com/martinRenou))
- Support JupyterLite [#331](https://github.com/jupytercad/jupytercad/pull/331) ([@trungleduc](https://github.com/trungleduc))
- Support for opening STL files [#246](https://github.com/jupytercad/jupytercad/pull/246) ([@martinRenou](https://github.com/martinRenou))
- Step file export to .jcad [#238](https://github.com/jupytercad/jupytercad/pull/238) ([@martinRenou](https://github.com/martinRenou))
- Improve post-processing system [#350](https://github.com/jupytercad/jupytercad/pull/350) ([@trungleduc](https://github.com/trungleduc))
- Error handling [#349](https://github.com/jupytercad/jupytercad/pull/349) ([@martinRenou](https://github.com/martinRenou))
- Add constraints to form schema [#362](https://github.com/jupytercad/JupyterCAD/pull/362) ([@trungleduc](https://github.com/trungleduc))
- Generate dropdowns for operands on operator properties [#371](https://github.com/jupytercad/JupyterCAD/pull/371) ([@martinRenou](https://github.com/martinRenou))
- Improve deletion behavior [#369](https://github.com/jupytercad/JupyterCAD/pull/369) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Remove y-py [#329](https://github.com/jupytercad/jupytercad/pull/329) ([@trungleduc](https://github.com/trungleduc))
- Jupyter Collaboration v2 [#239](https://github.com/jupytercad/jupytercad/pull/239) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Fix build shape from brep string [#334](https://github.com/jupytercad/jupytercad/pull/334) ([@trungleduc](https://github.com/trungleduc))

## 2.0.0rc0

([Full Changelog](https://github.com/jupytercad/JupyterCAD/compare/v2.0.0a10...5de1ff5bd5c4d0a462aafa951098837399382092))

### Maintenance and upkeep improvements

- Sync jupytercad\_\* version [#375](https://github.com/jupytercad/JupyterCAD/pull/375) ([@trungleduc](https://github.com/trungleduc))
- Unpin ajv [#374](https://github.com/jupytercad/JupyterCAD/pull/374) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/JupyterCAD/graphs/contributors?from=2024-06-26&to=2024-06-27&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Agithub-actions+updated%3A2024-06-26..2024-06-27&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3AmartinRenou+updated%3A2024-06-26..2024-06-27&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Atrungleduc+updated%3A2024-06-26..2024-06-27&type=Issues)

## 2.0.0a10

([Full Changelog](https://github.com/jupytercad/JupyterCAD/compare/@jupytercad/base@2.0.0-alpha.9...0402dc772b5800a3e7b2b54c77e76f16bcf7205c))

### Enhancements made

- Generate dropdowns for operands on operator properties [#371](https://github.com/jupytercad/JupyterCAD/pull/371) ([@martinRenou](https://github.com/martinRenou))
- Improve deletion behavior [#369](https://github.com/jupytercad/JupyterCAD/pull/369) ([@martinRenou](https://github.com/martinRenou))
- Add constraints to form schema [#362](https://github.com/jupytercad/JupyterCAD/pull/362) ([@trungleduc](https://github.com/trungleduc))

### Bugs fixed

- Workaround extruction non-solid issue [#373](https://github.com/jupytercad/JupyterCAD/pull/373) ([@martinRenou](https://github.com/martinRenou))
- Fix extrusion form defaults [#368](https://github.com/jupytercad/JupyterCAD/pull/368) ([@martinRenou](https://github.com/martinRenou))
- Fix dry-run logic so that it does not run on the first load of the file [#366](https://github.com/jupytercad/JupyterCAD/pull/366) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Update github URL [#365](https://github.com/jupytercad/JupyterCAD/pull/365) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/JupyterCAD/graphs/contributors?from=2024-06-04&to=2024-06-26&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Agithub-actions+updated%3A2024-06-04..2024-06-26&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3AmartinRenou+updated%3A2024-06-04..2024-06-26&type=Issues) | [@SylvainCorlay](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3ASylvainCorlay+updated%3A2024-06-04..2024-06-26&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2FJupyterCAD+involves%3Atrungleduc+updated%3A2024-06-04..2024-06-26&type=Issues)

## 2.0.0a9

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v2.0.0a8...e12e7e647069f7b65b18e8c609aff31182984f87))

### Enhancements made

- Error handling [#349](https://github.com/jupytercad/jupytercad/pull/349) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Notebook API: Fix remove method [#359](https://github.com/jupytercad/jupytercad/pull/359) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Pin ajv [#360](https://github.com/jupytercad/jupytercad/pull/360) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-05-07&to=2024-06-04&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-05-07..2024-06-04&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2024-05-07..2024-06-04&type=Issues) | [@pre-commit-ci](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Apre-commit-ci+updated%3A2024-05-07..2024-06-04&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2024-05-07..2024-06-04&type=Issues)

## 2.0.0a8

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v2.0.0a7...2fbd72a5a55b0e69aa43de28dd4bf2f084c9884d))

### Enhancements made

- Update jcad exporting mechanism [#355](https://github.com/jupytercad/jupytercad/pull/355) ([@trungleduc](https://github.com/trungleduc))

### Bugs fixed

- Fix wrong emitter id of select object action [#354](https://github.com/jupytercad/jupytercad/pull/354) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-04-29&to=2024-05-07&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-04-29..2024-05-07&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2024-04-29..2024-05-07&type=Issues)

## 2.0.0a7

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v2.0.0a6...d69c62bdc0896fca158bb3e3fbc49231ab000e31))

### Enhancements made

- Update 3D rendering logic [#353](https://github.com/jupytercad/jupytercad/pull/353) ([@trungleduc](https://github.com/trungleduc))

### Bugs fixed

- Update 3D rendering logic [#353](https://github.com/jupytercad/jupytercad/pull/353) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-04-19&to=2024-04-29&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-04-19..2024-04-29&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2024-04-19..2024-04-29&type=Issues)

## 2.0.0a6

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v2.0.0a5...89eeabcd538f1d1fc8c95ee8e3f1971ac3ac5e73))

### Bugs fixed

- Add await for postShape before sending [#351](https://github.com/jupytercad/jupytercad/pull/351) ([@gjmooney](https://github.com/gjmooney))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-04-18&to=2024-04-19&type=c))

[@gjmooney](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agjmooney+updated%3A2024-04-18..2024-04-19&type=Issues)

## 2.0.0a5

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v2.0.0a4...c7f4cadccc2ff586d874906ff968652c12ca971e))

### Enhancements made

- Improve post-processing system [#350](https://github.com/jupytercad/jupytercad/pull/350) ([@trungleduc](https://github.com/trungleduc))
- Wider edge operators support [#348](https://github.com/jupytercad/jupytercad/pull/348) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-04-10&to=2024-04-18&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-04-10..2024-04-18&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2024-04-10..2024-04-18&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2024-04-10..2024-04-18&type=Issues)

## 2.0.0a4

No merged PRs

## 2.0.0a3

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v2.0.0a2...b7f3443d2215c3d15a6b6a36f9513612819efd0c))

### Enhancements made

- Add chamfer and fillet icons [#342](https://github.com/jupytercad/jupytercad/pull/342) ([@IsabelParedes](https://github.com/IsabelParedes))
- Edge operators [#340](https://github.com/jupytercad/jupytercad/pull/340) ([@martinRenou](https://github.com/martinRenou))
- Implement clipping [#333](https://github.com/jupytercad/jupytercad/pull/333) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Update svg files [#338](https://github.com/jupytercad/jupytercad/pull/338) ([@trungleduc](https://github.com/trungleduc))
- Fix build shape from brep string [#334](https://github.com/jupytercad/jupytercad/pull/334) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

- Visual regression tests: Increase cell execution timeout [#347](https://github.com/jupytercad/jupytercad/pull/347) ([@trungleduc](https://github.com/trungleduc))
- Refactor 3D view [#341](https://github.com/jupytercad/jupytercad/pull/341) ([@trungleduc](https://github.com/trungleduc))
- Close warning before starting the UI test [#336](https://github.com/jupytercad/jupytercad/pull/336) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-03-06&to=2024-04-10&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-03-06..2024-04-10&type=Issues) | [@IsabelParedes](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AIsabelParedes+updated%3A2024-03-06..2024-04-10&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2024-03-06..2024-04-10&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2024-03-06..2024-04-10&type=Issues)

## 2.0.0a2

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v2.0.0a1...5151f6d7bbb1a89ecf197c1587a4e4ce2c54c091))

### Enhancements made

- Update JupyterLite config [#332](https://github.com/jupytercad/jupytercad/pull/332) ([@trungleduc](https://github.com/trungleduc))
- Support JupyterLite [#331](https://github.com/jupytercad/jupytercad/pull/331) ([@trungleduc](https://github.com/trungleduc))
- Update occ API [#330](https://github.com/jupytercad/jupytercad/pull/330) ([@trungleduc](https://github.com/trungleduc))
- Support for opening STL files [#246](https://github.com/jupytercad/jupytercad/pull/246) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Remove y-py [#329](https://github.com/jupytercad/jupytercad/pull/329) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-02-27&to=2024-03-06&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-02-27..2024-03-06&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2024-02-27..2024-03-06&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2024-02-27..2024-03-06&type=Issues)

## 2.0.0a1

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v2.0.0a0...349e04f56a58bc2ec6263180bd287f063d4019e5))

### Enhancements made

- Step file export to .jcad [#238](https://github.com/jupytercad/jupytercad/pull/238) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Unpin jupyterlab in ui-tests [#251](https://github.com/jupytercad/jupytercad/pull/251) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-02-08&to=2024-02-27&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-02-08..2024-02-27&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2024-02-08..2024-02-27&type=Issues) | [@pre-commit-ci](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Apre-commit-ci+updated%3A2024-02-08..2024-02-27&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2024-02-08..2024-02-27&type=Issues)

## 2.0.0a0

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v1.0.1...962f123a9b7cbdfa6c48e9572099dd5ae2998730))

### Maintenance and upkeep improvements

- Jupyter Collaboration v2 [#239](https://github.com/jupytercad/jupytercad/pull/239) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-02-08&to=2024-02-08&type=c))

[@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2024-02-08..2024-02-08&type=Issues)

## 1.0.1

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/@jupytercad/base@1.0.0...53bae1fd7621f80e42001cfcc831ea12ac86dc83))

### Bugs fixed

- Pin JupyterLab in publish release [#254](https://github.com/jupytercad/jupytercad/pull/254) ([@martinRenou](https://github.com/martinRenou))
- Expose CadDocument from jupytercad [#252](https://github.com/jupytercad/jupytercad/pull/252) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Missing util [#255](https://github.com/jupytercad/jupytercad/pull/255) ([@martinRenou](https://github.com/martinRenou))
- Fixing check-release workflow + Fix regression tests [#250](https://github.com/jupytercad/jupytercad/pull/250) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-01-12&to=2024-02-08&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-01-12..2024-02-08&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2024-01-12..2024-02-08&type=Issues)

## 1.0.0

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v1.0.0a4...13901c2592ff41f73c981f566305cbf5ad89332c))

### Enhancements made

- Don't show properties panel for readonly files [#245](https://github.com/jupytercad/jupytercad/pull/245) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Add changelog [#247](https://github.com/jupytercad/jupytercad/pull/247) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2024-01-03&to=2024-01-12&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2024-01-03..2024-01-12&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2024-01-03..2024-01-12&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2024-01-03..2024-01-12&type=Issues)

## 1.0.0a4

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v1.0.0a3...402f0a2f9daa4cd98ef6e1ff61ba511b4f9c7a95))

### Enhancements made

- Support loading STL binary format [#244](https://github.com/jupytercad/jupytercad/pull/244) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2023-12-20&to=2024-01-03&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-12-20..2024-01-03&type=Issues) | [@pre-commit-ci](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Apre-commit-ci+updated%3A2023-12-20..2024-01-03&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-12-20..2024-01-03&type=Issues)

## 1.0.0a3

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v1.0.0a2...be30ddf434ad65c7097702aa527ae90afb3cfa9d))

### Enhancements made

- Non-editable step file [#235](https://github.com/jupytercad/jupytercad/pull/235) ([@martinRenou](https://github.com/martinRenou))
- Update worker and 3D viewer [#230](https://github.com/jupytercad/jupytercad/pull/230) ([@trungleduc](https://github.com/trungleduc))

### Bugs fixed

- Fix object selection [#242](https://github.com/jupytercad/jupytercad/pull/242) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2023-12-13&to=2023-12-20&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-12-13..2023-12-20&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-12-13..2023-12-20&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-12-13..2023-12-20&type=Issues)

## 1.0.0a2

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v1.0.0a1...4aa1881ba41a3962b59ce73f996e9f20ad0c9235))

### Enhancements made

- STEP files support [#232](https://github.com/jupytercad/jupytercad/pull/232) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Galata bot: Missing hub command [#233](https://github.com/jupytercad/jupytercad/pull/233) ([@martinRenou](https://github.com/martinRenou))
- Fix missing dev dependency [#231](https://github.com/jupytercad/jupytercad/pull/231) ([@martinRenou](https://github.com/martinRenou))

### Other merged PRs

- Galata bot: Fix conda env [#234](https://github.com/jupytercad/jupytercad/pull/234) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2023-11-24&to=2023-12-13&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-11-24..2023-12-13&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-11-24..2023-12-13&type=Issues) | [@pre-commit-ci](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Apre-commit-ci+updated%3A2023-11-24..2023-12-13&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-11-24..2023-12-13&type=Issues)

## 1.0.0a1

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v1.0.0a0...68682824ecb6218681ff07b652d27492cad09a8d))

### Maintenance and upkeep improvements

- Rename packages [#228](https://github.com/jupytercad/jupytercad/pull/228) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2023-11-23&to=2023-11-24&type=c))

[@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-11-23..2023-11-24&type=Issues)

## 1.0.0a0

([Full Changelog](https://github.com/jupytercad/jupytercad/compare/v0.3.3...5e1b571bce595b1f2a995b2cce511f15fc71de8d))

### Enhancements made

- Organization rename [#225](https://github.com/jupytercad/jupytercad/pull/225) ([@martinRenou](https://github.com/martinRenou))
- Update OCC build [#221](https://github.com/jupytercad/jupytercad/pull/221) ([@martinRenou](https://github.com/martinRenou))
- Create jupytercad-\* packages [#220](https://github.com/jupytercad/jupytercad/pull/220) ([@trungleduc](https://github.com/trungleduc))

### Bugs fixed

- Pin pydantic (again) [#222](https://github.com/jupytercad/jupytercad/pull/222) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Update release script [#227](https://github.com/jupytercad/jupytercad/pull/227) ([@trungleduc](https://github.com/trungleduc))
- Fix CI [#226](https://github.com/jupytercad/jupytercad/pull/226) ([@trungleduc](https://github.com/trungleduc))
- Create jupytercad-\* packages [#220](https://github.com/jupytercad/jupytercad/pull/220) ([@trungleduc](https://github.com/trungleduc))
- Update links to repository [#219](https://github.com/jupytercad/jupytercad/pull/219) ([@martinRenou](https://github.com/martinRenou))
- Support pydantic 2 [#213](https://github.com/jupytercad/jupytercad/pull/213) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupytercad/jupytercad/graphs/contributors?from=2023-06-29&to=2023-11-23&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-06-29..2023-11-23&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-06-29..2023-11-23&type=Issues) | [@pre-commit-ci](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Apre-commit-ci+updated%3A2023-06-29..2023-11-23&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3Ajupytercad%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-06-29..2023-11-23&type=Issues)

## 0.3.3

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/@jupytercad/jupytercad-app@0.3.2...e461738f2333d5c4e86ae3fcedc226776f37cbcb))

### Enhancements made

- Allow changing camera settings [#204](https://github.com/QuantStack/jupytercad/pull/204) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Fix check release [#205](https://github.com/QuantStack/jupytercad/pull/205) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Add conda instructions [#202](https://github.com/QuantStack/jupytercad/pull/202) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-06-15&to=2023-06-29&type=c))

[@github-actions](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-06-15..2023-06-29&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-06-15..2023-06-29&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-06-15..2023-06-29&type=Issues)

## 0.3.2

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/@jupytercad/jupytercad-app@0.3.1...d9160970cc477eff9ec9657e4731d327aa8aaa5d))

### Bugs fixed

- Remove guidata when deleting an object [#201](https://github.com/QuantStack/jupytercad/pull/201) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-06-12&to=2023-06-15&type=c))

[@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-06-12..2023-06-15&type=Issues)

## 0.3.1

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/@jupytercad/jupytercad-app@0.3.0...d98fd4a56141ea6834411a15be20c9a7c5d3609c))

### Bugs fixed

- Add yjs-widgets to the shared scope [#199](https://github.com/QuantStack/jupytercad/pull/199) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-06-12&to=2023-06-12&type=c))

[@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-06-12..2023-06-12&type=Issues)

## 0.3.0

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/@jupytercad/jupytercad-app@0.2.3...6bed9412184621bcb457dc37c43772b23c386dd9))

### Enhancements made

- Add annotation and color API [#198](https://github.com/QuantStack/jupytercad/pull/198) ([@trungleduc](https://github.com/trungleduc))
- Update to latest ypywidgets [#194](https://github.com/QuantStack/jupytercad/pull/194) ([@martinRenou](https://github.com/martinRenou))
- Compute shape properties [#193](https://github.com/QuantStack/jupytercad/pull/193) ([@trungleduc](https://github.com/trungleduc))
- Add Jupyverse plugin [#179](https://github.com/QuantStack/jupytercad/pull/179) ([@davidbrochart](https://github.com/davidbrochart))

### Bugs fixed

- Fix fuse and intersection operator [#197](https://github.com/QuantStack/jupytercad/pull/197) ([@trungleduc](https://github.com/trungleduc))
- Hide FreeCAD import message [#187](https://github.com/QuantStack/jupytercad/pull/187) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

- Remove mock setting in Galata tests [#188](https://github.com/QuantStack/jupytercad/pull/188) ([@trungleduc](https://github.com/trungleduc))

### Documentation improvements

- Add docs link in the README [#190](https://github.com/QuantStack/jupytercad/pull/190) ([@martinRenou](https://github.com/martinRenou))
- Add some documentation [#169](https://github.com/QuantStack/jupytercad/pull/169) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-06-05&to=2023-06-12&type=c))

[@davidbrochart](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Adavidbrochart+updated%3A2023-06-05..2023-06-12&type=Issues) | [@github-actions](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-06-05..2023-06-12&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-06-05..2023-06-12&type=Issues) | [@pre-commit-ci](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Apre-commit-ci+updated%3A2023-06-05..2023-06-12&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-06-05..2023-06-12&type=Issues)

## 0.2.3

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/@jupytercad/jupytercad-app@0.2.2...a85d44387dbfefd8cd0a068d1d749a676cf5a82b))

### Bugs fixed

- Missing dependencies [#184](https://github.com/QuantStack/jupytercad/pull/184) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-06-03&to=2023-06-05&type=c))

[@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-06-03..2023-06-05&type=Issues)

## 0.2.2

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/v0.2.1...d2d79078ab974673b6fcadd4e5ef8f16abf5022a))

### Bugs fixed

- Update shared scope [#182](https://github.com/QuantStack/jupytercad/pull/182) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-06-03&to=2023-06-03&type=c))

[@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-06-03..2023-06-03&type=Issues)

## 0.2.1

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/v0.2.0...ec0b05cb38d16a1a8fc0a853a53328c4a05542dd))

### Bugs fixed

- Fix missing static files in cad app [#181](https://github.com/QuantStack/jupytercad/pull/181) ([@trungleduc](https://github.com/trungleduc))
- NPM Package version fix [#173](https://github.com/QuantStack/jupytercad/pull/173) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Simplify bump version script [#178](https://github.com/QuantStack/jupytercad/pull/178) ([@martinRenou](https://github.com/martinRenou))
- Fix file paths in Notebook.ipynb [#176](https://github.com/QuantStack/jupytercad/pull/176) ([@davidbrochart](https://github.com/davidbrochart))
- Add releaser action and pre-commit config [#172](https://github.com/QuantStack/jupytercad/pull/172) ([@trungleduc](https://github.com/trungleduc))

### Documentation improvements

- Add docstrings [#177](https://github.com/QuantStack/jupytercad/pull/177) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-06-02&to=2023-06-02&type=c))

[@davidbrochart](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Adavidbrochart+updated%3A2023-06-02..2023-06-02&type=Issues) | [@github-actions](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-06-02..2023-06-02&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-06-02..2023-06-02&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-06-02..2023-06-02&type=Issues)

## 0.2.0

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/@jupytercad/jupytercad-app@0.1.0...65c8ba939c9b1f86bf3dbd18f5d2eeb3fb67597e))

### Enhancements made

- Add backend installation check [#168](https://github.com/QuantStack/jupytercad/pull/168) ([@trungleduc](https://github.com/trungleduc))
- Improve cache mechanism [#164](https://github.com/QuantStack/jupytercad/pull/164) ([@trungleduc](https://github.com/trungleduc))
- Add shadow to annotation boxes [#163](https://github.com/QuantStack/jupytercad/pull/163) ([@trungleduc](https://github.com/trungleduc))
- Python API [#162](https://github.com/QuantStack/jupytercad/pull/162) ([@martinRenou](https://github.com/martinRenou))
- Remove shadowmapping [#159](https://github.com/QuantStack/jupytercad/pull/159) ([@martinRenou](https://github.com/martinRenou))
- Improve lighting [#158](https://github.com/QuantStack/jupytercad/pull/158) ([@trungleduc](https://github.com/trungleduc))
- Remove gradient background [#150](https://github.com/QuantStack/jupytercad/pull/150) ([@martinRenou](https://github.com/martinRenou))
- Multi selection [#145](https://github.com/QuantStack/jupytercad/pull/145) ([@martinRenou](https://github.com/martinRenou))
- Add top menu and launcher [#140](https://github.com/QuantStack/jupytercad/pull/140) ([@trungleduc](https://github.com/trungleduc))

### Bugs fixed

- Fixup visibility checking [#161](https://github.com/QuantStack/jupytercad/pull/161) ([@martinRenou](https://github.com/martinRenou))
- Fix Notebook API view [#160](https://github.com/QuantStack/jupytercad/pull/160) ([@martinRenou](https://github.com/martinRenou))
- Fix: prevent selecting invisible mesh [#155](https://github.com/QuantStack/jupytercad/pull/155) ([@martinRenou](https://github.com/martinRenou))
- Fix broken SVG [#153](https://github.com/QuantStack/jupytercad/pull/153) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Install python-occ core on galata bot [#167](https://github.com/QuantStack/jupytercad/pull/167) ([@martinRenou](https://github.com/martinRenou))
- Update jupyter_collaboration dependency [#166](https://github.com/QuantStack/jupytercad/pull/166) ([@martinRenou](https://github.com/martinRenou))
- Fix galata bot [#152](https://github.com/QuantStack/jupytercad/pull/152) ([@martinRenou](https://github.com/martinRenou))
- Install jupyter_collaboration on the Galata bot [#165](https://github.com/QuantStack/jupytercad/pull/165) ([@martinRenou](https://github.com/martinRenou))

### Documentation improvements

- Update screenshot [#156](https://github.com/QuantStack/jupytercad/pull/156) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-05-17&to=2023-06-02&type=c))

[@github-actions](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-05-17..2023-06-02&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-05-17..2023-06-02&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-05-17..2023-06-02&type=Issues)

## 0.1.0

No merged PRs

## 0.1.0rc0

No merged PRs

## 0.1.0b0

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/v0.1.0a2...6fee6db19323c0c8d48d6e3f0060a0de0029f5c9))

### Enhancements made

- Update to JupyterLab 4 [#147](https://github.com/QuantStack/jupytercad/pull/147) ([@martinRenou](https://github.com/martinRenou))
- Simplify annotations update [#146](https://github.com/QuantStack/jupytercad/pull/146) ([@martinRenou](https://github.com/martinRenou))
- Update annotations position on resize [#143](https://github.com/QuantStack/jupytercad/pull/143) ([@martinRenou](https://github.com/martinRenou))
- Default shape/operator names [#141](https://github.com/QuantStack/jupytercad/pull/141) ([@martinRenou](https://github.com/martinRenou))
- Lab app [#135](https://github.com/QuantStack/jupytercad/pull/135) ([@trungleduc](https://github.com/trungleduc))
- Toolbar refactor and styling [#129](https://github.com/QuantStack/jupytercad/pull/129) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Update annotations position on resize [#143](https://github.com/QuantStack/jupytercad/pull/143) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Update to JupyterLab 4 [#147](https://github.com/QuantStack/jupytercad/pull/147) ([@martinRenou](https://github.com/martinRenou))
- Create monorepo [#133](https://github.com/QuantStack/jupytercad/pull/133) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-04-26&to=2023-05-17&type=c))

[@github-actions](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-04-26..2023-05-17&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-04-26..2023-05-17&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-04-26..2023-05-17&type=Issues)

## 0.1.0a2

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/v0.1.0a1...2f7b81060a1adab614bb6df1284382b0a1a5a546))

### Enhancements made

- Hide source objects after executing operators [#117](https://github.com/QuantStack/jupytercad/pull/117) ([@trungleduc](https://github.com/trungleduc))
- Expose JupyterCad 3d view and APIs in notebook [#102](https://github.com/QuantStack/jupytercad/pull/102) ([@trungleduc](https://github.com/trungleduc))

### Maintenance and upkeep improvements

- Update to JupyterLab beta 2 [#130](https://github.com/QuantStack/jupytercad/pull/130) ([@trungleduc](https://github.com/trungleduc))
- Update to JupyterLab beta 0 [#119](https://github.com/QuantStack/jupytercad/pull/119) ([@martinRenou](https://github.com/martinRenou))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2023-03-09&to=2023-04-26&type=c))

[@github-actions](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Agithub-actions+updated%3A2023-03-09..2023-04-26&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2023-03-09..2023-04-26&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2023-03-09..2023-04-26&type=Issues)

## 0.1.0a1

([Full Changelog](https://github.com/QuantStack/jupytercad/compare/c58c7dd5a0ae9bcc010d24db38dbc9a2d68055c8...f7a0f6ba2b00a1661981ccbdda4166be9182d9fc))

### Enhancements made

- Exploded view [#109](https://github.com/QuantStack/jupytercad/pull/109) ([@martinRenou](https://github.com/martinRenou))
- Add launcher buttons [#108](https://github.com/QuantStack/jupytercad/pull/108) ([@hbcarlos](https://github.com/hbcarlos))
- Only compute the bounding box of the visible objects for the reflength [#105](https://github.com/QuantStack/jupytercad/pull/105) ([@martinRenou](https://github.com/martinRenou))
- Improve performance [#104](https://github.com/QuantStack/jupytercad/pull/104) ([@martinRenou](https://github.com/martinRenou))
- Add extrusion [#98](https://github.com/QuantStack/jupytercad/pull/98) ([@trungleduc](https://github.com/trungleduc))
- Toolbar for configuring the grid and axes [#94](https://github.com/QuantStack/jupytercad/pull/94) ([@hbcarlos](https://github.com/hbcarlos))
- FCstd color support [#91](https://github.com/QuantStack/jupytercad/pull/91) ([@martinRenou](https://github.com/martinRenou))
- Automatically remove annotations when they are empty [#86](https://github.com/QuantStack/jupytercad/pull/86) ([@martinRenou](https://github.com/martinRenou))
- Annotations: Change remove button to a close button [#84](https://github.com/QuantStack/jupytercad/pull/84) ([@martinRenou](https://github.com/martinRenou))
- Update build occ command [#80](https://github.com/QuantStack/jupytercad/pull/80) ([@trungleduc](https://github.com/trungleduc))
- 2D Editor [#76](https://github.com/QuantStack/jupytercad/pull/76) ([@trungleduc](https://github.com/trungleduc))
- Use theme for the annotation styling [#62](https://github.com/QuantStack/jupytercad/pull/62) ([@martinRenou](https://github.com/martinRenou))
- Take into account the current user for message displaying [#61](https://github.com/QuantStack/jupytercad/pull/61) ([@martinRenou](https://github.com/martinRenou))
- Support for undo/redo [#60](https://github.com/QuantStack/jupytercad/pull/60) ([@hbcarlos](https://github.com/hbcarlos))
- Decouple camera from remote user camera [#59](https://github.com/QuantStack/jupytercad/pull/59) ([@martinRenou](https://github.com/martinRenou))
- Automatically rebuild open cascade when needed [#56](https://github.com/QuantStack/jupytercad/pull/56) ([@martinRenou](https://github.com/martinRenou))
- Build OpenCascade when building the Worker [#54](https://github.com/QuantStack/jupytercad/pull/54) ([@martinRenou](https://github.com/martinRenou))
- Custom Open Cascade build [#40](https://github.com/QuantStack/jupytercad/pull/40) ([@martinRenou](https://github.com/martinRenou))
- Follow mode [#32](https://github.com/QuantStack/jupytercad/pull/32) ([@trungleduc](https://github.com/trungleduc))
- Display and sync pointers between clients [#29](https://github.com/QuantStack/jupytercad/pull/29) ([@martinRenou](https://github.com/martinRenou))
- Render unsupported shape types in read-only mode. [#28](https://github.com/QuantStack/jupytercad/pull/28) ([@trungleduc](https://github.com/trungleduc))
- Highlight differently the mesh that is hovered AND selected [#27](https://github.com/QuantStack/jupytercad/pull/27) ([@martinRenou](https://github.com/martinRenou))

### Bugs fixed

- Cleanup selection logic and throttle some events [#107](https://github.com/QuantStack/jupytercad/pull/107) ([@martinRenou](https://github.com/martinRenou))
- Fix bot for updating galata references [#106](https://github.com/QuantStack/jupytercad/pull/106) ([@martinRenou](https://github.com/martinRenou))
- Fixes selections [#103](https://github.com/QuantStack/jupytercad/pull/103) ([@hbcarlos](https://github.com/hbcarlos))
- Toolbar for configuring the grid and axes [#94](https://github.com/QuantStack/jupytercad/pull/94) ([@hbcarlos](https://github.com/hbcarlos))
- Remove malformed form button [#88](https://github.com/QuantStack/jupytercad/pull/88) ([@martinRenou](https://github.com/martinRenou))
- Do not reset the grid and axe when the scene is empty [#83](https://github.com/QuantStack/jupytercad/pull/83) ([@hbcarlos](https://github.com/hbcarlos))
- Hot fix occ build [#81](https://github.com/QuantStack/jupytercad/pull/81) ([@trungleduc](https://github.com/trungleduc))
- Fix intersection name [#57](https://github.com/QuantStack/jupytercad/pull/57) ([@martinRenou](https://github.com/martinRenou))
- Pointer color fix [#39](https://github.com/QuantStack/jupytercad/pull/39) ([@martinRenou](https://github.com/martinRenou))
- Fix minor pointer issues. [#30](https://github.com/QuantStack/jupytercad/pull/30) ([@trungleduc](https://github.com/trungleduc))
- Handle de-select when selecting a non-visible object [#26](https://github.com/QuantStack/jupytercad/pull/26) ([@martinRenou](https://github.com/martinRenou))

### Maintenance and upkeep improvements

- Remove `pip install -e .` step in the check release workflow [#116](https://github.com/QuantStack/jupytercad/pull/116) ([@jtpio](https://github.com/jtpio))
- Pin JupyterLab [#115](https://github.com/QuantStack/jupytercad/pull/115) ([@martinRenou](https://github.com/martinRenou))
- Prepare for release [#114](https://github.com/QuantStack/jupytercad/pull/114) ([@martinRenou](https://github.com/martinRenou))
- Pin JupyterLab [#113](https://github.com/QuantStack/jupytercad/pull/113) ([@martinRenou](https://github.com/martinRenou))
- Fix ci [#97](https://github.com/QuantStack/jupytercad/pull/97) ([@trungleduc](https://github.com/trungleduc))
- Add galata bot [#96](https://github.com/QuantStack/jupytercad/pull/96) ([@trungleduc](https://github.com/trungleduc))
- Uses hatch and update releaser [#90](https://github.com/QuantStack/jupytercad/pull/90) ([@hbcarlos](https://github.com/hbcarlos))
- Fix binder [#87](https://github.com/QuantStack/jupytercad/pull/87) ([@trungleduc](https://github.com/trungleduc))
- Introduce jupytercad-opencascade separate package [#85](https://github.com/QuantStack/jupytercad/pull/85) ([@martinRenou](https://github.com/martinRenou))
- Add UI tests [#73](https://github.com/QuantStack/jupytercad/pull/73) ([@trungleduc](https://github.com/trungleduc))

### Documentation improvements

- Update README [#112](https://github.com/QuantStack/jupytercad/pull/112) ([@martinRenou](https://github.com/martinRenou))
- Update readme [#111](https://github.com/QuantStack/jupytercad/pull/111) ([@trungleduc](https://github.com/trungleduc))

### Other merged PRs

- Fix CI [#77](https://github.com/QuantStack/jupytercad/pull/77) ([@trungleduc](https://github.com/trungleduc))
- Fixes objects tree view [#75](https://github.com/QuantStack/jupytercad/pull/75) ([@hbcarlos](https://github.com/hbcarlos))
- Annotations panel [#74](https://github.com/QuantStack/jupytercad/pull/74) ([@martinRenou](https://github.com/martinRenou))
- Fixes 51 [#72](https://github.com/QuantStack/jupytercad/pull/72) ([@hbcarlos](https://github.com/hbcarlos))
- Fixes iterable [#71](https://github.com/QuantStack/jupytercad/pull/71) ([@hbcarlos](https://github.com/hbcarlos))
- Types the API and hides Y data structures [#68](https://github.com/QuantStack/jupytercad/pull/68) ([@hbcarlos](https://github.com/hbcarlos))
- Migrate to @jupyter/ydoc and fix observe [#67](https://github.com/QuantStack/jupytercad/pull/67) ([@hbcarlos](https://github.com/hbcarlos))
- Remove "getCoordinate" from the Annotation Model [#65](https://github.com/QuantStack/jupytercad/pull/65) ([@martinRenou](https://github.com/martinRenou))
- Fix: reset state when unfollowing [#58](https://github.com/QuantStack/jupytercad/pull/58) ([@martinRenou](https://github.com/martinRenou))
- Add intersection operator [#55](https://github.com/QuantStack/jupytercad/pull/55) ([@davidbrochart](https://github.com/davidbrochart))
- Add fuse operator [#53](https://github.com/QuantStack/jupytercad/pull/53) ([@davidbrochart](https://github.com/davidbrochart))
- Prevent updating refLength on each remove/hide [#52](https://github.com/QuantStack/jupytercad/pull/52) ([@martinRenou](https://github.com/martinRenou))
- Put back logic for syncing pointers [#42](https://github.com/QuantStack/jupytercad/pull/42) ([@martinRenou](https://github.com/martinRenou))
- Fix missing FS and symbol [#41](https://github.com/QuantStack/jupytercad/pull/41) ([@martinRenou](https://github.com/martinRenou))
- Add annotation [#33](https://github.com/QuantStack/jupytercad/pull/33) ([@trungleduc](https://github.com/trungleduc))
- add conda-forge/label/jupyterlab_alpha for binder [#25](https://github.com/QuantStack/jupytercad/pull/25) ([@bollwyvl](https://github.com/bollwyvl))
- Mesh selection [#24](https://github.com/QuantStack/jupytercad/pull/24) ([@trungleduc](https://github.com/trungleduc))
- Update tree view [#23](https://github.com/QuantStack/jupytercad/pull/23) ([@trungleduc](https://github.com/trungleduc))
- Add `@jupyterlab/shared-models` to the `package.json` [#22](https://github.com/QuantStack/jupytercad/pull/22) ([@jtpio](https://github.com/jtpio))
- Revert "Use THREE.LineSegments instead of THREE.Line for edges" [#19](https://github.com/QuantStack/jupytercad/pull/19) ([@martinRenou](https://github.com/martinRenou))
- Use rjsf's JupyterLab theme [#18](https://github.com/QuantStack/jupytercad/pull/18) ([@martinRenou](https://github.com/martinRenou))
- Add Torus [#15](https://github.com/QuantStack/jupytercad/pull/15) ([@martinRenou](https://github.com/martinRenou))
- Add Sphere and Cone primitives [#14](https://github.com/QuantStack/jupytercad/pull/14) ([@martinRenou](https://github.com/martinRenou))
- Improve theme handling 3D view and tree view [#10](https://github.com/QuantStack/jupytercad/pull/10) ([@martinRenou](https://github.com/martinRenou))
- Use THREE.LineSegments instead of THREE.Line for edges [#9](https://github.com/QuantStack/jupytercad/pull/9) ([@martinRenou](https://github.com/martinRenou))
- Implement highlight on hover using a Color Picking technique [#8](https://github.com/QuantStack/jupytercad/pull/8) ([@martinRenou](https://github.com/martinRenou))
- Fix invisible logo for dark theme [#6](https://github.com/QuantStack/jupytercad/pull/6) ([@martinRenou](https://github.com/martinRenou))
- Support boolean operator [#5](https://github.com/QuantStack/jupytercad/pull/5) ([@trungleduc](https://github.com/trungleduc))
- Add support for FreeCAD native file format [#4](https://github.com/QuantStack/jupytercad/pull/4) ([@trungleduc](https://github.com/trungleduc))
- Add JCAD file [#3](https://github.com/QuantStack/jupytercad/pull/3) ([@trungleduc](https://github.com/trungleduc))
- Add shared model [#2](https://github.com/QuantStack/jupytercad/pull/2) ([@trungleduc](https://github.com/trungleduc))
- Add dark background and loading animation [#1](https://github.com/QuantStack/jupytercad/pull/1) ([@trungleduc](https://github.com/trungleduc))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/QuantStack/jupytercad/graphs/contributors?from=2021-11-24&to=2023-03-09&type=c))

[@bollwyvl](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Abollwyvl+updated%3A2021-11-24..2023-03-09&type=Issues) | [@davidbrochart](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Adavidbrochart+updated%3A2021-11-24..2023-03-09&type=Issues) | [@github-actions](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Agithub-actions+updated%3A2021-11-24..2023-03-09&type=Issues) | [@hbcarlos](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Ahbcarlos+updated%3A2021-11-24..2023-03-09&type=Issues) | [@jtpio](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Ajtpio+updated%3A2021-11-24..2023-03-09&type=Issues) | [@martinRenou](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3AmartinRenou+updated%3A2021-11-24..2023-03-09&type=Issues) | [@trungleduc](https://github.com/search?q=repo%3AQuantStack%2Fjupytercad+involves%3Atrungleduc+updated%3A2021-11-24..2023-03-09&type=Issues)
