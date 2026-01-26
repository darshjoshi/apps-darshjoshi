import axios from 'axios';

// Determine the API base URL and key based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding API key and auth tokens
api.interceptors.request.use(
  (config) => {
    // Add API key if configured
    if (API_KEY) {
      config.headers['X-API-Key'] = API_KEY;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// Example API functions for different apps
export const app1API = {
  getData: () => api.get('/api/app1/data'),
  postData: (data: any) => api.post('/api/app1/data', data),
};

export const app2API = {
  getData: () => api.get('/api/app2/data'),
  postData: (data: any) => api.post('/api/app2/data', data),
};
