from flask import Flask, request, jsonify
from flask_cors import CORS
import functions as fn
import requests, json
import time

app = Flask(__name__)
CORS(app)

# =========================
# GLOBAL SECURITY HELPERS 
# =========================

def get_exp_name_from_id(experiment_id):
    """Fetches the experiment name from MLflow using the ID."""
    res = fn.get_experiment(experiment_id)
    if "experiment" in res:
        return res["experiment"].get("name")
    return None

def check_permission(user_id, elem_name, operation_name, comp_name):
    """
    Asks Cerberus if the user has permission for this element.
    Includes comp_name to resolve ambiguity (experiment vs model)[cite: 14, 35].
    """
    if not user_id or not elem_name or not comp_name:
        return False, jsonify({"error": "Missing user, element, or component data"}), 400
        
    try:
        perm_res = requests.get(
            "http://ml-studio-web-1:5000/api/user_permission",
            params={
                "elem_name": elem_name, 
                "operation_name": operation_name,
                "comp_name": comp_name # NEW: Ambiguity fix from Mar 11 meeting [cite: 35, 46]
            },
            headers={"X-User-Id": str(user_id)},
            timeout=5
        )
        if perm_res.status_code == 200 and perm_res.json().get("has_permission", False):
            return True, None, 200
            
        return False, jsonify({"error": f"Unauthorized to {operation_name} this {comp_name}"}), 403
    except Exception as e:
        return False, jsonify({"error": "Authorization service unavailable"}), 500
 
# =========================
# Basic
# =========================

@app.route("/")
def index():
    return jsonify({
        "message": "Welcome to ML Studio",
        "status": "Online",
        "service": "heimdall"
    })

@app.route("/api/hello")
def hello():
    return jsonify({"data": "Hello from ML Studio!"})



# =========================
# Experiments
# =========================

@app.route("/api/experiments/create", methods=["POST"])
def api_create_experiment():
    # --- 1. Headers & Authentication ---
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 401

    # --- 2. Data Payload & Optional Fields ---
    # Declaring all fields clearly at the top for better readability and tracking
    data = request.json or {}
    name = data.get("name")
    artifact_location = data.get("artifact_location") # Optional
    tags = data.get("tags") # Optional
    
    if not name:
        return jsonify({"error": "'name' is required"}), 400
        
    # --- 3. Check if experiment exists (including soft-deleted) ---
    existing_exp = fn.get_experiment_by_name(name)
    
    if "experiment" in existing_exp:
        exp_info = existing_exp["experiment"]
        if exp_info.get("lifecycle_stage") == "deleted":
            # --- THE OWNER CHECK ---
            viewable_res = requests.get(
                "http://ml-studio-web-1:5000/api/get_viewable_elements?comp_name=experiment", 
                headers={"X-User-Id": str(user_id)}, timeout=5
            )
            elem_data = viewable_res.json().get("elem_names", [])
            dict_elem_owners = {k: v for k, v in elem_data}
            owner_id = dict_elem_owners.get(name)

            if str(owner_id) != str(user_id):
                return jsonify({"error": "A deleted experiment with this name exists, but you are not the owner."}), 403

            # --- GOING BACK TO TEMPORARY FIX (FOR NOW) ---
            # Reverting back to the trash rename since hard_delete_experiment is removed for now
            trash_name = f"{name}_trash_{int(time.time())}"
            fn.update_experiment(exp_info["experiment_id"], trash_name)
            
        else:
            return jsonify({"error": f"Experiment '{name}' already exists and is active."}), 400

    # --- 4. Create the brand new experiment ---
    # Passing the explicitly tracked optional variables
    res = fn.create_experiment(name, artifact_location, tags)
    
    # --- 5. Register new ownership in Cerberus ---
    if "experiment_id" in res:
        try:
            requests.post(
                "http://ml-studio-web-1:5000/api/add_element", 
                json={"component_name": "experiment", "elem_name": name},
                headers={"X-User-Id": str(user_id)},
                timeout=5
            )
        except Exception as e:
            print(f"Warning: Failed to sync ownership with Cerberus: {e}")

    return jsonify(res)

