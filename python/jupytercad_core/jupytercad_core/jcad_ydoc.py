import json
from typing import Any, Callable
from functools import partial

from pycrdt import Array, Map, Text
from jupyter_ydoc.ybasedoc import YBaseDoc


class YJCad(YBaseDoc):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._ydoc["source"] = self._ysource = Text()
        self._ydoc["objects"] = self._yobjects = Array()
        self._ydoc["options"] = self._yoptions = Map()
        self._ydoc["metadata"] = self._ymetadata = Map()
        self._ydoc["outputs"] = self._youtputs = Map()

    def version(self) -> str:
        return "0.1.0"

    def get(self) -> str:
        """
        Returns the content of the document.
        :return: Document's content.
        :rtype: Any
        """
        objects = self._yobjects.to_py()
        options = self._yoptions.to_py()
        meta = self._ymetadata.to_py()
        outputs = self._youtputs.to_py()
        return json.dumps(
            dict(objects=objects, options=options, metadata=meta, outputs=outputs),
            indent=2,
        )

    def set(self, value: str) -> None:
        """
        Sets the content of the document.
        :param value: The content of the document.
        :type value: Any
        """
        valueDict = json.loads(value)
        newObj = []
        for obj in valueDict["objects"]:
            newObj.append(Map(obj))

        self._yobjects.clear()
        self._yobjects.extend(newObj)

        self._yoptions.clear()
        self._yoptions.update(valueDict.get("options", {}))

        self._ymetadata.clear()
        self._ymetadata.update(valueDict.get("metadata", {}))

        self._youtputs.clear()
        self._youtputs.update(valueDict.get("outputs", {}))

    def observe(self, callback: Callable[[str, Any], None]):
        self.unobserve()
        self._subscriptions[self._ystate] = self._ystate.observe(
            partial(callback, "state")
        )
        self._subscriptions[self._ysource] = self._ysource.observe(
            partial(callback, "source")
        )
        self._subscriptions[self._yobjects] = self._yobjects.observe_deep(
            partial(callback, "objects")
        )
        self._subscriptions[self._yoptions] = self._yoptions.observe_deep(
            partial(callback, "options")
        )
        self._subscriptions[self._ymetadata] = self._ymetadata.observe_deep(
            partial(callback, "meta")
        )
