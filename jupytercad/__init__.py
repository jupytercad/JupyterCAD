from ._version import __version__
from .notebook import CadDocument

def _jupyter_labextension_paths():
    return [{'src': 'labextension', 'dest': 'jupytercad'}]
