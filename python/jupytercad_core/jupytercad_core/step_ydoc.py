import json
from typing import Any, Callable
from functools import partial

from pycrdt import Text
from jupyter_ydoc.ybasedoc import YBaseDoc


class YSTEP(YBaseDoc):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._ydoc["source"] = self._ysource = Text()

    def version(self) -> str:
        return "0.1.0"

    def get(self) -> str:
        """
        Returns the content of the document.
        :return: Document's content.
        :rtype: Any
        """
        return json.dumps(self._ysource.to_py())

    def set(self, value: str) -> None:
        """
        Sets the content of the document.
        :param value: The content of the document.
        :type value: Any
        """
        self._ysource[:] = value

    def observe(self, callback: Callable[[str, Any], None]):
        self.unobserve()
        self._subscriptions[self._ysource] = self._ysource.observe(
            partial(callback, "source")
        )