@app.route("/api/experiments/search", methods=["POST"])
def api_search_experiments():
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 401

    # 1. Fetch viewable elements
    res = requests.get(
            "http://ml-studio-web-1:5000/api/get_viewable_elements?comp_name=experiment",
            headers={"X-User-Id": user_id},
            timeout=5
        )
    res.raise_for_status()
    
    elem_names = res.json().get("elem_names", [])
    dict_elem_names = {k: v for k, v in elem_names}

    # 2. Fetch from MLflow
    data = request.json or {}
    res_mlflow = fn.search_experiments(
        max_results=data.get("max_results", 500),
        page_token=data.get("page_token"),
        filter=data.get("filter"),
        order_by=data.get("order_by"),
        view_type=data.get("view_type", "ACTIVE_ONLY")
    )
    
    # Safely get experiments to avoid KeyError
    exp = res_mlflow.get("experiments", [])
    
    # 3. Filter list (Decoupled IDs + Soft-Deleted Privacy)
    res_final = [
        e for e in exp 
        if (e["name"] in dict_elem_names.keys()) and 
        not (e.get("lifecycle_stage") == "deleted" and str(dict_elem_names[e["name"]]) != str(user_id))
    ]
    
    # 4. THE FORMAT FIX: Return as a JSON object instead of a list
    return jsonify({"experiments": res_final})

@app.route("/api/experiments/get", methods=["GET"])
def api_get_experiment():
    user_id = request.headers.get("X-User-Id")
    experiment_id = request.args.get("experiment_id")
    
    if not experiment_id:
        return jsonify({"error": "'experiment_id' is required"}), 400
        
    # 1. Fetch from MLflow
    res = fn.get_experiment(experiment_id)
    if "experiment" not in res:
        return jsonify({"error": "Experiment Not Found"}), 404
        
    exp_name = res["experiment"]["name"]
    lifecycle_stage = res["experiment"]["lifecycle_stage"]
    
    # 2. Base Permission Check ("view")
    perm_res = requests.get(
        "http://ml-studio-web-1:5000/api/user_permission",
        params={"elem_name": exp_name, "operation_name": "view"},
        headers={"X-User-Id": str(user_id)},
        timeout=5
    )
    if not perm_res.json().get("has_permission", False):
        return jsonify({"error": "Unauthorized"}), 403
    
    # 3. Filter Phase: Soft-Deleted Privacy
    if lifecycle_stage == "deleted":
        viewable_res = requests.get(
            "http://ml-studio-web-1:5000/api/get_viewable_elements?comp_name=experiment", 
            headers={"X-User-Id": str(user_id)}, timeout=5
        )
        elem_data = viewable_res.json().get("elem_names", [])
        dict_elem_owners = {k: v for k, v in elem_data}
        owner_id = dict_elem_owners.get(exp_name)
        
        if str(owner_id) != str(user_id):
            return jsonify({"error": "Unauthorized / Experiment Not Found"}), 404

    return jsonify(res)

@app.route("/api/experiments/get-by-name", methods=["GET"])
def api_get_experiment_by_name():
    user_id = request.headers.get("X-User-Id")
    exp_name = request.args.get("experiment_name")
    
    if not exp_name:
        return jsonify({"error": "'experiment_name' is required"}), 400
        
    # 1. Base Permission Check ("view")
    perm_res = requests.get(
        "http://ml-studio-web-1:5000/api/user_permission",
        params={"elem_name": exp_name, "operation_name": "view"},
        headers={"X-User-Id": str(user_id)},
        timeout=5
    )
    if not perm_res.json().get("has_permission", False):
        return jsonify({"error": "Unauthorized"}), 403

    # 2. Fetch from MLflow
    res = fn.get_experiment_by_name(exp_name)
    if "experiment" not in res:
        return jsonify({"error": "Experiment Not Found"}), 404
        
    lifecycle_stage = res["experiment"]["lifecycle_stage"]
    
    # 3. Filter Phase: Soft-Deleted Privacy
    if lifecycle_stage == "deleted":
        viewable_res = requests.get(
            "http://ml-studio-web-1:5000/api/get_viewable_elements?comp_name=experiment", 
            headers={"X-User-Id": str(user_id)}, timeout=5
        )
        elem_data = viewable_res.json().get("elem_names", [])
        dict_elem_owners = {k: v for k, v in elem_data}
        owner_id = dict_elem_owners.get(exp_name)
        
        if str(owner_id) != str(user_id):
            return jsonify({"error": "Unauthorized / Experiment Not Found"}), 404

    return jsonify(res)

