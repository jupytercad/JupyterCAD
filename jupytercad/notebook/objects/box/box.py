from typing import Dict
from ..placement import Placement
from ..base import BaseObject


class Box(BaseObject):
    def __init__(
        self,
        name: str,
        length=1.0,
        width=1.0,
        height=1.0,
        placement=Placement(),
    ) -> None:
        super().__init__()
        self.length = length
        self.width = width
        self.height = height
        self.placement = placement
        self._name = name
        self._visible = True

    @property
    def name(self) -> str:
        return self._name

    @property
    def visible(self) -> str:
        return self._visible

    @visible.setter
    def visible(self, val: bool) -> None:
        self._visible = val

    @property
    def shape(self) -> str:
        return 'Part::Box'

    @property
    def parameters(self) -> Dict:
        return dict(
            Length=self.length,
            Width=self.width,
            Height=self.height,
            Placement=self.placement.to_dict(),
        )

    def from_dict(self, value: Dict) -> None:
        parameters = value.get('parameters', None)
        if parameters:
            self.length = parameters.get('Length', None)
            self.width = parameters.get('Width', None)
            self.height = parameters.get('Height', None)

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
