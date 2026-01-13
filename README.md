# ML Studio

## Project Overview

**ML Studio** is an enterprise-grade machine learning module integrated into the <a href="https://blendata.com/product/blendata-enterprise/">**Blendata Enterprise**</a> big data platform. While it leverages **MLflow** to handle the core machine learning lifecycle, it is specifically designed to overcome the limitations MLflow faces in large-scale organizational environments.

The project focuses on three key enhancements:

* **User Access Control (UAC):** Implementing a custom API layer to bridge Blendata’s enterprise security with MLflow, enabling robust multi-project permission management.
* **Bespoke User Interface:** Replacing the standard MLflow UI with a custom-built frontend to ensure visual consistency, improved user satisfaction, and seamless platform integration.
* **Standardized Operations:** Establishing "default" architectural and security protocols to automate server configuration, logging, and reliability, thereby reducing the risk of miscommunication and technical debt.

Ultimately, ML Studio transforms an open-source tool into a secure, consistent, and scalable platform for professional data science teams.

## Architecture Diagram

<img src="architecture.png">

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
* **Hardware:** * Minimum **8GB RAM** (To support simultaneous execution of MySQL, PostgreSQL, MLflow, two Flask backends, and a React development server).
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

[Provide the steps to build and launch the entire ecosystem using Docker Compose.]

```bash
# Example Command
[Command]

```

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