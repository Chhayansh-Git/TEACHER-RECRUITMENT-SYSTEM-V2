// src/api/index.ts

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Our backend's base URL
});

export default api;