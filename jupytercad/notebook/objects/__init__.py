from typing import Dict, Optional, Union
from ._schema.box import IBox
from ._schema.cone import ICone
from ._schema.cut import ICut
from ._schema.cylinder import ICylinder
from ._schema.extrusion import IExtrusion
from ._schema.fuse import IFuse
from ._schema.intersection import IIntersection
from ._schema.jcad import Parts
from ._schema.sphere import ISphere
from ._schema.torus import ITorus
from pydantic import BaseModel


class PythonJcadObject(BaseModel):
    name: str
    shape: Parts
    parameters: Union[
        IBox,
        ICone,
        ICut,
        ICylinder,
        IExtrusion,
        IIntersection,
        IFuse,
        ISphere,
        ITorus,
    ]


class SingletonMeta(type):

    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]


class ObjectFactoryManager(metaclass=SingletonMeta):
    def __init__(self):
        self._factories: Dict[str, type[BaseModel]] = {}

    def register_factory(self, shape_type: str, cls: type[BaseModel]) -> None:
        if shape_type not in self._factories:
            self._factories[shape_type] = cls

    def create_object(self, data: Dict) -> Optional[PythonJcadObject]:
        object_type = data.get('shape', None)
        name: str = data.get('name', None)
        if object_type and object_type in self._factories:
            Model = self._factories[object_type]
            args = {}
            params = data['parameters']
            for field in Model.__fields__:
                args[field] = params.get(field, None)
            obj_params = Model(**args)
            return PythonJcadObject(
                name=name, shape=object_type, parameters=obj_params
            )

        return None


OBJECT_FACTORY = ObjectFactoryManager()

OBJECT_FACTORY.register_factory(Parts.Part__Box.value, IBox)
OBJECT_FACTORY.register_factory(Parts.Part__Cone.value, ICone)
OBJECT_FACTORY.register_factory(Parts.Part__Cut.value, ICut)
OBJECT_FACTORY.register_factory(Parts.Part__Cylinder.value, ICylinder)
OBJECT_FACTORY.register_factory(Parts.Part__Extrusion.value, IExtrusion)
OBJECT_FACTORY.register_factory(Parts.Part__MultiCommon.value, IIntersection)
OBJECT_FACTORY.register_factory(Parts.Part__MultiFuse.value, IFuse)
OBJECT_FACTORY.register_factory(Parts.Part__Sphere.value, ISphere)
OBJECT_FACTORY.register_factory(Parts.Part__Torus.value, ITorus)
