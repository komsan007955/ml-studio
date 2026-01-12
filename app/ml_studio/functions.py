import requests

url = "http://localhost:5050/api/2.0/mlflow/"
headers = {"Content-Type": "application/json"}

def create_experiment(name):
    res = requests.post(
        f"{url}/experiments/create", 
        headers=headers,
        json={"name": name}
    )

    return res.json() if res.status_code == 200 else res.text
    
def list_experiments(max_results=1000):
    pass

print(create_experiment("test"))