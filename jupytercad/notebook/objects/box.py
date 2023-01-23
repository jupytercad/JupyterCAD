from typing import Dict
from .placement import Placement
from .base import BaseObject


class Box(BaseObject):
    def __init__(
        self, name: str, Length=1, Width=1, Height=1, Placement=Placement()
    ) -> None:
        super().__init__()
        self.Length = Length
        self.Width = Width
        self.Height = Height
        self.Placement = Placement
        self._name = name

    @property
    def name(self) -> str:
        return self._name

    def from_dict(self, value: Dict) -> None:
        parameters = value.get('parameters', None)
        if parameters:
            self.Length = parameters.get('Length', None)
            self.Width = parameters.get('Width', None)
            self.Height = parameters.get('Height', None)
            newPlacement = Placement()
            self.Placement = newPlacement.from_dict(
                parameters.get('Placement', None)
            )

    def to_dict(self) -> Dict:
        content = {
            'name': self.name,
            'visible': True,
            'shape': 'Part::Box',
            'parameters': dict(
                Length=self.Length,
                Width=self.Width,
                Height=self.Height,
                Placement=self.Placement.to_dict(),
            ),
        }
        return content
