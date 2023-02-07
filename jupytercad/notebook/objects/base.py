from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseObject(ABC):
    def __init__(self) -> None:
        super().__init__()
        self._name = None
        self._visible = True

    @property
    def name(self) -> str:
        return self._name

    @property
    def visible(self) -> bool:
        return self._visible

    @visible.setter
    def visible(self, val: bool) -> None:
        self._visible = val

    @property
    @abstractmethod
    def shape(self) -> str:
        pass

    @property
    @abstractmethod
    def parameters(self) -> Dict:
        pass

    @abstractmethod
    def to_dict(self) -> Dict:
        pass

    @abstractmethod
    def from_dict(self, value: Dict[str, Any]) -> None:
        pass

    def __repr__(self) -> str:
        return str(self.to_dict())
