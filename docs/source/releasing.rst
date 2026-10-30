.. _releasing:

======================
Releasing JupyterCAD
======================

This project uses `Semantic Versioning <https://semver.org/>`_. The current version is
defined in ``python/jupytercad/jupytercad/__init__.py`` and kept in sync with the npm
packages in this monorepo via ``scripts/bump-version.py`` (invoked by
``jupyter_releaser``).

.. important::

   **This project uses** `Semantic Versioning <https://semver.org/>`__.

Version numbers
---------------

When cutting a release, ``jupyter_releaser`` runs ``python scripts/bump-version.py`` to:

- bump the Python packages with ``hatch version`` (see ``pyproject.toml`` at the repo root)
- update the root ``package.json`` and workspace packages with ``lerna version``

Python pre-releases use ``a``, ``b``, and ``rc`` suffixes (for example ``3.5.0rc0``).
The corresponding npm versions use ``-alpha.``, ``-beta.``, and ``-rc.`` forms.

Automated releases with ``jupyter_releaser``
--------------------------------------------

Releases are published from GitHub Actions using
`jupyter_releaser <https://jupyter-releaser.readthedocs.io/en/latest/>`__.
For full details, see the upstream guide:
`Making your first release <https://jupyter-releaser.readthedocs.io/en/latest/get_started/making_release_from_repo.html>`__.

Prerequisites
~~~~~~~~~~~~~

You need admin access on the ``jupytercad/JupyterCAD`` repository to run the release
workflows.

Step 1: Prep release
~~~~~~~~~~~~~~~~~~~~

This workflow bumps versions, updates ``CHANGELOG.md``, and opens a draft GitHub release.

#. Open the `Actions tab <https://github.com/jupytercad/JupyterCAD/actions>`__.
#. Select **Step 1: Prep Release** in the left sidebar.
#. Click **Run workflow** and fill in the form.

   The **New Version Specifier** field controls the next version. The default is
   ``next`` (increment the patch level). Prefer an explicit numeric specifier such as
   ``3.5.0`` when you know the target version.

   .. danger::

      Using a version *part* alone (for example ``minor`` or ``patch``) as the new
      version specifier can cause **Step 2: Publish Release** to fail. Use a full
      numeric version such as ``3.5.0``.

#. Merge the changelog pull request created by the workflow when it looks correct.

Step 1b: Review the draft release
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

#. Open `GitHub Releases <https://github.com/jupytercad/JupyterCAD/releases>`__ and edit
   the new **draft** release:

   - Fix typos and improve wording for end users.
   - Remove bot-only pull requests (for example dependabot or pre-commit autoupdates).
   - Remove bots from the contributor list.

   .. danger::

      **Do not click "Publish release" in the GitHub UI.** Publication is done in Step 2.

#. Save the draft.

Step 2: Publish release
~~~~~~~~~~~~~~~~~~~~~~~

#. In Actions, select **Step 2: Publish Release**.
#. Click **Run workflow** (defaults are usually sufficient).
#. Verify the published release and packages when the workflow completes.

Step 3: conda-forge
~~~~~~~~~~~~~~~~~~~

After the release appears on PyPI, the conda-forge bot normally opens a pull request on
`jupytercad-feedstock <https://github.com/conda-forge/jupytercad-feedstock>`__.

If the bot is slow, you can open an issue on the feedstock with the title
``@conda-forge-admin, please update version``.

.. caution::

   If dependencies changed, update ``recipe/meta.yaml`` on the feedstock. The bot may
   not update recipes automatically and may leave a comment when manual edits are needed.

Release artifacts
-----------------

JupyterCAD is published to:

PyPI (metapackage and libraries)
  ``jupytercad``, ``jupytercad_app``, ``jupytercad_core``, ``jupytercad_lab``,
  ``jupytercad-lite``

npm
  ``@jupytercad/base``, ``@jupytercad/schema``, ``@jupytercad/opencascade``,
  ``@jupytercad/occ-worker``, ``@jupytercad/jupytercad-core``,
  ``@jupytercad/jupytercad-lab``, ``@jupytercad/jupytercad-app``

conda-forge
  `jupytercad-feedstock <https://github.com/conda-forge/jupytercad-feedstock>`__

Source and wheel assets are also attached to each
`GitHub release <https://github.com/jupytercad/JupyterCAD/releases>`__.

Manual release (advanced)
-------------------------

The root ``RELEASE.md`` file still describes publishing to PyPI and npm by hand. Most
maintainers should use ``jupyter_releaser`` instead.

Troubleshooting
---------------

**"Step 2: Publish Release" fails after using ``minor`` or ``patch`` as the version specifier**

Specify a numeric version in Step 1 (for example ``3.5.0``). If you need to re-run Step 1,
delete the draft release it created first, then start over.
