import axios from 'axios';


const API_BASE_URL = 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add Authorization header
API.interceptors.request.use((config) => {
  const token = 
    localStorage.getItem('token') || 
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('authToken');

  // 2. Attach Token if found
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("No token found in storage! Request may fail with 401.");
  }

  return config;
}, (error) => Promise.reject(error));

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Token might be invalid.");
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;