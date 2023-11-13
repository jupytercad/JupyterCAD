import subprocess
from pathlib import Path


def execute(cmd: str):
    subprocess.run(cmd.split(" "), check=True)


def install_dev():
    root_path = Path(__file__).parents[1]
    requirements_build_path = root_path / "requirements-build.txt"
    install_build_deps = f"python -m pip install -r {requirements_build_path}"
    install_js_deps = "jlpm install"
    build_js = "jlpm build"

    python_package_prefix = "python"
    python_packages = ["jupytercad-core", "jupytercad-lab"]

    execute(install_build_deps)
    execute(install_js_deps)
    execute(build_js)
    for py_package in python_packages:
        execute(f"pip uninstall {py_package} -y")
        execute(f"pip install -e {python_package_prefix}/{py_package}")
        execute(
            f"jupyter labextension develop {python_package_prefix}/{py_package} --overwrite"
        )


if __name__ == "__main__":
    install_dev()
