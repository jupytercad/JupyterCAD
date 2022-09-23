from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseProp(ABC):
    @staticmethod
    @abstractmethod
    def name() -> str:
        pass

    @staticmethod
    @abstractmethod
    def fc_to_jcad(prop_value: Any, jcad_file=None, fc_file=None) -> Any:
        pass

    @staticmethod
    @abstractmethod
    def jcad_to_fc(prop_value: Any, jcad_file=None, fc_file=None) -> Any:
        pass
