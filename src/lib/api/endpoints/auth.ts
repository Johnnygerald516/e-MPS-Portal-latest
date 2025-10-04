import api from '../axios';
import { setAuth } from '../../../contexts/auth-context';

// Authentication endpoints
export const authEndpoints = {
  // Sign in with email and password
  signin: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      if (response.data.data.authToken) {
        setAuth(response.data.data);  
        localStorage.setItem('auth_token', response.data.data.authToken);
      }
      
      if (response.data.data.refreshToken) {
        localStorage.setItem('refresh_token', response.data.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Sign up with email and password
  signup: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/signup', { email, password });
      console.log('Signup response:', response.data);
      
      // If signup is successful and returns tokens, store them
      if (response.data.status && response.data.data) {
        if (response.data.data.authToken) {
          setAuth(response.data.data);
          localStorage.setItem('auth_token', response.data.data.authToken);
        }
        
        if (response.data.data.refreshToken) {
          localStorage.setItem('refresh_token', response.data.data.refreshToken);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error codes
      if (error.response && error.response.status === 409) {
        // 409 Conflict - Email already exists
        throw {
          ...error,
          message: 'This email address is already registered. Please use a different email or try to login.',
          isEmailTaken: true
        };
      }
      
      throw error;
    }
  },
  
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
  
  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      // Store new tokens in localStorage
      if (response.data.data && response.data.data.authToken) {
        localStorage.setItem('auth_token', response.data.data.authToken);
        
        // Update auth headers for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.authToken}`;
      }
      
      if (response.data.data && response.data.data.refreshToken) {
        localStorage.setItem('refresh_token', response.data.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },
  
  // Verify OTP
  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      
      // If OTP verification is successful and returns tokens, store them
      if (response.data.status && response.data.data) {
        if (response.data.data.authToken) {
          setAuth(response.data.data);
          localStorage.setItem('auth_token', response.data.data.authToken);
        }
        
        if (response.data.data.refreshToken) {
          localStorage.setItem('refresh_token', response.data.data.refreshToken);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  },
  
  // Resend OTP
  resendOTP: async (email: string) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }
};
