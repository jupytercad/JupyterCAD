from typing import Any, List

from .base_prop import BaseProp
from .geometry import geom_handlers


class Part_PropertyGeometryList(BaseProp):
    @staticmethod
    def name() -> str:
        return "Part::PropertyGeometryList"

    @staticmethod
    def fc_to_jcad(prop_value: List, **kwargs) -> Any:
        ret = []
        for geo in prop_value:
            if geo.TypeId in geom_handlers:
                ret.append(geom_handlers[geo.TypeId].fc_to_jcad(geo))
        return ret

    @staticmethod
    def jcad_to_fc(prop_value: List, fc_prop: List = [], **kwargs) -> Any:
        # We do not handle the case of adding or removing yet.
        n_objects = len(fc_prop)

        n_new_objects = len(prop_value)
        if n_objects > 0 and n_objects == n_new_objects:
            # Update existing geometries
            for idx, jcad_geo in enumerate(prop_value):
                if jcad_geo["TypeId"] in geom_handlers:
                    geom_handlers[jcad_geo["TypeId"]].jcad_to_fc(
                        jcad_geo, fc_object=fc_prop[idx]
                    )
            return fc_prop

        if n_objects == 0 and n_new_objects > 0:
            # Create new geometries
            for jcad_geo in prop_value:
                if jcad_geo["TypeId"] in geom_handlers:
                    fc_geo = geom_handlers[jcad_geo["TypeId"]].jcad_to_fc(
                        jcad_geo, fc_object=None
                    )

                    fc_prop.append(fc_geo)

            return fc_prop

        return None
