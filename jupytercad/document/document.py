from cmath import log
from typing import Dict


class Document:
    def __init__(self, path: str) -> None:
        self._path = path

    def _ipython_display_(
        self,
    ) -> None:
        from IPython.display import display

        display({'application/FCStd': self._path}, raw=True)

    