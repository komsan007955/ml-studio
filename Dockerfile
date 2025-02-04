FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Spark
ENV SPARK_VERSION=3.4.4
RUN curl -fsSL "https://downloads.apache.org/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz" | tar -xz -C /opt/
ENV SPARK_HOME=/opt/spark-${SPARK_VERSION}-bin-hadoop3
ENV PATH=$SPARK_HOME/bin:$PATH

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy all project files into the container
COPY . .

# Expose ports (MLflow, Flask, Spark UI)
EXPOSE 5000 5001 4040 8080

# Start MLflow server by default
CMD nohup mlflow server --host 0.0.0.0 --port 5001 --backend-store-uri sqlite:///mlflow.db --default-artifact-root ./mlruns > mlflow.log 2>&1 & \
    python mlflow/mlflow_server.py
