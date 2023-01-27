from typing import Callable, List, Optional

from .objects import OBJECT_FACTORY
from .cad_widget import CadWidget
from .utils import normalize_path
from .objects import BaseObject
import os
import y_py as Y


class CadDocument:
    def __init__(self, path: str) -> None:
        self._path = path
        self._widget = CadWidget(normalize_path(os.getcwd(), self._path))
        self._objects_array: Optional[Y.YArray] = None

    @property
    def ydoc(self):
        return self._widget.ydoc

    @property
    def objects(self) -> Optional[List[str]]:
        if not self.ydoc:
            return []
        if not self._objects_array:
            objects = self.ydoc.get_array('objects')
            if not objects:
                return
            self._objects_array = objects

        return [x['name'] for x in self._objects_array]

    def get_object(self, name: str) -> Optional[BaseObject]:
        if self.check_exist(name):
            data = self._get_yobject_by_name(name).to_json()
            return OBJECT_FACTORY.create_object(data)

    def update_object(self, object: BaseObject) -> None:
        if self.check_exist(object.name):
            yobject = self._get_yobject_by_name(object.name)
            with self.ydoc.begin_transaction() as t:
                yobject.set(t, 'parameters', object.parameters)
                yobject.set(t, 'visible', object.visible)

    def remove_object(self, name: str) -> None:
        index = self._get_yobject_index_by_name(name)
        if self._objects_array and index != -1:
            with self.ydoc.begin_transaction() as t:
                self._objects_array.delete(t, index)

    def add_object(self, new_object: BaseObject) -> None:
        if self._objects_array and not self.check_exist(new_object.name):
            new_map = Y.YMap(new_object.to_dict())
            with self.ydoc.begin_transaction() as t:
                self._objects_array.append(t, new_map)

    def check_exist(self, name: str) -> bool:
        if self.objects:
            return name in self.objects
        return False

    def _get_yobject_by_name(self, name: str) -> Optional[Y.YMap]:
        if self._objects_array:
            for item in self._objects_array:
                if item['name'] == name:
                    return item
        return None

    def _get_yobject_index_by_name(self, name: str) -> int:
        if self._objects_array:
            for index, item in enumerate(self._objects_array):
                if item['name'] == name:
                    return index
        return -1

    def _ipython_display_(
        self,
    ) -> None:
        from IPython.display import display

        display(self._widget)
