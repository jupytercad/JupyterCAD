from .factory_manager import ObjectFactoryManager
from .base import BaseObject
from ._schema.box import IBox
from ._schema.jcad import Parts
OBJECT_FACTORY = ObjectFactoryManager()
OBJECT_FACTORY.register_factory(Parts.Part__Box.value, IBox)

