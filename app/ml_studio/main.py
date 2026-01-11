from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return jsonify({
        "message": "Welcome to the Portal API",
        "status": "Online",
        "service": "portal-api"
    })

@app.route("/api/hello")
def hello():
    return jsonify({"data": "Hello from ML Studio!"})

if __name__ == "__main__":
    # We use 5000 internally; Docker will map it to a different external port
    app.run(host="0.0.0.0", port=5000)