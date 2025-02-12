from enum import Enum
from urllib.parse import urljoin


class MESSAGE_ACTION(str, Enum):
    CONNECT_ROOM = "connect_room"
    DISCONNECT_ROOM = "disconnect_room"


def multi_urljoin(*parts) -> str:
    if len(parts) == 0:
        return ""
    return urljoin(
        parts[0],
        "/".join(part for part in parts[1:]),
    )
