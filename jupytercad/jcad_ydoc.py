import json
from jupyter_ydoc.ydoc import YBaseDoc


class YJCad(YBaseDoc):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        print('init')
        self._ysource = self._ydoc.get_text('source')
        self._yobjects = self._ydoc.get_array('objects')
        self._yoptions = self._ydoc.get_map('options')

    @property
    def source(self):
        objects = self._yobjects.to_json()
        option = self._yoption.to_json()
        return dict(objects=objects, option=option)

    @source.setter
    def source(self, value):
        print('in jcad', value)
        valueDict = json.loads(value)
        with self._ydoc.begin_transaction() as t:
            self._yobjects.extend(t, valueDict['objects'])
            self._yoptions.update(t, valueDict['options'].items())

    def observe(self, callback):
        self.unobserve()
        self._subscriptions[self._ystate] = self._ystate.observe(callback)
        self._subscriptions[self._ysource] = self._ysource.observe(callback)
        self._subscriptions[self._yobjects] = self._yobjects.observe_deep(
            callback
        )
        self._subscriptions[self._yoptions] = self._yoptions.observe(callback)
