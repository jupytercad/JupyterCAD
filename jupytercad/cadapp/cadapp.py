import json
import os

import tornado
from jupyter_server.base.handlers import APIHandler, JupyterHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
)
from jupyterlab_server import LabServerApp

from .._version import __version__
from .utils import get_page_config

HERE = os.path.dirname(__file__)


class CADHandler(ExtensionHandlerJinjaMixin, ExtensionHandlerMixin, JupyterHandler):
    """Handle requests between the main app page and notebook server."""

    def get(self):
        """Get the main page for the application's interface."""
        page_config = get_page_config(self.base_url, self.name)
        page_config["token"] = self.settings["token"]
        return self.write(
            self.render_template(
                "index.html",
                static=self.static_url,
                base_url=self.base_url,
                token=self.settings["token"],
                page_config=page_config,
            )
        )


class BackendCheckHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        body = self.get_json_body()
        backend = body.get("backend")
        if backend == "FreeCAD":
            fc_installed = True
            try:
                pass
            except ImportError:
                fc_installed = False
            self.finish(json.dumps({"installed": fc_installed}))
        elif backend == "JCAD":
            self.finish(json.dumps({"installed": True}))
        else:
            self.finish(json.dumps({"installed": False}))


class CadApp(LabServerApp):
    extension_url = "/cad"
    default_url = "/cad"
    app_url = "/cad"
    load_other_extensions = True
    name = "cad"
    app_name = "JupyterCAD"
    static_dir = os.path.join(HERE, "static")
    templates_dir = os.path.join(HERE, "templates")
    app_version = __version__
    app_settings_dir = os.path.join(HERE, "static", "application_settings")
    schemas_dir = os.path.join(HERE, "schemas")
    themes_dir = os.path.join(HERE, "themes")
    user_settings_dir = os.path.join(HERE, "static", "user_settings")
    workspaces_dir = os.path.join(HERE, "static", "workspaces")

    def initialize_handlers(self):
        """Add cad handler to Lab Server's handler list."""
        self.handlers.append(("/cad", CADHandler))
        self.handlers.append(("/cad/backend-check", BackendCheckHandler))
        super().initialize_handlers()


main = CadApp.launch_instance
