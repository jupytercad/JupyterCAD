from typing import Dict
from .base import BaseObject


class Placement(BaseObject):
    def __init__(self, Position=[0, 0, 0], Axis=[1, 0, 0], Angle=0) -> None:
        super().__init__()
        self.Position = Position
        self.Axis = Axis
        self.Angle = Angle

    @property
    def name(self) -> str:
        return None

    def to_dict(self) -> Dict:
        return dict(Position=self.Position, Axis=self.Axis, Angle=self.Angle)

    def from_dict(self, value: Dict) -> None:
        self.Position = value.get('Position', None)
        self.Axis = value.get('Axis', None)
        self.Angle = value.get('Angle', None)
