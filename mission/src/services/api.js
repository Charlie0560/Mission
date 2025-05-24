import axios from 'axios';

const API = axios.create({ baseURL: "https://mission-1-percent.onrender.com" });

export const processStocks = (data) => API.post('/api/process-stocks', data);
