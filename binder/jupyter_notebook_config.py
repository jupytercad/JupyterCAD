c.LabApp.collaborative = True
c.LabApp.token = ""
common = [
    "--no-browser",
    "--port={port}",
    "--ServerApp.ip=127.0.0.1",
    '--ServerApp.token=""',
    # Disable dns rebinding protection here, since our 'Host' header
    # is not going to be localhost when coming from hub.mybinder.org
    "--ServerApp.allow_remote_access=True",
]

lab_command = " ".join(
    [
        "jupyter",
        "lab",
        "--collaborative",
        "--ServerApp.base_url={base_url}cad-dev",
    ]
    + common
)

c.ServerProxy.servers = {
    "cad-dev": {
        "command": ["/bin/bash", "-c", lab_command],
        "timeout": 60,
        "absolute_url": True,
    },
}

c.NotebookApp.default_url = "/cad-dev"
