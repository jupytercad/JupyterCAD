from cmath import log
from typing import Dict


from ipywidgets import DOMWidget
from traitlets import Unicode
from ._frontend import module_name, module_version

class Document(DOMWidget):

    _model_name = Unicode('JupyterCadWidgetModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('JupyterCadWidgetView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    path = Unicode(None, allow_none=True).tag(sync=True)

    def __init__(self, path: str, **kwargs) -> None:
        super().__init__(**kwargs)
        self.path = path
    