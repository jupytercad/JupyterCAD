import asyncio
import json
import logging
import os
from typing import Dict, List, Optional
from urllib.parse import quote
import requests
import y_py as Y

from websockets.legacy.client import WebSocketClientProtocol, connect
from ypy_websocket.websocket_provider import WebsocketProvider

from .utils import multi_urljoin
import logging

logger = logging.getLogger(__file__)


FILE_PATH_TO_ROOM_ID_URL = 'api/yjs/roomid'
WS_YROOM_URL = 'api/yjs'

JUPYTERCAD_ENV = '__JUPYTERCAD_SERVER_INFO__'


class YDocConnector:

    def __init__(
        self, path: str, server_info: Optional[Dict[str, str]] = None, **kwargs
    ) -> None:
        super().__init__(**kwargs)
        self.path = path
        self._ws: Optional[WebSocketClientProtocol] = None
        self._doc: Optional[Y.YDoc] = None
        self.server_info = server_info
        if not self.server_info:
            self.server_info = self.__parse_env_variable()
        self._start_task: Optional[asyncio.Task] = None

    def __parse_env_variable(self) -> Optional[Dict[str, str]]:
        env_str = os.environ.get(JUPYTERCAD_ENV, None)
        if env_str:
            return json.loads(env_str)

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
            await asyncio.sleep(0.5)


    def disconnect_room(self) -> None:
        self._stop_task = asyncio.create_task(self.__stop())

    def connect_room(self) -> None:
        if self.server_info is None:
            logger.debug('Missing server information')
            return
        base_url = self.server_info['baseUrl']
        base_ws_url = self.server_info['wsUrl']
        token = self.server_info['token']
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

        self._start_task = asyncio.create_task(self.__start(ws_url))

    
    async def connected(self) -> bool:
        if not self._start_task:
            return False
        while not self._start_task.done():
            await asyncio.sleep(0.5) # Recheck after 0.5s

        return True
    
    @property
    def ydoc(self):
        return self._doc
