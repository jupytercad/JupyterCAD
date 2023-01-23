from typing import Dict, Type

from ..base_prop import BaseProp
from .geom_circle import Part_GeomCircle
from .geom_linesegment import Part_GeomLineSegment

geom_handlers: Dict[str, Type[BaseProp]] = {}

geom_handlers[Part_GeomCircle.name()] = Part_GeomCircle
geom_handlers[Part_GeomLineSegment.name()] = Part_GeomLineSegment
