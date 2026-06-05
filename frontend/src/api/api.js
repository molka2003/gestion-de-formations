import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10s timeout
});

api.interceptors.response.use(
  res => res,
  err => {
    if (!err.response) {
      console.error('🔴 Impossible de joindre le serveur (port 8080). Vérifiez que Spring Boot tourne.');
    }
    return Promise.reject(err);
  }
);

export default api;
