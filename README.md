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
      - [**A. MySQL Database (Auth)**](#a-mysql-database-auth)
      - [**B. Cerberus API (Port 5000)**](#b-cerberus-api-port-5000)
      - [**C. PostgreSQL Database (MLflow Metadata)**](#c-postgresql-database-mlflow-metadata)
      - [**D. MLflow UI (Port 5050)**](#d-mlflow-ui-port-5050)
      - [**E. ML Studio Backend (Port 5001)**](#e-ml-studio-backend-port-5001)
      - [**F. ML Studio UI (Port 3000)**](#f-ml-studio-ui-port-3000)
    - [3. Shutdown and Cleanup](#3-shutdown-and-cleanup)
  - [Project Structure](#project-structure)
    - [Notable Files](#notable-files)
  - [API Documentation](#api-documentation)
    - [**Experiments API**](#experiments-api)
    - [**Runs API**](#runs-api)
    - [**Registered Models API**](#registered-models-api)
    - [**Model Versions API**](#model-versions-api)
    - [**Artifacts API**](#artifacts-api)
    - [**Standard Response Formats**](#standard-response-formats)
      - [**Success (200 OK)**](#success-200-ok)
      - [**Client Error (400 Bad Request)**](#client-error-400-bad-request)
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
- **Cerberus application:** having Flask server as the source of APIs accessing MySQL database
- **MLflow application:** having MLflow tracking server as the source of APIs accessing PostgreSQL database

Users can interact with ML Studio via either ML Studio application or notebooks. Each user interface can interact with Cerberus to operate some process related to user access control. Besides, both user interfaces are connected to MLflow application to access some assets in MLflow.

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
* `5000` (Cerberus API server)
* `5001` (ML Studio backend server)
* `5050` (MLflow UI)
* `3306` (MySQL)
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

#### **A. MySQL Database (Auth)**

Verify that the RBAC schema is correctly initialized:

```bash
docker compose exec db mysql -u blendata -p'#########' auth

```

Inside the MySQL shell, run `SHOW TABLES;`. You should see the following output:

```text
+-----------------+
| Tables_in_auth  |
+-----------------+
| component       |
| element         |
| operation       |
| permission      |
| user            |
| user_permission |
+-----------------+

```

#### **B. Cerberus API (Port 5000)**

Test the primary authentication and permission backend:

```bash
curl localhost:5000

```

**Success Output:** `Connected to database: auth`

#### **C. PostgreSQL Database (MLflow Metadata)**

Verify the metadata store for MLflow:

```bash
docker exec -it ml-studio-sim-pg-db-1 psql --user=blendata --dbname=mlflow

```

Inside the psql shell, run `\d` to list the internal MLflow tracking tables.

#### **D. MLflow UI (Port 5050)**

Access the experiment tracking dashboard by navigating to:
**URL:** `http://localhost:5050`

The resulting webpage should look like this:

<img src="images/mlflow-ui.png">

#### **E. ML Studio Backend (Port 5001)**

Verify the standalone ML Studio service:

```bash
curl localhost:5001

```

**Expected Response:** `{"message":"Welcome to ML Studio","service":"ml_studio","status":"Online"}`

#### **F. ML Studio UI (Port 3000)**

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

```
└── 📁ml-studio
    └── 📁app
        └── 📁ml_studio
            ├── functions.py
            ├── main.py
            ├── requirements.txt
        └── 📁mlflow
            ├── requirements.txt
        └── 📁ui
            └── 📁public
                ├── index.html
            └── 📁src
                ├── App.js
                ├── index.js
            ├── Dockerfile
            ├── package.json
        └── 📁zeppelin
            ├── test.ipynb
        ├── base_requirements.txt
    └── 📁images
        ├── architecture.png
        ├── ml-studio-ui.png
        ├── mlflow-ui.png
    ├── .gitignore
    ├── docker-compose.yml
    ├── Dockerfile
    ├── Makefile
    ├── README.md
    └── test-note.txt
```

Focusing on `app` as the main directory, we can see 5 sub-directories representing key servers of ML Studio:

- `ml_studio`: consists of
  - `main.py` as the main Python program running a Flask application
  - `function.py` to store key MLflow functions
- `mlflow`: doesn't rely on any program at the moment as it's a complete package since installation.
- `ui`: acts as the main directory of a React project responsible for ML Studio's UI.
- `zeppelin`: stores notebooks that calls MLflow. In this version, it's actually not a server but created to simulate a real Apache Zeppelin server.

### Notable Files

- `base_requirements.txt`: lists Python libraries commonly used across different servers (such as Flask).
- `docker-compose.yml`: lists Docker container compositions and their configurations.
- `Dockerfile`: orders commands used for container setup.
- `Makefile`: shortcuts frequently used commands to facilitate operation and testing process.

## API Documentation

ML Studio provides a RESTful API layer that bridges the **React Dashboard** with the **MLflow Tracking Server** and **Model Registry**. This section serves as the full reference for all available endpoints.

### **Experiments API**

Manage high-level containers for machine learning projects.

| Endpoint | Method | Parameters | Description |
| --- | --- | --- | --- |
| `/api/experiments/create` | `POST` | `name` (req), `artifact_location`, `tags` | Create a new experiment. |
| `/api/experiments/search` | `POST` | `max_results`, `filter`, `view_type`, `order_by` | Search experiments using SQL-like filters. |
| `/api/experiments/get` | `GET` | `experiment_id` (req) | Fetch metadata for a specific ID. |
| `/api/experiments/get-by-name` | `GET` | `experiment_name` (req) | Fetch metadata using the unique name. |
| `/api/experiments/update` | `POST` | `experiment_id` (req), `new_name` (req) | Rename an existing experiment. |
| `/api/experiments/delete` | `POST` | `experiment_id` (req) | Mark an experiment for deletion. |
| `/api/experiments/restore` | `POST` | `experiment_id` (req) | Restore a deleted experiment. |
| `/api/experiments/set-tag` | `POST` | `experiment_id` (req), `key` (req), `value` (req) | Set a tag on an experiment. |
| `/api/experiments/delete-tag` | `POST` | `experiment_id` (req), `key` (req) | Remove a tag from an experiment. |

---

### **Runs API**

Interact with individual execution instances and their data.

| Endpoint | Method | Parameters | Description |
| --- | --- | --- | --- |
| `/api/runs/search` | `POST` | `experiment_ids` (req), `filter`, `max_results` | Query runs across multiple experiments. |
| `/api/runs/get` | `GET` | `run_id` (req) | Get full details (params, metrics, tags). |
| `/api/runs/update` | `POST` | `run_id` (req), `status`, `run_name` | Update run status or rename a run. |
| `/api/runs/delete` | `POST` | `run_id` (req) | Delete a specific run. |
| `/api/runs/restore` | `POST` | `run_id` (req) | Restore a deleted run. |
| `/api/runs/set-tag` | `POST` | `run_id` (req), `key` (req), `value` (req) | Set a tag on a specific run. |
| `/api/runs/delete-tag` | `POST` | `run_id` (req), `key` (req) | Delete a tag from a specific run. |
| `/api/metrics/get-history` | `GET` | `run_id` (req), `metric_key` (req) | Fetch all logged values for a specific metric. |

---

### **Registered Models API**

Manage the lifecycle and aliases of registered models.

| Endpoint | Method | Parameters | Description |
| --- | --- | --- | --- |
| `/api/models/create` | `POST` | `name` (req), `tags`, `description` | Register a new model name. |
| `/api/models/get` | `GET` | `name` (req) | Get metadata for a registered model. |
| `/api/models/search` | `GET` | `filter`, `max_results`, `order_by` | List and search registered models. |
| `/api/models/rename` | `POST` | `name` (req), `new_name` (req) | Change the name of a registered model. |
| `/api/models/update` | `PATCH` | `name` (req), `description`, `deployment_job_id` | Update model metadata. |
| `/api/models/delete` | `DELETE` | `name` (req) | Remove a model and all versions. |
| `/api/models/set-tag` | `POST` | `name` (req), `key` (req), `value` (req) | Set a tag for a registered model. |
| `/api/models/delete-tag` | `DELETE` | `name` (req), `key` (req) | Delete a tag for a registered model. |
| `/api/models/alias` | `POST/DELETE` | `name` (req), `alias` (req), `version` | Set or delete a model version alias. |

---

### **Model Versions API**

Track specific iterations and transition them through stages.

| Endpoint | Method | Parameters | Description |
| --- | --- | --- | --- |
| `/api/models/versions/latest` | `POST` | `name` (req), `stages` | Get the latest versions for specific stages. |
| `/api/models/versions/create` | `POST` | `name` (req), `source` (req), `run_id` | Log a new version of a model. |
| `/api/models/versions/get` | `GET` | `name` (req), `version` (req) | Get details for a specific version. |
| `/api/models/versions/get-by-alias` | `GET` | `name` (req), `alias` (req) | Fetch a version via its assigned alias. |
| `/api/models/versions/search` | `GET` | `filter`, `max_results` | Search through model versions. |
| `/api/models/versions/update` | `PATCH` | `name` (req), `version` (req), `description` | Update version description. |
| `/api/models/versions/transition` | `POST` | `name`, `version`, `stage` (req) | Move to `Staging`, `Production`, etc. |
| `/api/models/versions/download-uri` | `GET` | `name` (req), `version` (req) | Get the URI to download model artifacts. |
| `/api/models/versions/delete` | `DELETE` | `name` (req), `version` (req) | Delete a specific model version. |
| `/api/models/versions/set-tag` | `POST` | `name`, `version`, `key`, `value` | Set a tag for a model version. |
| `/api/models/versions/delete-tag` | `DELETE` | `name`, `version`, `key` | Delete a tag from a model version. |

---

### **Artifacts API**

Browse files generated during execution.

| Endpoint | Method | Parameters | Description |
| --- | --- | --- | --- |
| `/api/artifacts/list` | `GET` | `run_id` (req), `path` | List files in a specific artifact directory. |

---

### **Standard Response Formats**

#### **Success (200 OK)**

Returns the JSON object directly from the internal `fn` (MLflow) logic.

#### **Client Error (400 Bad Request)**

Returned when required parameters are missing.

```json
{
  "error": "'parameter_name' is required"
}

```

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