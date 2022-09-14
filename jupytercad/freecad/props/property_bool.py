from typing import Any

from .base_prop import BaseProp


class App_PropertyBool(BaseProp):
    @staticmethod
    def name() -> str:
        return 'App::PropertyBool'

    @staticmethod
    def fc_to_jcad(prop_value: Any, jcad_file=None, fc_file=None) -> Any:
        return prop_value

    @staticmethod
    def jcad_to_fc(prop_value: bool, jcad_file=None, fc_file=None) -> Any:
        return prop_value
