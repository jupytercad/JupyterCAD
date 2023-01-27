from abc import ABC, abstractmethod
from typing import Dict

from .base import BaseObject


class ObjectFactory(ABC):
    @property
    @abstractmethod
    def object_type(self) -> str:
        pass

    @abstractmethod
    def factory_method(self, data: Dict) -> BaseObject:
        pass
