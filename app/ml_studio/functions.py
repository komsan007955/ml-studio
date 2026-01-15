import requests

url = "http://localhost:5050/api/2.0/mlflow"
headers = {"Content-Type": "application/json"}
MAX_RESULTS = 500


# =========================
# Experiments
# =========================

def create_experiment(name, artifact_location=None, tags=None):
    res = requests.post(
        f"{url}/experiments/create",
        headers=headers,
        json={
            "name": name,
            "artifact_location": artifact_location, 
            "tags": tags
        }
    )
    return res.json() if res.status_code == 200 else res.text


def search_experiments(max_results=MAX_RESULTS, page_token=None, filter=None, order_by=None, view_type="ACTIVE_ONLY"):
    res = requests.post(
        f"{url}/experiments/search",
        headers=headers,
        json={
            "max_results": max_results, 
            "page_token": page_token, 
            "filter": filter, 
            "order_by": order_by, 
            "view_type": view_type
        }
    )
    return res.json() if res.status_code == 200 else res.text


def get_experiment(experiment_id):
    res = requests.get(
        f"{url}/experiments/get", 
        headers=headers, 
        params={"experiment_id": experiment_id}
    )
    return res.json() if res.status_code == 200 else res.text


def get_experiment_by_name(experiment_name):
    res = requests.get(
        f"{url}/experiments/get-by-name", 
        headers=headers, 
        params={"experiment_name": experiment_name}
    )
    return res.json() if res.status_code == 200 else res.text


def delete_experiment(experiment_id):
    res = requests.post(
        f"{url}/experiments/delete", 
        headers=headers, 
        json={"experiment_id": experiment_id}
    )
    return res.json() if res.status_code == 200 else res.text


def restore_experiment(experiment_id):
    res = requests.post(
        f"{url}/experiments/restore", 
        headers=headers, 
        json={"experiment_id": experiment_id}
    )
    return res.json() if res.status_code == 200 else res.text


def update_experiment(experiment_id, new_name):
    res = requests.post(
        f"{url}/experiments/update", 
        headers=headers, 
        json={
            "experiment_id": experiment_id, 
            "new_name": new_name
        }
    )
    return res.json() if res.status_code == 200 else res.text


# =========================
# Runs
# =========================

def list_runs(experiment_ids, max_results=MAX_RESULTS):
    res = requests.post(
        f"{url}/runs/search",
        headers=headers,
        json={
            "experiment_ids": experiment_ids, 
            "max_results": max_results
        }
    )
    return res.json() if res.status_code == 200 else res.text


def view_run(run_id):
    res = requests.get(
        f"{url}/runs/get", 
        headers=headers, 
        params={"run_id": run_id}
    )
    return res.json() if res.status_code == 200 else res.text


def delete_run(run_id):
    res = requests.post(
        f"{url}/runs/delete", 
        headers=headers, 
        json={"run_id": run_id}
    )
    return res.json() if res.status_code == 200 else res.text


# =========================
# Models (Model Registry)
# =========================

def register_model(name):
    res = requests.post(
        f"{url}/registered-models/create",
        headers=headers,
        json={"name": name}
    )
    return res.json() if res.status_code == 200 else res.text


def list_models(max_results=1000):
    res = requests.get(
        f"{url}/registered-models/list",
        headers=headers,
        params={"max_results": max_results}
    )
    return res.json() if res.status_code == 200 else res.text


def update_model(name, description):
    res = requests.post(
        f"{url}/registered-models/update",
        headers=headers,
        json={
            "name": name,
            "description": description
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_model(name):
    res = requests.post(
        f"{url}/registered-models/delete",
        headers=headers,
        json={"name": name}
    )
    return res.json() if res.status_code == 200 else res.text


# =========================
# Model Versions
# =========================

def list_model_versions(model_name):
    res = requests.post(
        f"{url}/model-versions/search",
        headers=headers,
        json={
            "filter":
            f"name='{model_name}'"
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_model_version(model_name, version):
    res = requests.post(
        f"{url}/model-versions/delete",
        headers=headers,
        json={
            "name": model_name,
            "version": version
        }
    )
    return res.json() if res.status_code == 200 else res.text


# =========================
# Artifacts
# =========================

def list_artifacts(run_id, path=""):
    res = requests.get(
        f"{url}/artifacts/list",
        headers=headers,
        params={
            "run_id": run_id,
            "path": path
        }
    )
    return res.json() if res.status_code == 200 else res.text

print("Hi!")

# =========================
# Quick Test
# =========================

# if __name__ == "__main__":
#     print(create_experiment("test"))
#     print(list_experiments())