from contextlib import contextmanager, redirect_stderr, redirect_stdout
from os import devnull


@contextmanager
def redirect_stdout_stderr():
    """A context manager that redirects stdout and stderr to devnull"""
    with open(devnull, "w") as fnull:
        with redirect_stderr(fnull) as err, redirect_stdout(fnull) as out:
            yield (err, out)
