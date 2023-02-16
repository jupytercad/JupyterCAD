import json
import logging
import os
from typing import List, Optional, Union

import y_py as Y

from .objects import OBJECT_FACTORY, PythonJcadObject
from .utils import normalize_path
from .y_connector import YDocConnector
from pydantic import BaseModel

logger = logging.getLogger(__file__)


class CadDocument:
    def __init__(self, path: Optional[str] = None):
        self._path = path
        self._yconnector = YDocConnector(
            normalize_path(os.getcwd(), self._path)
        )
        self._ydoc: Union[Y.YDoc, None] = None
        self._objects_array: Union[Y.YArray, None] = None
        self._ydoc = self._yconnector.ydoc
        if self._ydoc:
            self._objects_array = self._ydoc.get_array('objects')

    @property
    def objects(self) -> List[str]:
        if self._objects_array:
            return [x['name'] for x in self._objects_array]
        return []

    def get_object(self, name: str) -> Optional[PythonJcadObject]:
        if self.check_exist(name):
            data = self._get_yobject_by_name(name).to_json()
            return OBJECT_FACTORY.create_object(data)

    def update_object(self, object: PythonJcadObject) -> None:
        yobject: Optional[Y.YMap] = self._get_yobject_by_name(object.name)
        if yobject:
            with self._ydoc.begin_transaction() as t:
                yobject.set(t, 'parameters', object.parameters.dict())

    def remove_object(self, name: str) -> None:
        index = self._get_yobject_index_by_name(name)
        if self._objects_array and index != -1:
            with self.ydoc.begin_transaction() as t:
                self._objects_array.delete(t, index)

    def add_object(self, new_object: PythonJcadObject) -> None:
        if self._objects_array is not None and not self.check_exist(
            new_object.name
        ):
            obj_dict = json.loads(new_object.json())
            obj_dict['visible'] = True
            new_map = Y.YMap(obj_dict)
            with self._ydoc.begin_transaction() as t:
                self._objects_array.append(t, new_map)
        else:
            logger.error(f'Can not add object {new_object.name}')

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

    def _repr_mimebundle_(self, **kwargs):
        data = {
            'application/FCStd': json.dumps(
                {'commId': self._yconnector.comm_id}
            ),
        }
        return data
