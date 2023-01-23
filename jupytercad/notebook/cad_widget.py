import asyncio
import json
from typing import Dict, List, Optional
from urllib.parse import quote

import requests
import y_py as Y
from ipywidgets import DOMWidget
from traitlets import Unicode
from websockets.legacy.client import WebSocketClientProtocol, connect
from ypy_websocket import WebsocketProvider

from ._frontend import module_name, module_version
from .utils import MESSAGE_ACTION, multi_urljoin

FILE_PATH_TO_ROOM_ID_URL = 'api/yjs/roomid'
WS_YROOM_URL = 'api/yjs'


class CadWidget(DOMWidget):

    _model_name = Unicode('JupyterCadWidgetModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('JupyterCadWidgetView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    path = Unicode(None, allow_none=True).tag(sync=True)

    def __init__(self, path: str, **kwargs) -> None:
        super().__init__(**kwargs)
        self.path = path
        self.on_msg(self.__handle_frontend_msg)
        self._ws: Optional[WebSocketClientProtocol] = None
        self._doc: Optional[Y.YDoc] = None

    async def __stop(self):
        if self._ws:
            await self._ws.close(1000)
        self._ws = None
        self._doc = None

    async def __start(self, ws_url):
        if self._ws is None and self._doc is None:
            self._doc = Y.YDoc()
            self._ws = await connect(ws_url)
            WebsocketProvider(self._doc, self._ws)

    def __connect_room(self, payload: Dict) -> None:
        base_url = payload['baseUrl']
        base_ws_url = payload['wsUrl']
        token = payload['token']
        path = quote(self.path, safe="()*!'")
        fileFormat = 'base64'
        fileType = 'FCStd'
        url = multi_urljoin(base_url, FILE_PATH_TO_ROOM_ID_URL, path)
        headers = {
            'Authorization': f'token {token}',
            'Content-Type': 'application/json',
        }
        response = requests.put(
            url,
            headers=headers,
            data=json.dumps({'format': fileFormat, 'type': fileType}),
        )
        room_name = response.text
        ws_url = (
            multi_urljoin(base_ws_url, WS_YROOM_URL, room_name)
            + f'?token={token}'
        )
        asyncio.create_task(self.__start(ws_url))

    def __handle_frontend_msg(
        self, model: 'CadWidget', msg: Dict, buffer: List
    ) -> None:
        if msg['action'] == MESSAGE_ACTION.CONNECT_ROOM:
            self.__connect_room(msg['payload'])
        elif msg['action'] == MESSAGE_ACTION.DISCONNECT_ROOM:
            asyncio.create_task(self.__stop())

    @property
    def ydoc(self):
        return self._doc
