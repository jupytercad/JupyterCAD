from abc import ABC, abstractmethod
from typing import Any


class BaseProp(ABC):
    @staticmethod
    @abstractmethod
    def name() -> str:
        pass

    @staticmethod
    @abstractmethod
    def fc_to_jcad(prop_value: Any, **kwargs) -> Any:
        """Method to translate a FreeCAD property into jcad property

        Keyword Args:
            prop_value (Any): Value of the FreeCAD property

            fc_object (FreeCAD object): The current FreeCAD object that
            we are reading.

        Returns:
            Any:
        """
        pass

    @staticmethod
    @abstractmethod
    def jcad_to_fc(prop_value: Any, **kwargs) -> Any:
        """Method to translate jcad property value into FreeCAD object

        Keyword Args:
            prop_value (Any): Value of the property

            jcad_object (List): The current list of jcad object

            fc_prop (FreeCAD object property): The current property that
            we are updating.

            fc_object (FreeCAD object): The current FreeCAD object that
            we are updating.

            fc_file (FreeCAD document): The current FreeCAD document.

        Returns:
            Any:
        """
        pass
