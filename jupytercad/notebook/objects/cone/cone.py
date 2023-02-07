from dataclasses import dataclass
from typing import Dict
from ..placement import Placement
from ..base import BaseObject


class Cone(BaseObject):

    __slots__ = ['Radius1', 'Radius2', 'Height', 'Angle']

    def __init__(
        self,
        name: str,
        Radius1=1.0,
        Radius2=0.5,
        Height=10.0,
        Angle=360,
        Placement=Placement(),
    ) -> None:
        super().__init__()
        self._name = name

        self.Radius1 = Radius1
        self.Radius2 = Radius2
        self.Height = Height
        self.Angle = Angle
        self.Placement = Placement

        self._visible = True

    @property
    def shape(self) -> str:
        return 'Part::Cone'

    @property
    def parameters(self) -> Dict:
        params = {}
        for attr in self.__slots__:
            params[attr] = getattr(self, attr)
        params['Placement'] = self.placement.to_dict()

        return params

    def from_dict(self, value: Dict) -> None:
        parameters = value.get('parameters', None)
        if parameters:
            for attr in self.__slots__:
                print('set att', attr)
                setattr(self, attr, parameters.get(attr, None))
            placement_data = parameters.get('Placement', None)
            if placement_data:
                self.placement = Placement()
                self.placement.from_dict(placement_data)

    def to_dict(self) -> Dict:
        content = {
            'name': self.name,
            'visible': self.visible,
            'shape': self.shape,
            'parameters': self.parameters,
        }
        return content
