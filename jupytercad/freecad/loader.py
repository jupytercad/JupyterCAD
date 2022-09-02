import freecad as fc
import tempfile
import base64
import os


class FCStd:
    def __init__(self) -> None:
        self._sources = ''
        self._objects = {}
        self._options = {}

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
            print('###########', obj.PropertiesList)
        os.unlink(tmp.name)
