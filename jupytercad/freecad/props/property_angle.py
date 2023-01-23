from typing import Any

from .base_prop import BaseProp


class App_PropertyAngle(BaseProp):
    @staticmethod
    def name() -> str:
        return 'App::PropertyAngle'

    @staticmethod
    def fc_to_jcad(prop_value: Any, **kwargs) -> Any:
        return prop_value.getValueAs('deg').Value

    @staticmethod
    def jcad_to_fc(prop_value: float, **kwargs) -> Any:
        return prop_value
