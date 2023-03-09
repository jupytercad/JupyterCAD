# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.import click

# Heavily inspired by:
# - https://github.com/jupyterlab/jupyterlab/blob/master/buildutils/src/bumpversion.ts
# - https://github.com/jupyterlab/retrolab/blob/main/buildutils/src/release-bump.ts

import click
from jupyter_releaser.util import is_prerelease, get_version, run


OPTIONS = ["major", "minor", "release", "build", "patch", "next"]


def patch():
    version = get_version()
    if is_prerelease(version):
        raise Exception("Can only make a patch release from a final version")

    run("hatch version patch", quiet=True)


def update(spec):
    prev = get_version()

    is_final = not is_prerelease(prev)

    if is_final and spec == "build":
        raise Exception("Cannot increment a build on a final release")

    # If this is a major release during the alpha cycle, bump
    # just the Python version.
    if "a" in prev and spec == "major":
        run(f"hatch version {spec}")
        return

    # Determine the version spec to use for hatch
    py_spec = spec
    if spec == "build":
        if 'a' in prev:
            py_spec = 'a'
        elif 'b' in prev:
            py_spec = 'b'
        elif 'rc' in prev:
            py_spec = 'rc'
    # a -> b
    elif spec == "release" and "a" in prev:
        py_spec = 'beta'
    # b -> rc
    elif spec == "release" and "b" in prev:
        py_spec = 'rc'
    # rc -> final
    elif spec == "release" and "c" in prev:
        py_spec = 'release'
    elif spec == "release":
        py_spec = 'minor,alpha'

    # Bump the Python version
    run(f"hatch version {py_spec}")


@click.command()
@click.argument("spec", nargs=1)
def bump(spec):
    status = run("git status --porcelain").strip()
    if len(status) > 0:
        raise Exception("Must be in a clean git state with no untracked files")

    # Make sure we have a valid version spec.
    if spec not in OPTIONS:
        raise ValueError(f"Version spec must be one of: {OPTIONS}")

    prev = get_version()
    is_final = not is_prerelease(prev)
    if spec == "next":
        spec = "patch" if is_final else "build"

    if spec == "patch":
        patch()
        return

    update(spec)


if __name__ == "__main__":
    bump()
