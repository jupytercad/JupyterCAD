from io import StringIO
from typing import Any

from .base_prop import BaseProp


class Part_PropertyPartShape(BaseProp):
    @staticmethod
    def name() -> str:
        return "Part::PropertyPartShape"

    @staticmethod
    def fc_to_jcad(prop_value: Any, **kwargs) -> Any:
        buffer = StringIO()
        prop_value.exportBrep(buffer)
        return buffer.getvalue()

    @staticmethod
    def jcad_to_fc(prop_value: str, **kwargs) -> Any:
        """PropertyPartShape is readonly"""
        return None