def api_delete_experiment():
    user_id = request.headers.get("X-User-Id")
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    
    if not experiment_id:
        return jsonify({"error": "'experiment_id' is required"}), 400
        
    # --- 1. Preparation: Fetch Name (Decoupled ID Rule) ---
    exp_name = get_exp_name_from_id(experiment_id)
    if not exp_name:
        return jsonify({"error": "Experiment Not Found"}), 404

    # --- 2. Permission Check Phase (From Diagram) ---
    # The diagram requires "manage" access for soft deletion
    allowed, err_res, status = check_permission(user_id, exp_name, "manage", "experiment")
    if not allowed:
        # Returning the exact error string from the break block in the diagram
        return jsonify({"error": "Unauthorized to manage this experiment"}), 403

    # --- 3. Soft Deletion Phase (From Diagram) ---
    # Calls MLflow to update lifecycle_stage from 'active' to 'deleted'
    res = fn.delete_experiment(experiment_id)
    
    return jsonify(res)

@app.route("/api/experiments/restore", methods=["POST"])
def api_restore_experiment():
    user_id = request.headers.get("X-User-Id")
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    
    if not experiment_id:
        return jsonify({"error": "'experiment_id' is required"}), 400
        
    # --- 1. Preparation: Fetch Name (Decoupled ID Rule) ---
    exp_name = get_exp_name_from_id(experiment_id)
    if not exp_name:
        return jsonify({"error": "Experiment Not Found"}), 404

    # --- 2. Permission Check Phase (From Diagram) ---
    # The diagram requires "manage" access to restore
    allowed, err_res, status = check_permission(user_id, exp_name, "manage", "experiment")
    if not allowed:
        # Returning the exact error string from the break block
        return jsonify({"error": "Unauthorized to manage/restore this experiment"}), 403

    # --- 3. Restore Phase (From Diagram) ---
    # Calls MLflow to update lifecycle_stage from 'deleted' to 'active'
    res = fn.restore_experiment(experiment_id)
    
    return jsonify(res)

@app.route("/api/experiments/update", methods=["POST"])
def api_update_experiment():
    user_id = request.headers.get("X-User-Id")
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    new_name = data.get("new_name")
    
    if not experiment_id or not new_name:
        return jsonify({"error": "'experiment_id' and 'new_name' are required"}), 400
        
    res_current = fn.get_experiment(experiment_id)
    if "experiment" not in res_current:
        return jsonify({"error": "Experiment Not Found"}), 404
        
    current_name = res_current["experiment"]["name"]
    
    # --- AMBIGUITY FIX: Added "experiment" ---
    allowed, err_res, status = check_permission(user_id, current_name, "edit", "experiment")
    if not allowed:
        return jsonify({"error": "Unauthorized to edit this experiment"}), 403

    existing_check = fn.get_experiment_by_name(new_name)
    if "experiment" in existing_check:
        return jsonify({"error": "The new experiment name must be globally unique"}), 400
        
    res = fn.update_experiment(experiment_id, new_name)
    return jsonify(res)

@app.route("/api/experiments/set-tag", methods=["POST"])
def api_set_experiment_tag():
    user_id = request.headers.get("X-User-Id")
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    key = data.get("key")
    value = data.get("value")
    
    if not experiment_id or not key or value is None:
        return jsonify({"error": "'experiment_id', 'key', and 'value' are required"}), 400
        
    exp_name = get_exp_name_from_id(experiment_id)
    if not exp_name:
        return jsonify({"error": "Experiment Not Found"}), 404
        
    # --- AMBIGUITY FIX: Added "experiment" ---
    allowed, err_res, status = check_permission(user_id, exp_name, "edit", "experiment")
    if not allowed:
        return jsonify({"error": "Unauthorized to edit this experiment"}), 403
        
    res = fn.set_experiment_tag(experiment_id, key, value)
    return jsonify(res)

@app.route("/api/experiments/delete-tag", methods=["POST"])
def api_delete_experiment_tag():
    user_id = request.headers.get("X-User-Id")
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    key = data.get("key")
    
    if not experiment_id or not key:
        return jsonify({"error": "'experiment_id' and 'key' are required"}), 400
        
    exp_name = get_exp_name_from_id(experiment_id)
    if not exp_name:
        return jsonify({"error": "Experiment Not Found"}), 404
        
    # --- AMBIGUITY FIX: Added "experiment" ---
    allowed, err_res, status = check_permission(user_id, exp_name, "edit", "experiment")
    if not allowed:
        return jsonify({"error": "Unauthorized to edit this experiment"}), 403
        
    res = fn.delete_experiment_tag(experiment_id, key)
    return jsonify(res)

