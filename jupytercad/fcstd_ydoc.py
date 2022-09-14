from jupyter_ydoc.ydoc import YBaseDoc
import y_py as Y

from jupytercad.freecad.loader import FCStd


class YFCStd(YBaseDoc):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._ysource = self._ydoc.get_text('source')
        self._yobjects = self._ydoc.get_array('objects')
        self._yoptions = self._ydoc.get_map('options')
        self._virtual_file = FCStd()

    @property
    def source(self):
        fc_objects = self._yobjects.to_json()
        options = self._yoptions.to_json()
        self._virtual_file.save(fc_objects, options)
        return self._virtual_file.sources

    @source.setter
    def source(self, value):
        virtual_file = self._virtual_file
        virtual_file.load(value)
        newObj = []
        for obj in virtual_file.objects:
            newObj.append(Y.YMap(obj))
        with self._ydoc.begin_transaction() as t:
            length = len(self._yobjects)
            self._yobjects.delete_range(t, 0, length)

            self._yobjects.extend(t, newObj)
            self._yoptions.update(t, virtual_file.options.items())

    def observe(self, callback):
        self.unobserve()
        self._subscriptions[self._ystate] = self._ystate.observe(callback)
        self._subscriptions[self._ysource] = self._ysource.observe(callback)
        self._subscriptions[self._yobjects] = self._yobjects.observe_deep(
            callback
        )
        self._subscriptions[self._yoptions] = self._yoptions.observe(callback)
