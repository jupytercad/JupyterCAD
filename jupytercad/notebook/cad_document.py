import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Union

import y_py as Y
from ypywidgets.ypywidgets import Widget

from .utils import normalize_path

logger = logging.getLogger(__file__)


class CadDocument(Widget):
    def __init__(self, path: Optional[str] = None):
        comm_data = CadDocument.path_to_comm(path)

        super().__init__(name="@jupytercad:widget", open_comm=True, comm_data=comm_data)

        self._objects_array: Union[Y.YArray, None] = None
        if self.ydoc:
            self._objects_array = self.ydoc.get_array("objects")

    @property
    def objects(self) -> List[str]:
        if self._objects_array:
            return [x["name"] for x in self._objects_array]
        return []

    @classmethod
    def path_to_comm(cls, filePath: Optional[str]) -> Dict:
        path = None
        format = None
        contentType = None

        if filePath is not None:
            path = normalize_path(filePath)
            file_name = Path(path).name
            try:
                ext = file_name.split(".")[1].lower()
            except Exception:
                raise Exception("Can not detect file extension!")
            if ext == "fcstd":
                format = "base64"
                contentType = "FCStd"
            elif ext == "jcad":
                format = "text"
                contentType = "jcad"
            else:
                raise Exception("File extension is not supported!")
        comm_data = {
            "path": path,
            "format": format,
            "contentType": contentType,
        }
        return comm_data

    def get_object(self, name: str) -> Optional["PythonJcadObject"]:
        from .objects import OBJECT_FACTORY

        if self.check_exist(name):
            data = json.loads(self._get_yobject_by_name(name).to_json())
            return OBJECT_FACTORY.create_object(data, self)

    def update_object(self, object: "PythonJcadObject") -> None:
        yobject: Optional[Y.YMap] = self._get_yobject_by_name(object.name)
        if yobject:
            with self.ydoc.begin_transaction() as t:
                yobject.set(t, "parameters", object.parameters.dict())

    def remove_object(self, name: str) -> None:
        index = self._get_yobject_index_by_name(name)
        if self._objects_array and index != -1:
            with self.ydoc.begin_transaction() as t:
                self._objects_array.delete(t, index)

    def add_object(self, new_object: "PythonJcadObject") -> None:
        if self._objects_array is not None and not self.check_exist(new_object.name):
            obj_dict = json.loads(new_object.json())
            obj_dict["visible"] = True
            new_map = Y.YMap(obj_dict)
            with self.ydoc.begin_transaction() as t:
                self._objects_array.append(t, new_map)
        else:
            logger.error(f"Can not add object {new_object.name}")

    def check_exist(self, name: str) -> bool:
        if self.objects:
            return name in self.objects
        return False

    def render(self) -> Dict:
        return {
            "application/FCStd": json.dumps({"commId": self.comm_id}),
        }

    def _get_yobject_by_name(self, name: str) -> Optional[Y.YMap]:
        if self._objects_array:
            for item in self._objects_array:
                if item["name"] == name:
                    return item
        return None

    def _get_yobject_index_by_name(self, name: str) -> int:
        if self._objects_array:
            for index, item in enumerate(self._objects_array):
                if item["name"] == name:
                    return index
        return -1

    def _repr_mimebundle_(self, **kwargs):
        return self.render()
