from typing import Any, List

from .base_prop import BaseProp


class App_PropertyLinkList(BaseProp):
    @staticmethod
    def name() -> str:
        return 'App::PropertyLinkList'

    @staticmethod
    def fc_to_jcad(prop_value: Any, jcad_file=None, fc_file=None) -> Any:
        return [o.Name for o in prop_value]

    @staticmethod
    def jcad_to_fc(prop_value: List, jcad_file=None, fc_file=None) -> Any:
        if prop_value is None:
            return None
        return [fc_file.getObject(name) for name in prop_value]
