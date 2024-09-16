.. _contributing:

============
Contributing
============

Development install
-------------------

**Note:** You will need :ref:`Node.js <https://nodejs.org/>` and :ref:`Docker <https://www.docker.com/>` to build the extension package.

The ``jlpm`` command is JupyterLab's pinned version of
:ref:`yarn <https://yarnpkg.com/>` that is installed with JupyterLab. You may use
:ref:`yarn <https://yarnpkg.com/>` or :ref:`npm <https://www.npmjs.com/>` in lieu of ``jlpm`` below.

.. code-block:: bash

    # Clone the repo to your local environment
    git clone https://github.com/jupytercad/JupyterCAD.git
    # Change directory to the jupytercad directory
    cd JupyterCAD
    # Install JupyterLab for jlpm
    pip install jupyterlab
    # Install package in development mode
    python scripts/dev-install.py
    # Rebuild extension Typescript source after making changes
    jlpm run build

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

.. code-block:: bash

    # Watch the source directory in one terminal, automatically rebuilding when needed
    jlpm run watch
    # Run JupyterLab in another terminal
    jupyter lab

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the ``jlpm run build`` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

.. code-block:: bash

    jupyter lab build --minimize=False

Custom Open Cascade WASM build
------------------------------

JupyterCAD uses a custom build of Open Cascade WASM. For performance and data usage concern, we only build the symbols we need.

This custom build is done in the ``packages/opencascade`` directory:

.. code-block:: bash

    cd packages/opencascade

In order to rebuild it yourself, you need to install Docker, then you need to run the following (this may take some time):

.. code-block:: bash

    yarn run build

In the case where you need to add new symbols, you can rebuild Open Cascade with the following command.

.. code-block:: bash

    yarn run build --add symbol_to_add another_symbol ...

Custom build doc
----------------

`https://ocjs.org/docs/app-dev-workflow/custom-builds <https://ocjs.org/docs/app-dev-workflow/custom-builds>`_

Custom build example
--------------------

`https://github.com/donalffons/opencascade.js/blob/master/website/ocjs-editor-theme/src/customBuild/customBuild.yml <https://github.com/donalffons/opencascade.js/blob/master/website/ocjs-editor-theme/src/customBuild/customBuild.yml>`_

Where to find symbols
----------------------

`https://dev.opencascade.org/doc/refman/html/annotated.html <https://dev.opencascade.org/doc/refman/html/annotated.html>`_

Development uninstall
----------------------

.. code-block:: bash

    pip uninstall jupytercad

In development mode, you will also need to remove the symlink created by ``jupyter labextension develop`` command. To find its location, you can run ``jupyter labextension list`` to figure out where the ``labextensions`` folder is located. Then you can remove the symlink named ``jupytercad`` within that folder.
