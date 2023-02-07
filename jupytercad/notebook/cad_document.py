import logging
import os
from typing import List, Optional, Union

import y_py as Y

from .objects import OBJECT_FACTORY, BaseObject
from .utils import normalize_path
from .y_connector import YDocConnector

logger = logging.getLogger(__file__)


class CadDocument:
    def __init__(self) -> None:
        self._path: Union[str, None] = None
        self._yconnector: Union[YDocConnector, None] = None
        self._ydoc: Union[Y.YDoc, None] = None
        self._objects_array: Union[Y.YArray, None] = None

    @classmethod
    async def open(cls, path: str):
        self = cls()
        self._path = path
        self._yconnector = YDocConnector(
            normalize_path(os.getcwd(), self._path)
        )
        try:
            success = await self._yconnector.connect_room()
        except Exception as e:
            logger.error('Can not connect to the server!', e)
            return None
        if not success:
            logger.error('Can not connect to the server!')
            return None
        self._ydoc = self._yconnector.ydoc
        if self._ydoc:
            self._objects_array = self._ydoc.get_array('objects')
        return self

    @property
    def objects(self) -> List[str]:
        if self._objects_array:
            return [x['name'] for x in self._objects_array]
        return []

    def get_object(self, name: str) -> Optional[BaseObject]:
        if self.check_exist(name):
            data = self._get_yobject_by_name(name).to_json()
            return OBJECT_FACTORY.create_object(data)

    def update_object(self, object: BaseObject) -> None:
        yobject: Optional[Y.YMap] = self._get_yobject_by_name(object.name)
        if yobject:
            with self._ydoc.begin_transaction() as t:
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
        else:
            logger.error(f'Can not add object {new_object.name}')

    def check_exist(self, name: str) -> bool:
        if self.objects:
            return name in self.objects
        return False

    def disconnect(self) -> None:
        self._yconnector.disconnect_room()

    def render(self) -> None:
        from IPython.display import display

        if self._yconnector:
            display(
                {'application/FCStd': self._yconnector.room_name}, raw=True
            )

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
        self.render()
