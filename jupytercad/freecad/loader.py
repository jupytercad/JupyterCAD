import base64
import logging
import os
import tempfile
import traceback
from typing import Dict, List, Type

from .tools import redirect_stdout_stderr

from . import props as Props
from .props.base_prop import BaseProp

logger = logging.getLogger(__file__)

with redirect_stdout_stderr():
    try:
        import freecad as fc
        import OfflineRenderingUtils

    except ImportError:
        fc = None


def _guidata_to_options(guidata):
    """Converts freecad guidata into options that JupyterCad understands"""
    options = {}

    for obj_name, data in guidata.items():
        obj_options = {}

        # We need to make a special case to "GuiCameraSettings" because freecad's
        # OfflineRenderingUtils mixes the camera settings with 3D objects
        if obj_name == "GuiCameraSettings":
            options[obj_name] = data
            continue

        if "ShapeColor" in data:
            obj_options["color"] = list(data["ShapeColor"]["value"])

        if "Visibility" in data:
            obj_options["visibility"] = data["Visibility"]["value"]

        options[obj_name] = obj_options

    return options


def _options_to_guidata(options):
    """Converts JupyterCad options into freecad guidata"""
    gui_data = {}

    for obj_name, data in options.items():
        obj_data = {}

        # We need to make a special case to "GuiCameraSettings" because freecad's
        # OfflineRenderingUtils mixes the camera settings with 3D objects
        if obj_name == "GuiCameraSettings":
            options[obj_name] = data
            continue

        if "color" in data:
            obj_data["ShapeColor"] = dict(
                type="App::PropertyColor", value=tuple(data["color"])
            )

        if "visibility" in data:
            obj_data["Visibility"] = dict(
                type="App::PropertyBool", value=data["visibility"]
            )

        gui_data[obj_name] = obj_data

    return gui_data


class FCStd:
    def __init__(self) -> None:
        self._sources = ""
        self._objects = []
        self._options = {}
        self._metadata = {}
        self._id = None
        self._visible = True
        self._prop_handlers: Dict[str, Type[BaseProp]] = {}
        for Cls in Props.__dict__.values():
            if isinstance(Cls, type) and issubclass(Cls, BaseProp):
                self._prop_handlers[Cls.name()] = Cls

    @property
    def sources(self):
        return self._sources

    @property
    def objects(self):
        return self._objects

    @property
    def metadata(self):
        return self._metadata

    @property
    def options(self):
        return self._options

    def load(self, base64_content: str) -> None:
        if not fc:
            return
        self._sources = base64_content
        with tempfile.NamedTemporaryFile(delete=False, suffix=".FCStd") as tmp:
            file_content = base64.b64decode(base64_content)
            tmp.write(file_content)

        fc_file = fc.app.openDocument(tmp.name)

        # Get metadata
        self._metadata = fc_file.Meta

        # Get GuiData (metadata from the GuiDocument.xml file)
        self._options["guidata"] = _guidata_to_options(
            OfflineRenderingUtils.getGuiData(tmp.name)
        )

        # Get objects
        self._objects = []
        for obj in fc_file.Objects:
            self._objects.append(self._fc_to_jcad_obj(obj))

        os.remove(tmp.name)

    def save(self, objects: List, options: Dict, metadata: Dict) -> None:
        try:
            if not fc or len(self._sources) == 0:
                return

            with tempfile.NamedTemporaryFile(delete=False, suffix=".FCStd") as tmp:
                file_content = base64.b64decode(self._sources)
                tmp.write(file_content)
            fc_file = fc.app.openDocument(tmp.name)
            fc_file.Meta = metadata
            new_objs = dict([(o["name"], o) for o in objects])

            current_objs = dict([(o.Name, o) for o in fc_file.Objects])

            to_remove = [x for x in current_objs if x not in new_objs]
            to_add = [x for x in new_objs if x not in current_objs]
            for obj_name in to_remove:
                fc_file.removeObject(obj_name)
            for obj_name in to_add:
                py_obj = new_objs[obj_name]
                fc_file.addObject(py_obj["shape"], py_obj["name"])
            to_update = [x for x in new_objs if x in current_objs] + to_add

            for obj_name in to_update:
                py_obj = new_objs[obj_name]

                fc_obj = fc_file.getObject(py_obj["name"])

                for prop, jcad_prop_value in py_obj["parameters"].items():
                    prop_type = fc_obj.getTypeIdOfProperty(prop)
                    prop_handler = self._prop_handlers.get(prop_type, None)
                    if prop_handler is not None:
                        fc_value = prop_handler.jcad_to_fc(
                            jcad_prop_value,
                            jcad_object=objects,
                            fc_prop=getattr(fc_obj, prop),
                            fc_object=fc_obj,
                            fc_file=fc_file,
                        )
                        if fc_value:
                            try:
                                setattr(fc_obj, prop, fc_value)
                            except Exception:
                                pass

            OfflineRenderingUtils.save(
                fc_file,
                guidata=_options_to_guidata(options.get("guidata", {})),
            )

            fc_file.recompute()
            with open(tmp.name, "rb") as f:
                encoded = base64.b64encode(f.read())
                self._sources = encoded.decode()
            os.remove(tmp.name)
        except Exception:
            print(traceback.print_exc())

    def _fc_to_jcad_obj(self, obj) -> Dict:
        obj_data = dict(
            shape=obj.TypeId,
            visible=obj.Visibility,
            parameters={},
            name=obj.Name,
        )
        for prop in obj.PropertiesList:
            prop_type = obj.getTypeIdOfProperty(prop)
            prop_value = getattr(obj, prop)
            prop_handler = self._prop_handlers.get(prop_type, None)
            if prop_handler is not None and prop_value is not None:
                value = prop_handler.fc_to_jcad(prop_value, fc_object=obj)
            else:
                value = None
            obj_data["parameters"][prop] = value
        return obj_data
