import axios from 'axios';

let apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Validate that we have an API URL
if (!apiUrl) {
 // apiUrl = 'http://10.6.0.167:3300';
  apiUrl='http://127.0.0.1:8000';
  
  // In browser, we can show an error message
  if (typeof window !== 'undefined') {
 }
}

// Validate URL format
try {
  new URL(apiUrl);
} catch (error) {
 apiUrl='http://127.0.0.1:8000';
}

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Important for CORS with credentials
});

const publicEndpoints = [
  '/applications',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
];

api.interceptors.request.use(
  (config) => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (apiKey) {
      config.headers['api-key'] = apiKey;
    } else {
      config.headers['api-key'] = 'dev-api-key-placeholder';
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
            `${apiUrl}/auth/refresh-token`,
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
