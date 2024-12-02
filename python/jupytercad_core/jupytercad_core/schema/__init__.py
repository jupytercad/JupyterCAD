from .interfaces.box import IBox  # noqa
from .interfaces.cone import ICone  # noqa
from .interfaces.cut import ICut  # noqa
from .interfaces.cylinder import ICylinder  # noqa
from .interfaces.extrusion import IExtrusion  # noqa
from .interfaces.fuse import IFuse  # noqa
from .interfaces.intersection import IIntersection  # noqa
from .interfaces.jcad import Parts, ShapeMetadata  # noqa
from .interfaces.sphere import ISphere  # noqa
from .interfaces.torus import ITorus  # noqa
from .interfaces.chamfer import IChamfer  # noqa
from .interfaces.fillet import IFillet  # noqa
from .interfaces.any import IAny  # noqa

from .interfaces.jcad import IJCadContent

SCHEMA_VERSION = IJCadContent.model_fields["schemaVersion"].default  # noqa
