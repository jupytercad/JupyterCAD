import math
from typing import Any
import freecad as fc
from .base_prop import BaseProp


class App_PropertyPlacement(BaseProp):
    @staticmethod
    def name() -> str:
        return 'App::PropertyPlacement'

    @staticmethod
    def fc_to_jcad(prop_value: Any) -> Any:
        return {
            'Position': [
                prop_value.Base.x,
                prop_value.Base.y,
                prop_value.Base.z,
            ],
            'Axis': [
                prop_value.Rotation.Axis.x,
                prop_value.Rotation.Axis.y,
                prop_value.Rotation.Axis.z,
            ],
            'Angle': 180 * prop_value.Rotation.Angle / math.pi,
        }

    @staticmethod
    def jcad_to_fc(prop_value: Any) -> Any:
        base = fc.app.Base.Vector(prop_value['Position'])
        axis = fc.app.Base.Vector(prop_value['Axis'])
        angle = prop_value['Angle']
        return fc.app.Placement(base, axis, angle)
