from ._version import __version__
from .notebook import CadWidget

def _jupyter_labextension_paths():
    return [{'src': 'labextension', 'dest': 'jupytercad'}]
