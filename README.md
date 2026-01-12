# ML Studio

## Project Overview

**ML Studio** is an enterprise-grade machine learning module integrated into the <a href="https://blendata.com/product/blendata-enterprise/">**Blendata Enterprise**</a> big data platform. While it leverages **MLflow** to handle the core machine learning lifecycle, it is specifically designed to overcome the limitations MLflow faces in large-scale organizational environments.

The project focuses on three key enhancements:

* **User Access Control (UAC):** Implementing a custom API layer to bridge Blendata’s enterprise security with MLflow, enabling robust multi-project permission management.
* **Bespoke User Interface:** Replacing the standard MLflow UI with a custom-built frontend to ensure visual consistency, improved user satisfaction, and seamless platform integration.
* **Standardized Operations:** Establishing "default" architectural and security protocols to automate server configuration, logging, and reliability, thereby reducing the risk of miscommunication and technical debt.

Ultimately, ML Studio transforms an open-source tool into a secure, consistent, and scalable platform for professional data science teams.

## Architecture Diagram

[Insert a diagram or description of how the services interact, specifically the relationship between the Flask Backends, React Frontend, and the MySQL/PostgreSQL databases.]

---

## Prerequisites

[List the software needed to run the project, such as Docker, Docker Compose, and any specific versions of Node.js or Python used for local development.]

## Environment Configuration

[Detail the required `.env` variables or environment arguments needed for Docker, such as database credentials and MLflow tracking URIs.]

---

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