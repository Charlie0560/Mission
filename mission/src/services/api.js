import axios from 'axios';

const API = axios.create({ baseURL: "https://mission-c2f5ipc4w-chaitanyalokhande87gmailcoms-projects.vercel.app" });

export const processStocks = (data) => API.post('/api/process-stocks', data);
export const getTaskStatus = (taskId) => API.get(`/api/task-status/${taskId}`);
