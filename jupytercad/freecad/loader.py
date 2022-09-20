import traceback
from typing import Dict, List
import tempfile
import base64
import os

from .props.base_prop import BaseProp
from . import props as Props
import logging

logger = logging.getLogger(__file__)

try:
    import freecad as fc
except ImportError:
    logger.warn('[JupyterCad] Freecad is not installed!')
    fc = None


class FCStd:
    def __init__(self) -> None:
        self._sources = ''
        self._objects = []
        self._options = {}
        self._id = None
        self._visible = True
        self._prop_handlers: Dict[str, BaseProp] = {}
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
    def options(self):
        return self._options

    def load(self, base64_content: str) -> None:
        if not fc:
            return
        self._sources = base64_content
        with tempfile.NamedTemporaryFile(delete=False, suffix='.FCStd') as tmp:
            file_content = base64.b64decode(base64_content)
            tmp.write(file_content)

        fc_file = fc.app.openDocument(tmp.name)
        for obj in fc_file.Objects:
            self._objects.append(self._fc_to_jcad_obj(obj))
        os.remove(tmp.name)

    def save(self, objects: List, options: Dict) -> None:
        try:

            if not fc or len(self._sources) == 0:
                return

            with tempfile.NamedTemporaryFile(
                delete=False, suffix='.FCStd'
            ) as tmp:
                file_content = base64.b64decode(self._sources)
                tmp.write(file_content)
            fc_file = fc.app.openDocument(tmp.name)
            new_objs = dict([(o['name'], o) for o in objects])
            current_objs = dict([(o.Name, o) for o in fc_file.Objects])
            to_remove = [x for x in current_objs if x not in new_objs]
            to_add = [x for x in new_objs if x not in current_objs]
            for obj_name in to_remove:
                fc_file.removeObject(obj_name)
            for obj_name in to_add:
                py_obj = new_objs[obj_name]
                fc_file.addObject(py_obj['shape'], py_obj['name'])
            to_update = [x for x in new_objs if x in current_objs] + to_add

            for obj_name in to_update:
                py_obj = new_objs[obj_name]

                fc_obj = fc_file.getObject(py_obj['name'])

                for prop, prop_value in py_obj['parameters'].items():
                    prop_type = fc_obj.getTypeIdOfProperty(prop)
                    prop_handler = self._prop_handlers.get(prop_type, None)
                    if prop_handler is not None:
                        fc_value = prop_handler.jcad_to_fc(
                            prop_value, objects, fc_file
                        )
                        setattr(fc_obj, prop, fc_value)

            fc_file.save()
            fc_file.recompute()
            with open(tmp.name, 'rb') as f:
                encoded = base64.b64encode(f.read())
                self._sources = encoded.decode()
            os.remove(tmp.name)
        except Exception:
            print(traceback.print_exc())

    def _fc_to_jcad_obj(self, obj) -> Dict:
        obj_data = {
            'shape': obj.TypeId,
            'id': obj.ID,
            'visible': obj.Visibility,
            'parameters': {},
            'name': obj.Name,
        }
        for prop in obj.PropertiesList:
            prop_type = obj.getTypeIdOfProperty(prop)
            prop_value = getattr(obj, prop)
            prop_handler = self._prop_handlers.get(prop_type, None)
            if prop_handler is not None:
                value = prop_handler.fc_to_jcad(prop_value, None, obj)
            else:
                value = None
            obj_data['parameters'][prop] = value
        return obj_data
