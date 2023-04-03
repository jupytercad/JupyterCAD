import os

from jupyter_server.base.handlers import JupyterHandler
from jupyter_server.extension.handler import (
    ExtensionHandlerMixin,
    ExtensionHandlerJinjaMixin
)
from jupyterlab_server import LabServerApp
from jupyter_server.utils import url_path_join as ujoin

from ._version import __version__

HERE = os.path.dirname(__file__)


class CADHandler(
    ExtensionHandlerJinjaMixin,
    ExtensionHandlerMixin,
    JupyterHandler
        ):
    """Handle requests between the main app page and notebook server."""

    def get(self):
        """Get the main page for the application's interface."""
        config_data = {
            # Use camelCase here, since that's what the lab components expect
            "appVersion": __version__,
            'baseUrl': self.base_url,
            'token': self.settings['token'],
            'fullStaticUrl': ujoin(self.base_url, 'static'),
            'frontendUrl': ujoin(self.base_url, 'cad/'),
        }
        return self.write(
            self.render_template(
                'index.html',
                static=self.static_url,
                base_url=self.base_url,
                token=self.settings['token'],
                page_config=config_data
                )
            )


class CADApp(LabServerApp):

    extension_url = '/cad'
    default_url = '/cad'
    app_url = "/cad"
    load_other_extensions = True
    name = "cad"
    app_name = 'JupyterCAD'
    static_dir = os.path.join(HERE, 'static')
    templates_dir = os.path.join(HERE, 'templates')
    app_version = __version__
    app_settings_dir = os.path.join(HERE, 'static', 'application_settings')
    schemas_dir = os.path.join(HERE, 'schemas')
    themes_dir = os.path.join(HERE, 'themes')
    user_settings_dir = os.path.join(HERE, 'static', 'user_settings')
    workspaces_dir = os.path.join(HERE, 'static', 'workspaces')

    def initialize_handlers(self):
        """Add cad handler to Lab Server's handler list.
        """
        super().initialize_handlers()
        self.handlers.append(('/cad', CADHandler))
        print(self.handlers)


main = CADApp.launch_instance
