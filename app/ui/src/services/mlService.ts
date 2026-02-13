const BASE_URL = "http://127.0.0.1:5001/api/2.0/mlflow";

export const getExperiments = async () => {
  const response = await fetch(`${BASE_URL}/experiments/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ view_type: "ALL" }) // This MUST be an object, not empty
  });
  return response.json();
};