@app.route("/api/experiments/share", methods=["POST"])
def api_share_experiment():
    user_id = request.headers.get("X-User-Id")
    data = request.json or {}
    experiment_id = data.get("experiment_id")
    targets = data.get("targets", [])  # Expecting a list of target user IDs
    permission_level = data.get("permission_level") # e.g., "view", "edit", "manage"
    
    if not experiment_id or not targets or not permission_level:
        return jsonify({"error": "'experiment_id', 'targets', and 'permission_level' are required"}), 400

    # --- 1. Preparation: Fetch Name (Decoupled ID Rule) ---
    exp_name = get_exp_name_from_id(experiment_id)
    if not exp_name:
        return jsonify({"error": "Experiment Not Found"}), 404

    # --- 2. Permission Check Phase (From Diagram) ---
    allowed, err_res, status = check_permission(user_id, exp_name, "manage", "experiment")
    if not allowed:
        return jsonify({"error": "Only users with manage permission can share"}), 403

    # --- 3. Access Granting Phase (From Diagram) ---
    success_list = []
    error_list = []
    
    for target_user_id in targets:
        try:
            cerb_res = requests.post(
                "http://ml-studio-web-1:5000/api/edit_user_permission",
                json={
                    "user_id": target_user_id,     
                    "elem_name": exp_name,         
                    "comp_name": "experiment",    
                    "operation_name": permission_level
                },
                headers={"X-User-Id": str(user_id)}, # The user granting access
                timeout=5
            )
            
            if cerb_res.status_code == 200:
                success_list.append(target_user_id)
            else:
                error_list.append({"target": target_user_id, "error": cerb_res.json()})
        except Exception as e:
            error_list.append({"target": target_user_id, "error": str(e)})

    if error_list:
        return jsonify({
            "message": "Sharing completed with some errors", 
            "successes": success_list, 
            "errors": error_list
        }), 207

    return jsonify({"message": "Sharing successful"}), 200

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
    # --- 1. Headers & Authentication ---
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 401

    # --- 2. Data Payload ---
    run_id = request.args.get("run_id")
    if not run_id:
        return jsonify({"error": "'run_id' is required"}), 400
        
    # --- 3. Fetch Run & Identify Parent Experiment ---
    # We must fetch the run from MLflow first to know which experiment it belongs to
    res = fn.get_run(run_id)
    if "run" not in res:
        return jsonify({"error": "Run Not Found"}), 404
        
    run_info = res["run"].get("info", {})
    experiment_id = run_info.get("experiment_id")
    run_lifecycle = run_info.get("lifecycle_stage", "active")
    
    # Decoupled ID Translator
    exp_name = get_exp_name_from_id(experiment_id)
    if not exp_name:
        return jsonify({"error": "Parent Experiment Not Found"}), 404

    # --- 4. Permission Check Phase ---
    # Asking Cerberus if the user has "view" access to the parent experiment
    allowed, err_res, status = check_permission(user_id, exp_name, "view", "experiment")
    if not allowed:
        return jsonify({"error": "Unauthorized to view this run"}), 403

    # --- 5. Filter Phase: Soft-Deleted Privacy ---
    if run_lifecycle == "deleted":
        viewable_res = requests.get(
            "http://ml-studio-web-1:5000/api/get_viewable_elements?comp_name=experiment", 
            headers={"X-User-Id": str(user_id)}, timeout=5
        )
        dict_elem_owners = {k: v for k, v in viewable_res.json().get("elem_names", [])}
        owner_id = dict_elem_owners.get(exp_name)
        
        # If the run is deleted and the user isn't the owner, pretend it doesn't exist
        if str(owner_id) != str(user_id):
            return jsonify({"error": "Run Not Found / Unauthorized"}), 404

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
    # --- 1. Headers & Authentication ---
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "Missing X-User-Id header"}), 401

    # --- 2. Data Payload & Readability Fix ---
    data = request.json or {}
    experiment_ids = data.get("experiment_ids", [])
    
    # Explicitly declaring optional fields at the top (Komsan's requirement)
    filter_query = data.get("filter")
    run_view_type = data.get("run_view_type", "ACTIVE_ONLY")
    max_results = data.get("max_results", 500)
    order_by = data.get("order_by")
    page_token = data.get("page_token")

    if not experiment_ids or not isinstance(experiment_ids, list):
        return jsonify({"error": "'experiment_ids' must be a provided list"}), 400

    # --- 3. Permission Check Phase (From Diagram) ---
    exp_id_to_name = {}
    for eid in experiment_ids:
        # Decoupled ID translation
        ename = get_exp_name_from_id(eid)
        if not ename:
            return jsonify({"error": "Experiment Not Found"}), 404
        
        # Checking 'view' access for each requested experiment
        allowed, err_res, status = check_permission(user_id, ename, "view", "experiment")
        if not allowed:
            # Exact error string from the diagram's break block
            return jsonify({"error": "Unauthorized to view one or more of these experiments"}), 403
            
        # Cache the name for the filter phase later
        exp_id_to_name[eid] = ename

    # --- 4. Search Runs Phase (From Diagram) ---
    res_mlflow = fn.search_runs(
        experiment_ids=experiment_ids,
        filter=filter_query,
        run_view_type=run_view_type,
        max_results=max_results,
        order_by=order_by,
        page_token=page_token
    )

    # --- 5. Filter Phase: Soft-Deleted Privacy (From Diagram) ---
    # Fetch owners from Cerberus to check against the requesting user
    viewable_res = requests.get(
        "http://ml-studio-web-1:5000/api/get_viewable_elements?comp_name=experiment", 
        headers={"X-User-Id": str(user_id)}, timeout=5
    )
    dict_elem_owners = {k: v for k, v in viewable_res.json().get("elem_names", [])}

    runs = res_mlflow.get("runs", [])
    filtered_runs = []
    
    for run in runs:
        # Extract run info safely
        run_info = run.get("info", {})
        lifecycle_stage = run_info.get("lifecycle_stage", "active")
        run_exp_id = run_info.get("experiment_id")
        
        # Look up who owns the experiment this run belongs to
        run_exp_name = exp_id_to_name.get(run_exp_id)
        owner_id = dict_elem_owners.get(run_exp_name)

        # "Filter out soft-deleted runs where owner != user"
        if lifecycle_stage == "deleted" and str(owner_id) != str(user_id):
            continue
            
        filtered_runs.append(run)

    res_mlflow["runs"] = filtered_runs
    return jsonify(res_mlflow)

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
    
    res = fn.create_registered_model(
        name=name,
        tags=data.get("tags"),
        description=data.get("description"),
        deployment_job_id=data.get("deployment_job_id")
    )
    return jsonify(res)

