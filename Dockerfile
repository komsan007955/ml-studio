# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory
WORKDIR /cerberus

# 1. Install system dependencies needed to build mysqlclient
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libmariadb-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Python dependencies
COPY cerberus/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY cerberus/ .

# Expose the Flask port
EXPOSE 5000

# Run the application
CMD ["python", "main.py"]