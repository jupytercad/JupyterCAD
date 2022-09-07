from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseProp(ABC):
    @staticmethod
    @abstractmethod
    def name() -> str:
        pass

    @staticmethod
    @abstractmethod
    def fc_to_jcad() -> Dict:
        pass

    @staticmethod
    @abstractmethod
    def jcad_to_fc() -> Any:
        pass