@app.route("/api/models/get", methods=["GET"])
def api_get_registered_model():
    user_id = request.headers.get("X-User-Id")
    name = request.args.get("name")
    
    if not name:
        return jsonify({"error": "'name' is required"}), 400
    
    # NEW: Ambiguity check for Models
    allowed, err_res, status = check_permission(user_id, name, "view", "model")
    if not allowed:
        return err_res, status

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

@app.route("/api/models/update", methods=["PATCH"])
def api_update_registered_model():
    data = request.json or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "'name' is required"}), 400
    
    res = fn.update_registered_model(
        name=name,
        description=data.get("description"),
        deployment_job_id=data.get("deployment_job_id")
    )
    return jsonify(res)

@app.route("/api/models/delete", methods=["DELETE"])
def api_delete_registered_model():
    data = request.json or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "'name' is required"}), 400
    
    res = fn.delete_registered_model(name)
    return jsonify(res)

@app.route("/api/models/search", methods=["GET"])
def api_search_registered_models():
    res = fn.search_registered_models(
        filter=request.args.get("filter"),
        max_results=request.args.get("max_results", 500),
        order_by=request.args.get("order_by"),
        page_token=request.args.get("page_token")
    )
    return jsonify(res)

@app.route("/api/models/set-tag", methods=["POST"])
def api_set_registered_model_tag():
    data = request.json or {}
    name = data.get("name")
    key = data.get("key")
    value = data.get("value")
    if not name or not key or value is None:
        return jsonify({"error": "'name', 'key', and 'value' are required"}), 400
    
    res = fn.set_registered_model_tag(name, key, value)
    return jsonify(res)

