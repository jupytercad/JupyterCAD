from typing import Any

from .base_prop import BaseProp


class App_PropertyLink(BaseProp):
    @staticmethod
    def name() -> str:
        return 'App::PropertyLink'

    @staticmethod
    def fc_to_jcad(prop_value: Any, **kwargs) -> Any:
        return prop_value.Name

    @staticmethod
    def jcad_to_fc(prop_value: str, fc_file=None, **kwargs) -> Any:
        if prop_value is None:
            return None
        return fc_file.getObject(prop_value)
