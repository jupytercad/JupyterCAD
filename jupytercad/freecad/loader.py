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

        with tempfile.NamedTemporaryFile(delete=False, suffix='.FCStd') as tmp:
            file_content = base64.b64decode(base64_content)
            tmp.write(file_content)

        fc_file = fc.app.openDocument(tmp.name)
        for obj in fc_file.Objects:
            self._objects.append(self._fc_to_jcad_obj(obj))
        os.unlink(tmp.name)

    def _fc_to_jcad_obj(self, obj) -> Dict:
        obj_data = {
            'shape': obj.TypeId,
            'id': obj.ID,
            'visible': obj.Visibility,
            'parameters': {},
        }
        for prop in obj.PropertiesList:
            propType = obj.getTypeIdOfProperty(prop)
            propValue = getattr(obj, prop)
            if propType == 'Part::PropertyPartShape':
                continue
            if propType == 'App::PropertyLength':
                value = propValue.Value
            else:
                try:
                    value = json.loads(json.dumps(propValue))
                except Exception:
                    value = str(propValue)
            obj_data['parameters'][prop] = value
        return obj_data
