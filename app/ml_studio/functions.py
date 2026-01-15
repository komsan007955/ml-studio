import requests
from datetime import datetime

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


def set_experiment_tag(experiment_id, key, value):
    res = requests.post(
        f"{url}/experiments/set-experiment-tag", 
        headers=headers, 
        json={
            "experiment_id": experiment_id, 
            "key": key, 
            "value": value
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_experiment_tag(experiment_id, key):
    res = requests.post(
        f"{url}/experiments/delete-experiment-tag", 
        headers=headers, 
        json={
            "experiment_id": experiment_id, 
            "key": key
        }
    )
    return res.json() if res.status_code == 200 else res.text


# =========================
# Runs
# =========================

def delete_run(run_id):
    res = requests.post(
        f"{url}/runs/delete", 
        headers=headers, 
        json={"run_id": run_id}
    )
    return res.json() if res.status_code == 200 else res.text


def restore_run(run_id):
    res = requests.post(
        f"{url}/runs/restore", 
        headers=headers, 
        json={"run_id": run_id}
    )
    return res.json() if res.status_code == 200 else res.text


def get_run(run_id):
    res = requests.get(
        f"{url}/runs/get", 
        headers=headers, 
        params={
            "run_id": run_id
        }
    )
    return res.json() if res.status_code == 200 else res.text


def set_tag(run_id, key, value):
    res = requests.post(
        f"{url}/runs/set-tag", 
        headers=headers, 
        json={
            "run_id": run_id, 
            "key": key, 
            "value": value
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_tag(run_id, key):
    res = requests.post(
        f"{url}/runs/delete-tag", 
        headers=headers, 
        json={
            "run_id": run_id, 
            "key": key
        }
    )
    return res.json() if res.status_code == 200 else res.text


def get_metric_history(run_id, metric_key, max_results=MAX_RESULTS):
    res = requests.get(
        f"{url}/metrics/get-history", 
        headers=headers, 
        params={
            "run_id": run_id, 
            "metric_key": metric_key, 
            "max_results": max_results
        }
    )
    return res.json() if res.status_code == 200 else res.text


def search_runs(experiment_ids, filter=None, run_view_type="ACTIVE_ONLY", max_results=MAX_RESULTS, order_by=None, page_token=None):
    res = requests.post(
        f"{url}/runs/search",
        headers=headers,
        json={
            "experiment_ids": experiment_ids, 
            "filter": filter,
            "run_view_type": run_view_type, 
            "max_results": max_results, 
            "order_by": order_by, 
            "page_token": page_token
        }
    )
    return res.json() if res.status_code == 200 else res.text


def update_run(run_id, status=None, end_time=None, run_name=None):
    if status:
        end_time = end_time if end_time else int(datetime.now().timestamp())
    else:
        end_time = None
    
    res = requests.post(
        f"{url}/runs/update",
        headers=headers,
        json={
            "run_id": run_id, 
            "status": status,
            "end_time": end_time, 
            "run_name": run_name
        }
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

def list_artifacts(run_id, path, page_token=None):
    res = requests.get(
        f"{url}/artifacts/list", 
        headers=headers, 
        params={
            "run_id": run_id, 
            "path": path, 
            "page_token": page_token
        }
    )
    return res.json() if res.status_code == 200 else res.text


# =========================
# Quick Test
# =========================

# if __name__ == "__main__":
#     print(create_experiment("test"))
#     print(list_experiments())