from ._version import __version__
from .app import CADApp


def _jupyter_labextension_paths():
    return [{'src': 'labextension', 'dest': 'jupytercad'}]


def _jupyter_server_extension_points():
    return [
        {
            'module': __name__,
            'app': CADApp
        }
    ]
