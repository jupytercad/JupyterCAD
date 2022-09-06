import json
from typing import Dict
import freecad as fc
import tempfile
import base64
import os


class FCStd:
    def __init__(self) -> None:
        self._sources = ''
        self._objects = []
        self._options = {}
        self._id = None
        self._visible = True

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
        self._sources = base64_content
        with tempfile.NamedTemporaryFile(delete=False, suffix='.FCStd') as tmp:
            file_content = base64.b64decode(base64_content)
            tmp.write(file_content)

        fc_file = fc.app.openDocument(tmp.name)
        for obj in fc_file.Objects:
            self._objects.append(self._fc_to_jcad_obj(obj))
        os.remove(tmp.name)

    def save(self, objects: Dict, options: Dict) -> None:

        if len(self._sources) == 0:
            return

        with tempfile.NamedTemporaryFile(delete=False, suffix='.FCStd') as tmp:
            file_content = base64.b64decode(self._sources)
            tmp.write(file_content)
        fc_file = fc.app.openDocument(tmp.name)
        new_objs = dict([(o['name'], o) for o in objects])
        current_objs = [o.Name for o in fc_file.Objects]
        to_remove = [x for x in current_objs if x not in new_objs]
        to_add = [x for x in new_objs if x not in current_objs]

        for obj_name in to_remove:
            fc_file.removeObject(obj_name)
        for obj_name in to_add:
            py_obj = objects[obj_name]
            fc_file.addObject(py_obj['shape'], py_obj['name'])
        to_update = [x for x in new_objs if x in current_objs] + to_add
        for obj_name in to_update:
            py_obj = new_objs[obj_name]
            fc_obj = fc_file.getObject(py_obj['name'])
            for prop, prop_value in py_obj['parameters'].items():
                prop_type = fc_obj.getTypeIdOfProperty(prop)
                if prop_type in ['App::PropertyLength']:
                    setattr(fc_obj, prop, prop_value)

        fc_file.save()
        fc_file.recompute()
        with open(tmp.name, 'rb') as f:
            encoded = base64.b64encode(f.read())
            self._sources = encoded.decode()
        os.remove(tmp.name)

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
            if prop_type == 'Part::PropertyPartShape':
                continue
            if prop_type == 'App::PropertyLength':
                value = prop_value.Value
            else:
                try:
                    value = json.loads(json.dumps(prop_value))
                except Exception:
                    value = str(prop_value)
            obj_data['parameters'][prop] = value
        return obj_data
