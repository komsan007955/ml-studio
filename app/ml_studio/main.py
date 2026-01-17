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
# Main
# =========================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)