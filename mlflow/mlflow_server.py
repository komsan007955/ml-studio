from flask import Flask, jsonify
import mlflow

app = Flask(__name__)

# Define MLflow Tracking URI
MLFLOW_TRACKING_URI = "http://localhost:5001"

@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to ML Studio",
        "mlflow_tracking_uri": MLFLOW_TRACKING_URI
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
