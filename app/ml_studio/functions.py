import requests

url = "http://43.255.106.103:5000/api/2.0/mlflow/"

headers = {
    "Content-Type": "application/json"
}

def create_experiment(name):
    res = requests.post(
        f"{url}/experiments/create", 
        headers=headers,
        json={"name": name}
    )

    if res.status_code == 200:
        print("Success!")
        return res.json()
    else:
        print(f"Failed with status code: {res.status_code}")
        return res.text
    
def list_experiments(max_results=1000):
    pass