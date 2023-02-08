from typing import Dict, Optional
from jupytercad.notebook.objects._schema.jcad import JcadObject

from .base import BaseObject
from .object_factory import ObjectFactory
from pydantic import BaseModel


class SingletonMeta(type):

    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class ObjectFactoryManager(metaclass=SingletonMeta):
    def __init__(self):
        self._factories: Dict[str, type[BaseModel]] = {}

    def register_factory(self, shape_type: str, cls: type[BaseModel]) -> None:
        if shape_type not in self._factories:
            self._factories[shape_type] = cls

    def create_object(self, data: Dict) -> Optional[BaseObject]:
        object_type = data.get('shape', None)
        if object_type and object_type in self._factories:
            Model = self._factories[object_type]
            args = {}
            params = data['parameters']
            for field in Model.__fields__:
                args[field] = params.get(field, None)
            print('####', args)
            obj_params = Model(**args)
            return obj_params
            return JcadObject(
                visible=data['visible'],
                name=data['name'],
                shape=data['shape'],
                parameters=obj_params,
            )

        return None
