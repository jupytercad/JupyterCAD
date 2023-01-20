from typing import Dict, List


from ipywidgets import DOMWidget
from traitlets import Unicode

from .objects import BaseObject

from .utils import MESSAGE_ACTION
from ._frontend import module_name, module_version


class CadDocument(DOMWidget):

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
        self.on_msg(self._handle_frontend_msg)

    def _handle_frontend_msg(
        self, model: 'CadDocument', msg: Dict, buffer: List
    ) -> None:
        pass

    def add_object(self, object: BaseObject):
        self.send(
            {'action': MESSAGE_ACTION.ADD_OBJECT, 'payload': object.to_dict()}
        )
