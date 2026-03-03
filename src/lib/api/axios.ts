import axios from 'axios';
import { apiConfig, isValidUrl } from '../config/api-config';

// Get API URL from config (already handles local vs production URLs correctly)
let apiUrl = apiConfig.baseUrl;

// Log the API URL for debugging
console.log('[axios] Initial API URL from config:', apiUrl);
console.log('[axios] Direct env var check:', process.env.NEXT_PUBLIC_API_URL);

// Validate that we have an API URL
if (!apiUrl) {
  // Use the environment variable directly as fallback
  apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  console.log('[axios] Using fallback URL from env:', apiUrl);
  
  // In browser, we can show an error message
  if (typeof window !== 'undefined') {
    console.warn('[axios] API URL not found in config, using env variable directly');
  }
}

// Validate URL format
if (!isValidUrl(apiUrl)) {
  console.error(`[axios] Invalid API URL format: "${apiUrl}"`);
}

// Log final URL being used
console.log('[axios] Final API URL to be used:', apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Important for CORS with credentials
});

// Log the final baseURL being used
console.log('[axios] Final axios instance baseURL:', api.defaults.baseURL);

const publicEndpoints = [
  '/applications',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
];

api.interceptors.request.use(
  (config) => {
    const apiKey = apiConfig.apiKey;
    if (apiKey) {
      config.headers['api-key'] = apiKey;
    } else {
      config.headers['api-key'] = process.env.NEXT_PUBLIC_API_KEY_FALLBACK || 'dev-api-key-placeholder';
    }
    
      
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url && config.url.includes(endpoint)
    );
    

    if (!isPublicEndpoint) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } 
    }
    
    // Log the full URL being called
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log('[axios] Making request to:', fullUrl);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { refreshToken }
          );
          
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
