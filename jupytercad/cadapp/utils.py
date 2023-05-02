from .._version import __version__
from jupyter_server.utils import url_path_join
from jupyterlab_server.config import get_page_config as gpc
from jupyter_server.config_manager import recursive_update
from jupyter_core.paths import jupyter_path


def get_page_config(base_url, app_name):
    page_config = {
        "appVersion": __version__,
        "baseUrl": base_url,
        "terminalsAvailable": False,
        "fullStaticUrl": url_path_join(base_url, "static", app_name),
        "fullLabextensionsUrl": url_path_join(base_url, "lab", "extensions"),
        "fullSettingsUrl": url_path_join(base_url, "lab", "api", "settings"),
        "settingsUrl": url_path_join(base_url, "lab", "api", "settings"),
        "themesUrl": "/lab/api/themes",
        "appUrl": "/lab",
        "frontendUrl": url_path_join(base_url, app_name),
    }

    labextensions_path = jupyter_path("labextensions")
    recursive_update(
        page_config,
        gpc(labextensions_path),
    )
    return page_config
