FROM python:3.11.4-bookworm
WORKDIR /srv

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV POETRY_VERSION=1.7.1
ENV PATH="/root/.local/bin/:${PATH}"
ENV PYTHONPATH="/srv"
ENV SHELL="/bin/bash"

RUN apt-get update && \
    apt-get install -y  \
    vim \
    curl \
    git

# copy over package requirements
COPY poetry.lock pyproject.toml /srv/

# install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
RUN poetry config virtualenvs.create false

# install deps
RUN poetry install

# copy over other project files
COPY . /srv

CMD ["uvicorn", "app.main:app", "--port", "80", "--host", "0.0.0.0"]