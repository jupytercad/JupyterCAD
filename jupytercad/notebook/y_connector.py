import json
import logging
from typing import Dict, Optional
from ypywidgets.ypywidgets import Widget

logger = logging.getLogger(__file__)


class YDocConnector(Widget):
    def __init__(self, path: str, **kwargs) -> None:
        super().__init__(name='@jupytercad:widget', open_comm=True)
        self.path = path
        try:
            ext = path.split('.')[1].lower()
        except Exception:
            raise Exception('Can not detect file extension!')
        if ext == 'fcstd':
            self._format = 'base64'
            self._contentType = 'FCStd'
        elif ext == 'jcad':
            self._format = 'text'
            self._contentType = 'jcad'
        else:
            raise Exception('File extension is not supported!')

    @property
    def room_name(self):
        return self.comm_id

    def disconnect_room(self):
        pass

    def connect_room(self):
        from IPython.display import display

        if self.comm_id:
            display(
                {
                    'application/FCStd': json.dumps(
                        {
                            'commId': self.comm_id,
                            'path': self.path,
                            'format': self._format,
                            'contentType': self._contentType,
                        }
                    )
                },
                raw=True,
            )

        return True

    def _repr_mimebundle_(self, **kwargs):
        pass
