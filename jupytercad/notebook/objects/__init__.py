from .factory_manager import ObjectFactoryManager
from .box import BoxFactory
from .cone import ConeFactory
from .base import BaseObject

OBJECT_FACTORY = ObjectFactoryManager()
OBJECT_FACTORY.register_factory(BoxFactory())
OBJECT_FACTORY.register_factory(ConeFactory())
