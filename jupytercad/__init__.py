from ._version import __version__
from .cadapp import CadApp

def _jupyter_labextension_paths():
    return [{'src': 'labextension', 'dest': '@jupytercad/jupytercad-extension'}]

def _jupyter_server_extension_points():
    return [
        {
            'module': __name__,
            'app': CadApp
        }
    ]
