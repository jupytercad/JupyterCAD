import json
from pathlib import Path

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join, ApiPath, to_os_path
import tornado


class JCadExportHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        body = self.get_json_body()

        # Get filename removing the drive prefix
        file_name = body["path"].split(":")[1]
        export_name = body["newName"]

        root_dir = Path(self.contents_manager.root_dir).resolve()
        file_name = Path(to_os_path(ApiPath(file_name), str(root_dir)))

        with open(file_name, "r") as fobj:
            file_content = fobj.read()

        jcad = dict(
            objects=[
                dict(
                    name=Path(export_name).stem,
                    visible=True,
                    shape="Part::Any",
                    parameters=dict(
                        Content=file_content, Type=str(Path(Path(file_name).suffix[1:]))
                    ),
                )
            ],
            metadata={},
            options={},
            outputs={},
        )

        with open(Path(file_name).parents[0] / export_name, "w") as fobj:
            fobj.write(json.dumps(jcad, indent=2))

        self.finish(json.dumps({"done": True}))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "jupytercad", "export")
    handlers = [(route_pattern, JCadExportHandler)]
    web_app.add_handlers(host_pattern, handlers)
