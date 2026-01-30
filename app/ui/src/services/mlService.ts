import api from './api';

// Mirroring @app.route("/api/experiments/search")
export const searchExperiments = async (params = {}) => {
  const response = await api.post('/experiments/search', params);
  return response.data;
};

// .../create
export const createExperiment = async (name: string, tags?: object) => {
  const response = await api.post('/experiments/create', { name, tags });
  return response.data;
};

// .../delete
export const deleteExperiment = async (experiment_id: string) => {
  const response = await api.post('/experiments/delete', { experiment_id });
  return response.data;
};

// .../get
export const getExperiment = async (experiment_id: string) => {
  const response = await api.get('/experiments/get', { 
    params: { experiment_id } 
  });
  return response.data;
};