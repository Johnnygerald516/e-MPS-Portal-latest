import axios from 'axios';

// Create a base axios instance with default configuration
console.log('===== API Configuration =====');
console.log('API URL from env:', process.env.NEXT_PUBLIC_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Running in browser:', typeof window !== 'undefined');

// Get the API URL from environment variables
let apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Validate that we have an API URL
if (!apiUrl) {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables!');
  // Use a fallback URL for development
  // apiUrl = 'http://10.6.0.167:3300';
  apiUrl='http://127.0.0.1:8000';
  console.warn('Using fallback API URL:', apiUrl);
  
  // In browser, we can show an error message
  if (typeof window !== 'undefined') {
    console.error('API URL not configured in browser environment');
  }
}

// Validate URL format
try {
  new URL(apiUrl);
  console.log('API URL format is valid:', apiUrl);
} catch (error) {
  console.error('Invalid API URL format:', apiUrl, error);
  // Use a fallback URL
  //apiUrl = 'http://10.6.0.167:3300';
  apiUrl='http://127.0.0.1:8000';
  console.warn('Using fallback API URL after format error:', apiUrl);
}

console.log('API URL being used:', apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout and other settings for better reliability
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
    console.log(apiKey)
    if (apiKey) {
      config.headers['api-key'] = apiKey;
    } else {
      config.headers['api-key'] = 'dev-api-key-placeholder';
      console.warn('API Key not found in environment variables, using development placeholder');
    }
    
      
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url && config.url.includes(endpoint)
    );
    

    if (!isPublicEndpoint) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        // If no token for private endpoint, might want to redirect or handle this case
        console.warn('Accessing private endpoint without authentication token');
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
