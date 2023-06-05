from typing import Any, Dict

from ...tools import redirect_stdout_stderr

from ..base_prop import BaseProp

with redirect_stdout_stderr():
    try:
        import freecad as fc
        import Part
    except ImportError:
        fc = None


class Part_GeomCircle(BaseProp):
    @staticmethod
    def name() -> str:
        return "Part::GeomCircle"

    @staticmethod
    def fc_to_jcad(prop_value: Any, **kwargs) -> Any:
        center = prop_value.Center
        radius = prop_value.Radius
        angle = prop_value.AngleXU
        normal = prop_value.Axis
        return {
            "TypeId": Part_GeomCircle.name(),
            "CenterX": center.x,
            "CenterY": center.y,
            "CenterZ": center.z,
            "NormalX": normal.x,
            "NormalY": normal.y,
            "NormalZ": normal.z,
            "AngleXU": angle,
            "Radius": radius,
        }

    @staticmethod
    def jcad_to_fc(prop_value: Dict, fc_object: Any, **kwargs) -> Any:
        if not fc:
            return
        Center = fc.app.Base.Vector(
            prop_value["CenterX"],
            prop_value["CenterY"],
            prop_value["CenterZ"],
        )

        Axis = fc.app.Base.Vector(
            prop_value["NormalX"],
            prop_value["NormalY"],
            prop_value["NormalZ"],
        )

        Radius = prop_value["Radius"]
        if fc_object:
            fc_object.Center = Center
            fc_object.Axis = Axis
            fc_object.AngleXU = prop_value["AngleXU"]
            fc_object.Radius = Radius
            return None
        else:
            return Part.Circle(Center, Axis, Radius)
