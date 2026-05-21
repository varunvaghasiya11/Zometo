import axios from 'axios';

const api = axios.create({
  baseURL: 'https://zomato-clone-api-5e4m.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    let msg = err.response?.data?.message;
    if (!msg) {
      if (err.response) {
        msg = `Server Error: ${err.response.status} on ${err.config?.method?.toUpperCase()} ${err.config?.url}`;
      } else {
        msg = err.message || 'Network Error';
      }
    }
    
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(new Error(msg));
  }
);

export default api;
