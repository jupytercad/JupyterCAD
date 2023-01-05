FROM quantstack/jupytercad-env:0.1.0

ARG MAMBA_DOCKERFILE_ACTIVATE=1
ARG NB_USER=jovyan
ARG NB_UID=1000
ENV USER ${NB_USER}
ENV NB_UID ${NB_UID}
ENV HOME /home/${NB_USER}

# Make sure the contents of our repo are in ${HOME}
COPY . ${HOME}
USER root
RUN chown -R ${NB_UID} ${HOME}
USER ${NB_USER}

WORKDIR ${HOME}
RUN python -m pip install .
RUN rm -rf node_modules
ENTRYPOINT ["bash", "binder/start"]
