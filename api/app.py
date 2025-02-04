from flask import Flask, request, jsonify
import pandas as pd
import pickle as pkl

app = Flask(__name__)

# Load trained model
with open("/app/models/model.pkl", "rb") as f:
    model = pkl.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    prediction = model.predict(pd.DataFrame([data]))
    return jsonify({"prediction": prediction.tolist()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
