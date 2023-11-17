try:
    from ._version import __version__
except ImportError:
    # Fallback when using the package in dev mode without installing
    # in editable mode with pip. It is highly recommended to install
    # the package from a stable release or in editable mode: https://pip.pypa.io/en/stable/topics/local-project-installs/#editable-installs
    import warnings

    warnings.warn("Importing 'jupytercad_app' outside a proper installation.")
    __version__ = "dev"

from .cadapp import CadApp, main  # noqa


def _jupyter_server_extension_points():
    return [{"module": "jupytercad_app", "app": CadApp}]
