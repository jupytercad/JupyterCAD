"""Server configuration for integration tests.

!! Never use this configuration in production because it
opens the server to the world and provide access to JupyterLab
JavaScript objects through the global window variable.
"""

from jupyterlab.galata import configure_jupyter_server

configure_jupyter_server(c)
c.LabApp.collaborative = True
# Uncomment to set server log level to debug level
# c.ServerApp.log_level = "DEBUG"
