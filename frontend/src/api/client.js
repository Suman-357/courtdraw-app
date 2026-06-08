import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach token if it exists in memory (optional if we strictly use HttpOnly cookies, but we might want Authorization header)
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle global errors like 401s
client.interceptors.response.use(
  response => response,
  error => {
    // Optionally handle token refresh here automatically
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized. Please login again.");
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