@app.route("/api/models/delete-tag", methods=["DELETE"])
def api_delete_registered_model_tag():
    data = request.json or {}
    name = data.get("name")
    key = data.get("key")
    if not name or not key:
        return jsonify({"error": "'name' and 'key' are required"}), 400
    
    res = fn.delete_registered_model_tag(name, key)
    return jsonify(res)

@app.route("/api/models/alias", methods=["POST", "DELETE"])
def api_registered_model_alias():
    data = request.json or {}
    name = data.get("name")
    alias = data.get("alias")
    
    if not name or not alias:
        return jsonify({"error": "'name' and 'alias' are required"}), 400
    
    if request.method == "POST":
        version = data.get("version")
        if not version:
            return jsonify({"error": "'version' is required for setting an alias"}), 400
        res = fn.set_registered_model_alias(name, alias, version)
    else:
        res = fn.delete_registered_model_alias(name, alias)
        
    return jsonify(res)

# =========================
# Model Versions API
# =========================

@app.route("/api/models/versions/latest", methods=["POST"])
def api_get_latest_model_versions():
    data = request.json or {}
    name = data.get("name")
    if not name:
        return jsonify({"error": "'name' is required"}), 400
    
    res = fn.get_latest_model_versions(name, data.get("stages"))
    return jsonify(res)

@app.route("/api/models/versions/create", methods=["POST"])
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
        run_link=data.get("run_link"),
        description=data.get("description"),
        model_id=data.get("model_id")
    )
    return jsonify(res)

@app.route("/api/models/versions/get", methods=["GET"])
def api_get_model_version():
    name = request.args.get("name")
    version = request.args.get("version")
    if not name or not version:
        return jsonify({"error": "'name' and 'version' are required"}), 400
    
    res = fn.get_model_version(name, version)
    return jsonify(res)

@app.route("/api/models/versions/update", methods=["PATCH"])
def api_update_model_version():
    data = request.json or {}
    name = data.get("name")
    version = data.get("version")
    if not name or not version:
        return jsonify({"error": "'name' and 'version' are required"}), 400
    
    res = fn.update_model_version(name, version, data.get("description"))
    return jsonify(res)

@app.route("/api/models/versions/delete", methods=["DELETE"])
def api_delete_model_version():
    data = request.json or {}
    name = data.get("name")
    version = data.get("version")
    if not name or not version:
        return jsonify({"error": "'name' and 'version' are required"}), 400
    
    res = fn.delete_model_version(name, version)
    return jsonify(res)

@app.route("/api/models/versions/search", methods=["GET"])
def api_search_model_versions():
    res = fn.search_model_versions(
        filter=request.args.get("filter"),
        max_results=request.args.get("max_results", 500),
        order_by=request.args.get("order_by"),
        page_token=request.args.get("page_token")
    )
    return jsonify(res)

@app.route("/api/models/versions/download-uri", methods=["GET"])
def api_get_model_version_download_uri():
    name = request.args.get("name")
    version = request.args.get("version")
    if not name or not version:
        return jsonify({"error": "'name' and 'version' are required"}), 400
    
    res = fn.get_model_version_download_uri(name, version)
    return jsonify(res)

@app.route("/api/models/versions/transition", methods=["POST"])
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

@app.route("/api/models/versions/set-tag", methods=["POST"])
def api_set_model_version_tag():
    data = request.json or {}
    name = data.get("name")
    version = data.get("version")
    key = data.get("key")
    value = data.get("value")
    if not name or not version or not key or value is None:
        return jsonify({"error": "'name', 'version', 'key', and 'value' are required"}), 400
    
    res = fn.set_model_version_tag(name, version, key, value)
    return jsonify(res)

@app.route("/api/models/versions/delete-tag", methods=["DELETE"])
def api_delete_model_version_tag():
    data = request.json or {}
    name = data.get("name")
    version = data.get("version")
    key = data.get("key")
    if not name or not version or not key:
        return jsonify({"error": "'name', 'version', and 'key' are required"}), 400
    
    res = fn.delete_model_version_tag(name, version, key)
    return jsonify(res)

@app.route("/api/models/versions/get-by-alias", methods=["GET"])
def api_get_model_version_by_alias():
    name = request.args.get("name")
    alias = request.args.get("alias")
    if not name or not alias:
        return jsonify({"error": "'name' and 'alias' are required"}), 400
    
    res = fn.get_model_version_by_alias(name, alias)
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