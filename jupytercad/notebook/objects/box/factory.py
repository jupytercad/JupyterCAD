from typing import Dict
from .box import Box
from ..object_factory import ObjectFactory


class BoxFactory(ObjectFactory):

    @property
    def object_type(self) -> str:
        return 'Part::Box'
    
    def factory_method(self, data: Dict) -> Box:
        name = data.get('name', '')
        box = Box(name)
        box.from_dict(data)
        return box
