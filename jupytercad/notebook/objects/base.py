from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseObject(ABC):
    
    @property
    @abstractmethod
    def name(self) -> str:
        pass
    
    @property
    @abstractmethod
    def visible(self) -> bool:
        pass

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

    def __repr__ (self) -> str:
        return str(self.to_dict())