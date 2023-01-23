from abc import ABC, abstractmethod
from typing import Dict


class BaseObject(ABC):

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def to_dict(self) -> Dict:
        pass

    @abstractmethod
    def from_dict(self, value: Dict) -> None:
        pass
