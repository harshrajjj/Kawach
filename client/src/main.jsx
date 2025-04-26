import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import axios from 'axios'

// Configure axios defaults
const apiUrl = import.meta.env.VITE_BACKEND_API;
axios.defaults.baseURL = apiUrl;
axios.defaults.withCredentials = true;

console.log('API URL:', apiUrl);

// Add request interceptor for handling relative URLs in production
axios.interceptors.request.use(
  (config) => {
    // If the URL is relative and we're in production, use the full API URL
    if (config.url && config.url.startsWith('/api') && apiUrl) {
      config.url = `${apiUrl}${config.url}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

createRoot(document.getElementById('root')).render(
      <AuthProvider>
      <App />
      </AuthProvider>
)