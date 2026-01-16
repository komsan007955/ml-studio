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

def create_registered_model(name, tags=None, description=None, deployment_job_id=None):
    res = requests.post(
        f"{url}/registered-models/create",
        headers=headers,
        json={
            "name": name,
            "tags": tags,
            "description": description,
            "deployment_job_id": deployment_job_id
        }
    )
    return res.json() if res.status_code == 200 else res.text


def get_registered_model(name):
    res = requests.get(
        f"{url}/registered-models/get",
        headers=headers,
        params={"name": name}
    )
    return res.json() if res.status_code == 200 else res.text


def rename_registered_model(name, new_name):
    res = requests.post(
        f"{url}/registered-models/rename",
        headers=headers,
        json={
            "name": name,
            "new_name": new_name
        }
    )
    return res.json() if res.status_code == 200 else res.text


def update_registered_model(name, description=None, deployment_job_id=None):
    res = requests.patch(
        f"{url}/registered-models/update",
        headers=headers,
        json={
            "name": name,
            "description": description,
            "deployment_job_id": deployment_job_id
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_registered_model(name):
    res = requests.delete(
        f"{url}/registered-models/delete",
        headers=headers,
        json={"name": name}
    )
    return res.json() if res.status_code == 200 else res.text


def search_registered_models(filter=None, max_results=MAX_RESULTS, order_by=None, page_token=None):
    res = requests.get(
        f"{url}/registered-models/search",
        headers=headers,
        params={
            "filter": filter,
            "max_results": max_results,
            "order_by": order_by,
            "page_token": page_token
        }
    )
    return res.json() if res.status_code == 200 else res.text


def set_registered_model_tag(name, key, value):
    res = requests.post(
        f"{url}/registered-models/set-tag",
        headers=headers,
        json={
            "name": name,
            "key": key,
            "value": value
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_registered_model_tag(name, key):
    res = requests.delete(
        f"{url}/registered-models/delete-tag",
        headers=headers,
        json={
            "name": name,
            "key": key
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_registered_model_alias(name, alias):
    res = requests.delete(
        f"{url}/registered-models/alias",
        headers=headers,
        json={
            "name": name,
            "alias": alias
        }
    )
    return res.json() if res.status_code == 200 else res.text


def set_registered_model_alias(name, alias, version):
    res = requests.post(
        f"{url}/registered-models/alias",
        headers=headers,
        json={
            "name": name,
            "alias": alias,
            "version": version
        }
    )
    return res.json() if res.status_code == 200 else res.text


# =========================
# Model Versions
# =========================

def get_latest_model_versions(name, stages=None):
    res = requests.post(
        f"{url}/registered-models/get-latest-versions",
        headers=headers,
        json={
            "name": name,
            "stages": stages
        }
    )
    return res.json() if res.status_code == 200 else res.text


def create_model_version(name, source, run_id=None, tags=None, run_link=None, description=None, model_id=None):
    res = requests.post(
        f"{url}/model-versions/create",
        headers=headers,
        json={
            "name": name,
            "source": source,
            "run_id": run_id,
            "tags": tags,
            "run_link": run_link,
            "description": description,
            "model_id": model_id
        }
    )
    return res.json() if res.status_code == 200 else res.text


def get_model_version(name, version):
    res = requests.get(
        f"{url}/model-versions/get",
        headers=headers,
        params={
            "name": name,
            "version": version
        }
    )
    return res.json() if res.status_code == 200 else res.text


def update_model_version(name, version, description=None):
    res = requests.patch(
        f"{url}/model-versions/update",
        headers=headers,
        json={
            "name": name,
            "version": version,
            "description": description
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_model_version(name, version):
    res = requests.delete(
        f"{url}/model-versions/delete",
        headers=headers,
        json={
            "name": name,
            "version": version
        }
    )
    return res.json() if res.status_code == 200 else res.text


def search_model_versions(filter=None, max_results=MAX_RESULTS, order_by=None, page_token=None):
    res = requests.get(
        f"{url}/model-versions/search",
        headers=headers,
        params={
            "filter": filter,
            "max_results": max_results,
            "order_by": order_by,
            "page_token": page_token
        }
    )
    return res.json() if res.status_code == 200 else res.text


def get_model_version_download_uri(name, version):
    res = requests.get(
        f"{url}/model-versions/get-download-uri",
        headers=headers,
        params={
            "name": name,
            "version": version
        }
    )
    return res.json() if res.status_code == 200 else res.text


def transition_model_version_stage(name, version, stage, archive_existing_versions):
    res = requests.post(
        f"{url}/model-versions/transition-stage",
        headers=headers,
        json={
            "name": name,
            "version": version,
            "stage": stage,
            "archive_existing_versions": archive_existing_versions
        }
    )
    return res.json() if res.status_code == 200 else res.text


def set_model_version_tag(name, version, key, value):
    res = requests.post(
        f"{url}/model-versions/set-tag",
        headers=headers,
        json={
            "name": name,
            "version": version,
            "key": key,
            "value": value
        }
    )
    return res.json() if res.status_code == 200 else res.text


def delete_model_version_tag(name, version, key):
    res = requests.delete(
        f"{url}/model-versions/delete-tag",
        headers=headers,
        json={
            "name": name,
            "version": version,
            "key": key
        }
    )
    return res.json() if res.status_code == 200 else res.text


def get_model_version_by_alias(name, alias):
    res = requests.get(
        f"{url}/registered-models/alias",
        headers=headers,
        params={
            "name": name,
            "alias": alias
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