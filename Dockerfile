# Use an official Python runtime as a parent image
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libmariadb-dev \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY app/base_requirements.txt /tmp/base_requirements.txt
RUN pip install --no-cache-dir -r /tmp/base_requirements.txt

RUN chmod -R 777 /app
USER root

ARG APP_NAME=mlflow

COPY app/${APP_NAME}/requirements.txt /tmp/app_requirements.txt
RUN pip install --no-cache-dir -r /tmp/app_requirements.txt


ARG APP_NAME=ml_studio

COPY app/${APP_NAME}/requirements.txt /tmp/app_requirements.txt
# RUN pip install --no-cache-dir -r /tmp/app_requirements.txt

COPY . .

EXPOSE 5001

ENV APP_PATH=app/${APP_NAME}/main.py
CMD python ${APP_PATH}