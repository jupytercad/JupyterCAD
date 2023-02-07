from typing import Dict
from .cone import Cone
from ..object_factory import ObjectFactory


class ConeFactory(ObjectFactory):
    @property
    def object_type(self) -> str:
        return 'Part::Cone'

    def factory_method(self, data: Dict) -> Cone:
        name = data.get('name', '')
        obj = Cone(name)
        obj.from_dict(data)
        return obj
