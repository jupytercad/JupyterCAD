import os

on_rtd = os.environ.get("READTHEDOCS", None) == "True"

html_theme = "pydata_sphinx_theme"
html_theme_options = {"github_url": "https://github.com/jupytercad/JupyterCAD"}

extensions = [
    "sphinx.ext.autodoc",
    "sphinx_autodoc_typehints",
    "sphinx.ext.intersphinx",
    "sphinx.ext.napoleon",
]

source_suffix = ".rst"
master_doc = "index"
project = "JupyterCAD"
copyright = "2023, The JupyterCAD Development Team"
author = "The JupyterCAD Development Team"
language = "en"

exclude_patterns = []
highlight_language = "python"
pygments_style = "sphinx"
todo_include_todos = False
htmlhelp_basename = "jupytercaddoc"

intersphinx_mapping = {"python": ("https://docs.python.org/3", None)}
