# ML Studio

- [ML Studio](#ml-studio)
  - [Project Overview](#project-overview)
  - [Architecture Diagram](#architecture-diagram)
  - [Prerequisites](#prerequisites)
    - [System Requirements](#system-requirements)
    - [Connectivity](#connectivity)
  - [Getting Started (Docker)](#getting-started-docker)
    - [1. Build and Deploy](#1-build-and-deploy)
    - [2. Service Verification](#2-service-verification)
      - [**A. PostgreSQL Database (MLflow Metadata)**](#a-postgresql-database-mlflow-metadata)
      - [**B. MLflow UI (Port 5050)**](#b-mlflow-ui-port-5050)
      - [**C. ML Studio Backend (Port 5001)**](#c-ml-studio-backend-port-5001)
      - [**D. ML Studio UI (Port 3000)**](#d-ml-studio-ui-port-3000)
    - [3. Shutdown and Cleanup](#3-shutdown-and-cleanup)
  - [Project Structure](#project-structure)
  - [API Documentation](#api-documentation)
  - [MLflow Integration](#mlflow-integration)
  - [Development \& Testing](#development--testing)
  - [Known Issues \& Troubleshooting](#known-issues--troubleshooting)
  - [Roadmap / Future Enhancements](#roadmap--future-enhancements)
  - [License](#license)

## Project Overview

**ML Studio** is an enterprise-grade machine learning module integrated into the <a href="https://blendata.com/product/blendata-enterprise/">**Blendata Enterprise**</a> big data platform. While it leverages **MLflow** to handle the core machine learning lifecycle, it is specifically designed to overcome the limitations MLflow faces in large-scale organizational environments.

The project focuses on three key enhancements:

* **User Access Control (UAC):** Implementing a custom API layer to bridge Blendata’s enterprise security with MLflow, enabling robust multi-project permission management.
* **Bespoke User Interface:** Replacing the standard MLflow UI with a custom-built frontend to ensure visual consistency, improved user satisfaction, and seamless platform integration.
* **Standardized Operations:** Establishing "default" architectural and security protocols to automate server configuration, logging, and reliability, thereby reducing the risk of miscommunication and technical debt.

Ultimately, ML Studio transforms an open-source tool into a secure, consistent, and scalable platform for professional data science teams.

## Architecture Diagram

<img src="images/architecture.png">

According to the architecture diagram, there are 3 applications running in ML Studio system:

- **ML Studio application:** having React application as the frontend interacting Flask server as the backend
- **MLflow application:** having MLflow tracking server as the source of APIs accessing PostgreSQL database

Users can interact with ML Studio via either ML Studio application or notebooks. Also, both user interfaces are connected to MLflow application to access some assets in MLflow.

## Prerequisites

To ensure this project remains platform-independent and portable, all dependencies (Python libraries, Node modules, and system packages) are managed within Docker containers. The only requirements for the host machine are:

* **Docker:** Version 20.10.0 or higher.
* **Docker Compose:** Version 2.0.0 or higher (now included by default with Docker Desktop).

### System Requirements

* **Operating System:** Linux (Recommended: Nobara/Fedora/Ubuntu), macOS, or Windows 10/11 (with WSL2 enabled).
* **Hardware:** 
  * Minimum **8GB RAM** (To support simultaneous execution of MySQL, PostgreSQL, MLflow, two Flask backends, and a React development server).
  * Minimum **5GB Disk Space** (For base images and persistent database volumes).

### Connectivity

* **Internet Access:** Required for the initial build to pull base images (`python:3.11-slim`, `node:18-alpine`, `mysql:8.0`, `postgres:15`) and install dependencies via `pip` and `npm`.
* **Port Availability:** Ensure the following ports are not being used by other local services:
* `3000` (ML Studio web module)
* `5001` (ML Studio backend server)
* `5050` (MLflow UI)
* `5432` (PostgreSQL)

## Getting Started (Docker)

Follow these steps to build, deploy, and verify the ML Studio ecosystem. Ensure your Docker engine is running before starting.

### 1. Build and Deploy

Execute the following command to build the custom images for the Python backends and React frontend, and start all services in detached mode:

```bash
docker compose up --build -d

```

---

### 2. Service Verification

To ensure each module is functioning correctly, perform the following health checks:

#### **A. PostgreSQL Database (MLflow Metadata)**

Verify the metadata store for MLflow:

```bash
docker exec -it ml-studio-sim-pg-db-1 psql --user=blendata --dbname=mlflow

```

Inside the psql shell, run `\d` to list the internal MLflow tracking tables.

#### **B. MLflow UI (Port 5050)**

Access the experiment tracking dashboard by navigating to:
**URL:** `http://localhost:5050`

The resulting webpage should look like this:

<img src="images/mlflow-ui.png">

#### **C. ML Studio Backend (Port 5001)**

Verify the standalone ML Studio service:

```bash
curl localhost:5001

```

**Expected Response:** `{"message":"Welcome to ML Studio","service":"ml_studio","status":"Online"}`

#### **D. ML Studio UI (Port 3000)**

Access the custom React dashboard by navigating to:
**URL:** `http://localhost:3000`

The resulting webpage should look like this:

<img src="images/ml-studio-ui.png">

---

### 3. Shutdown and Cleanup

To stop the services while keeping your database data intact:

```bash
docker compose down

```

To perform a "Nuclear Reset" (deleting all containers, networks, and persistent data volumes), use the volume flag:

```bash
docker compose down -v

```

> **Note:** Use the `-v` flag with caution as it will permanently delete your MLflow experiment history and MySQL user data.

## Project Structure

[Map out the directory layout, explaining the purpose of the `/app`, `/cerberus`, and `/mlflow` subdirectories.]

---

## API Documentation

[List the available endpoints for the various Flask services (e.g., `/api/status`, `/api/data`) and briefly describe their inputs and outputs.]

## MLflow Integration

[Explain how to access the MLflow UI, where artifacts are stored, and how to point external scripts to the tracking server.]

---

## Development & Testing

[Outline how to run tests for individual services and how to use the provided Makefile for common tasks.]

## Known Issues & Troubleshooting

[Document common hurdles, such as the "Orphan Container" problem during branch switches or CORS issues between the frontend and backend.]

---

## Roadmap / Future Enhancements

[List upcoming features, such as adding Nginx as a Reverse Proxy or implementing the Causal AI learning roadmap.]

## License

[Specify the license type (e.g., MIT, Apache 2.0).]