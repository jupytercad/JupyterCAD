from typing import Any
from io import StringIO
from .base_prop import BaseProp


class App_PropertyAngle(BaseProp):
    @staticmethod
    def name() -> str:
        return 'Part::PropertyPartShape'

    @staticmethod
    def fc_to_jcad(prop_value: Any, jcad_file=None, fc_file=None) -> Any:
        buffer = StringIO()
        prop_value.exportBrep(buffer)
        return buffer.getvalue()

    @staticmethod
    def jcad_to_fc(prop_value: str, jcad_file=None, fc_file=None) -> Any:
        """PropertyPartShape is readonly"""
        return None
