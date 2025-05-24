import axios from 'axios';

const API = axios.create({ baseURL: "http://127.0.0.1:5000" });

export const processStocks = (data) => API.post('/api/process-stocks', data);
export const getTaskStatus = (taskId) => API.get(`/api/task-status/${taskId}`);
