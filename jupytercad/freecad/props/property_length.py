from typing import Any

from .base_prop import BaseProp


class App_PropertyLength(BaseProp):
    @staticmethod
    def name() -> str:
        return 'App::PropertyLength'

    @staticmethod
    def fc_to_jcad(prop_value: Any, **kwargs) -> Any:
        return prop_value.Value

    @staticmethod
    def jcad_to_fc(prop_value: Any, **kwargs) -> Any:
        return prop_value
