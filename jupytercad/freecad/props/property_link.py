from typing import Any

from .base_prop import BaseProp


class App_PropertyLink(BaseProp):
    @staticmethod
    def name() -> str:
        return 'App::PropertyLink'

    @staticmethod
    def fc_to_jcad(prop_value: Any, jcad_file=None, fc_file=None) -> Any:
        return prop_value.Name

    @staticmethod
    def jcad_to_fc(prop_value: str, jcad_file=None, fc_file=None) -> Any:
        return fc_file.getObject(prop_value)
