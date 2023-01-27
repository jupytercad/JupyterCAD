from .factory_manager import ObjectFactoryManager
from .box import Box, BoxFactory
from .placement import Placement
from .base import BaseObject

OBJECT_FACTORY = ObjectFactoryManager()
OBJECT_FACTORY.register_factory(BoxFactory())