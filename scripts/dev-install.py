import subprocess
from pathlib import Path


def install_dev():
    root_path = Path(__file__).parents[1]
    requirements_build_path = root_path / "requirements-build.txt"
    install_build_deps = f"python -m pip install -r {requirements_build_path}"
    install_js_deps = "jlpm install"
    build_js = "jlpm build"

    python_packages = ["python/jupytercad-core"]

    subprocess.run(install_build_deps.split(" "), check=True)
    subprocess.run(install_js_deps.split(" "), check=True)
    subprocess.run(build_js.split(" "), check=True)
    for py_package in python_packages:
        subprocess.run(f"pip install -e {py_package}".split(" "), check=True)
        subprocess.run(
            f"jupyter labextension develop {py_package} --overwrite".split(" "),
            check=True,
        )


if __name__ == "__main__":
    install_dev()
