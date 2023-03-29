import json

import y_py as Y
from jupyter_ydoc.ybasedoc import YBaseDoc


class YJCad(YBaseDoc):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._ysource = self._ydoc.get_text('source')
        self._yobjects = self._ydoc.get_array('objects')
        self._yoptions = self._ydoc.get_map('options')
        self._ymeta = self._ydoc.get_map('metadata')
    
    def get(self) -> str:
        """
        Returns the content of the document.
        :return: Document's content.
        :rtype: Any
        """
        objects = self._yobjects.to_json()
        options = self._yoptions.to_json()
        meta = self._ymeta.to_json()
        return json.dumps(
            dict(objects=objects, options=options, metadata=meta), indent=2
        )

    def set(self, value: str) -> None:
        """
        Sets the content of the document.
        :param value: The content of the document.
        :type value: Any
        """
        valueDict = json.loads(value)
        newObj = []
        for obj in valueDict['objects']:
            newObj.append(Y.YMap(obj))
        with self._ydoc.begin_transaction() as t:
            length = len(self._yobjects)
            self._yobjects.delete_range(t, 0, length)

            self._yobjects.extend(t, newObj)
            self._yoptions.update(t, valueDict['options'].items())
            self._ymeta.update(t, valueDict['metadata'].items())

    def observe(self, callback):
        self.unobserve()
        self._subscriptions[self._ystate] = self._ystate.observe(callback)
        self._subscriptions[self._ysource] = self._ysource.observe(callback)
        self._subscriptions[self._yobjects] = self._yobjects.observe_deep(
            callback
        )
        self._subscriptions[self._yoptions] = self._yoptions.observe(callback)
        self._subscriptions[self._ymeta] = self._ymeta.observe(callback)
