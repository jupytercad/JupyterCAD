from typing import Dict

from .placement import Placement
from .base import BaseObject


class Box(BaseObject):
    def __init__(
        self, Length=1, Width=1, Height=1, Placement=Placement()
    ) -> None:
        super().__init__()
        self.Length = Length
        self.Width = Width
        self.Height = Height
        self.Placement = Placement

    def from_dict(self, value: Dict) -> None:
        self.Length = value.get('Length', None)
        self.Width = value.get('Width', None)
        self.Height = value.get('Height', None)
        newPlacement = Placement()
        self.Placement = newPlacement.from_dict(value.get('Placement', None))

    def to_dict(self) -> Dict:
        return dict(
            Length=self.Length,
            Width=self.Width,
            Height=self.Height,
            Placement=self.Placement.to_dict(),
        )
