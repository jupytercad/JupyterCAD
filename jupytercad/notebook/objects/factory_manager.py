from typing import Dict, Optional
from .base import BaseObject
from .object_factory import ObjectFactory


class SingletonMeta(type):

    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class ObjectFactoryManager(metaclass=SingletonMeta):
    def __init__(self):
        self._factories: Dict[str, ObjectFactory] = {}

    def register_factory(self, fac: ObjectFactory) -> None:
        if fac.object_type not in self._factories:
            self._factories[fac.object_type] = fac

    def create_object(self, data: Dict) -> Optional[BaseObject]:
        object_type = data.get('shape', None)
        if object_type and object_type in self._factories:
            return self._factories[object_type].factory_method(data)
        
        return None

