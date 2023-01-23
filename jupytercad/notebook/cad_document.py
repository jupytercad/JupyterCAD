from typing import Callable, Optional
from .cad_widget import CadWidget
from .utils import normalize_path
from .objects import BaseObject
import os
import y_py as Y


class CadDocument:
    def __init__(self, path: str) -> None:
        self._path = path
        self._widget = CadWidget(normalize_path(os.getcwd(), self._path))
        self._objects: Optional[Y.YArray] = None

    @property
    def ydoc(self):
        return self._widget.ydoc

    @property
    def objects(self) -> Optional[Y.YArray]:
        if self._objects:
            return self._objects
        objects = self._widget.ydoc.get_array('objects')
        if objects:
            self._objects = objects

        return objects

    def add_object(self, new_object: BaseObject):
        if self.objects and not self.check_exist(new_object.name):
            new_map = Y.YMap(new_object.to_dict())
            with self.ydoc.begin_transaction() as t:
                self.objects.append(t, new_map)

    def check_exist(self, name: str) -> bool:
        if self.objects:
            all_objects = [x['name'] for x in self.objects]
            return name in all_objects
        return False

    def _ipython_display_(
        self,
    ) -> None:
        from IPython.display import display

        display(self._widget)
