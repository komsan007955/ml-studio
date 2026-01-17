from flask import Flask, request, jsonify
from flask_cors import CORS
import functions as fn

app = Flask(__name__)
CORS(app)

# =========================
# Basic
# =========================

@app.route("/")
def index():
    return jsonify({
        "message": "Welcome to ML Studio",
        "status": "Online",
        "service": "ml_studio"
    })

@app.route("/api/hello")
def hello():
    return jsonify({"data": "Hello from ML Studio!"})

# =========================
# Experiments
# =========================

@app.route("/api/experiments/create", methods=["POST"])
def api_create_experiment():
    data = request.json or {}
    name = data.get("name")
    artifact_location = data.get("artifact_location")
    tags = data.get("tags")
    if not name:
        return jsonify({"error": "'name' is required"}), 400
    res = fn.create_experiment(name, artifact_location, tags)
    return jsonify(res)

@app.route("/api/experiments/search", methods=["POST"])
def api_search_experiments():
    data = request.json or {}
    res = fn.search_experiments(
        max_results=data.get("max_results", 500),
        page_token=data.get("page_token"),
        filter=data.get("filter"),
        order_by=data.get("order_by"),
        view_type=data.get("view_type", "ACTIVE_ONLY")
    )
    return jsonify(res)

@app.route("/api/experiments/get", methods=["GET"])
def api_get_experiment():
    experiment_id = request.args.get("experiment_id")
    if not experiment_id:
        return jsonify({"error": "'experiment_id' is required"}), 400
    res = fn.get_experiment(experiment_id)
    return jsonify(res)

@app.route("/api/experiments/get-by-name", methods=["GET"])
def api_get_experiment_by_name():
    experiment_name = request.args.get("experiment_name")
    if not experiment_name:
        return jsonify({"error": "'experiment_name' is required"}), 400
    res = fn.get_experiment_by_name(experiment_name)
    return jsonify(res)

@app.route("/api/experiments/delete", methods=["POST"])
def api_delete_experiment():
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    if not experiment_id:
        return jsonify({"error": "'experiment_id' is required"}), 400
    res = fn.delete_experiment(experiment_id)
    return jsonify(res)

@app.route("/api/experiments/restore", methods=["POST"])
def api_restore_experiment():
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    if not experiment_id:
        return jsonify({"error": "'experiment_id' is required"}), 400
    res = fn.restore_experiment(experiment_id)
    return jsonify(res)

@app.route("/api/experiments/update", methods=["POST"])
def api_update_experiment():
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    new_name = data.get("new_name")
    if not experiment_id or not new_name:
        return jsonify({"error": "'experiment_id' and 'new_name' are required"}), 400
    res = fn.update_experiment(experiment_id, new_name)
    return jsonify(res)

@app.route("/api/experiments/set-tag", methods=["POST"])
def api_set_experiment_tag():
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    key = data.get("key")
    value = data.get("value")
    if not experiment_id or not key or value is None:
        return jsonify({"error": "'experiment_id', 'key', and 'value' are required"}), 400
    res = fn.set_experiment_tag(experiment_id, key, value)
    return jsonify(res)

@app.route("/api/experiments/delete-tag", methods=["POST"])
def api_delete_experiment_tag():
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    key = data.get("key")
    if not experiment_id or not key:
        return jsonify({"error": "'experiment_id' and 'key' are required"}), 400
    res = fn.delete_experiment_tag(experiment_id, key)
    return jsonify(res)

# =========================
# Runs API
# =========================

@app.route("/api/runs/delete", methods=["POST"])
def api_delete_run():
    data = request.json or {}
    run_id = data.get("run_id")
    if not run_id:
        return jsonify({"error": "'run_id' is required"}), 400
    res = fn.delete_run(run_id)
    return jsonify(res)

@app.route("/api/runs/restore", methods=["POST"])
def api_restore_run():
    data = request.json or {}
    run_id = data.get("run_id")
    if not run_id:
        return jsonify({"error": "'run_id' is required"}), 400
    res = fn.restore_run(run_id)
    return jsonify(res)

@app.route("/api/runs/get", methods=["GET"])
def api_get_run():
    run_id = request.args.get("run_id")
    if not run_id:
        return jsonify({"error": "'run_id' is required"}), 400
    res = fn.get_run(run_id)
    return jsonify(res)

@app.route("/api/runs/set-tag", methods=["POST"])
def api_set_tag():
    data = request.json or {}
    run_id = data.get("run_id")
    key = data.get("key")
    value = data.get("value")
    if not run_id or not key or value is None:
        return jsonify({"error": "'run_id', 'key', and 'value' are required"}), 400
    res = fn.set_tag(run_id, key, value)
    return jsonify(res)

@app.route("/api/runs/delete-tag", methods=["POST"])
def api_delete_tag():
    data = request.json or {}
    run_id = data.get("run_id")
    key = data.get("key")
    if not run_id or not key:
        return jsonify({"error": "'run_id' and 'key' are required"}), 400
    res = fn.delete_tag(run_id, key)
    return jsonify(res)

@app.route("/api/metrics/get-history", methods=["GET"])
def api_get_metric_history():
    run_id = request.args.get("run_id")
    metric_key = request.args.get("metric_key")
    max_results = request.args.get("max_results", 500)
    if not run_id or not metric_key:
        return jsonify({"error": "'run_id' and 'metric_key' are required"}), 400
    res = fn.get_metric_history(run_id, metric_key, max_results)
    return jsonify(res)

@app.route("/api/runs/search", methods=["POST"])
def api_search_runs():
    data = request.json or {}
    experiment_ids = data.get("experiment_ids")
    if not experiment_ids:
        return jsonify({"error": "'experiment_ids' is required"}), 400
    res = fn.search_runs(
        experiment_ids=experiment_ids,
        filter=data.get("filter"),
        run_view_type=data.get("run_view_type", "ACTIVE_ONLY"),
        max_results=data.get("max_results", 500),
        order_by=data.get("order_by"),
        page_token=data.get("page_token")
    )
    return jsonify(res)

@app.route("/api/runs/update", methods=["POST"])
def api_update_run():
    data = request.json or {}
    run_id = data.get("run_id")
    if not run_id:
        return jsonify({"error": "'run_id' is required"}), 400
    res = fn.update_run(
        run_id=run_id,
        status=data.get("status"),
        end_time=data.get("end_time"),
        run_name=data.get("run_name")
    )
    return jsonify(res)

# =========================
# Models API
# =========================

@app.route("/api/models/create", methods=["POST"])
def api_create_registered_model():
    data = request.json or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "'name' is required"}), 400
    res = fn.create_registered_model(name, data.get("tags"), data.get("description"), data.get("deployment_job_id"))
    return jsonify(res)

@app.route("/api/models/get", methods=["GET"])
def api_get_registered_model():
    name = request.args.get("name")
    if not name:
        return jsonify({"error": "'name' is required"}), 400
    res = fn.get_registered_model(name)
    return jsonify(res)

@app.route("/api/models/rename", methods=["POST"])
def api_rename_registered_model():
    data = request.json or {}
    name = data.get("name")
    new_name = data.get("new_name")
    if not name or not new_name:
        return jsonify({"error": "'name' and 'new_name' are required"}), 400
    res = fn.rename_registered_model(name, new_name)
    return jsonify(res)

@app.route("/api/models/delete", methods=["DELETE"])
def api_delete_registered_model():
    data = request.json or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "'name' is required"}), 400
    res = fn.delete_registered_model(name)
    return jsonify(res)

# =========================
# Model Versions API
# =========================

@app.route("/api/model-versions/create", methods=["POST"])
def api_create_model_version():
    data = request.json or {}
    name = data.get("name")
    source = data.get("source")
    if not name or not source:
        return jsonify({"error": "'name' and 'source' are required"}), 400
    res = fn.create_model_version(
        name=name, 
        source=source, 
        run_id=data.get("run_id"), 
        tags=data.get("tags"), 
        description=data.get("description")
    )
    return jsonify(res)

@app.route("/api/model-versions/transition-stage", methods=["POST"])
def api_transition_model_version_stage():
    data = request.json or {}
    name = data.get("name")
    version = data.get("version")
    stage = data.get("stage")
    archive = data.get("archive_existing_versions", False)
    if not name or not version or not stage:
        return jsonify({"error": "'name', 'version', and 'stage' are required"}), 400
    res = fn.transition_model_version_stage(name, version, stage, archive)
    return jsonify(res)

# =========================
# Artifacts API
# =========================

@app.route("/api/artifacts/list", methods=["GET"])
def api_list_artifacts():
    run_id = request.args.get("run_id")
    path = request.args.get("path", "")
    if not run_id:
        return jsonify({"error": "'run_id' is required"}), 400
    res = fn.list_artifacts(run_id, path, request.args.get("page_token"))
    return jsonify(res)

# =========================
# Main
# =========================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)