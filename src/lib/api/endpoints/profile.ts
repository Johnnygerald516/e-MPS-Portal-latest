import api from '../axios';

// Profile endpoints
export const profileEndpoints = {
  // Get profile completion progress
  getProfileProgress: async () => {
    try {
      const response = await api.get('/customer/profile/progress');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user progress for profile stepper
  getUserProgress: async () => {
    try {
      const response = await api.get('/customer/profile/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  },
  
  // Submit basic profile information
  submitBasicInfo: async (profileData: {
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    nationalIdentityNumber: string;
    phoneNumber: string;
    profile_photo?: File;
    letter_from_veo?: File;
  }) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_photo' && key !== 'letter_from_veo') {
          formData.append(key, profileData[key as keyof typeof profileData] as string);
        }
      });
      
      // Add file fields if they exist
      if (profileData.profile_photo) {
        formData.append('profile_photo', profileData.profile_photo);
      }
      
      if (profileData.letter_from_veo) {
        formData.append('letter_from_veo', profileData.letter_from_veo);
      }
      
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      const response = await api.post('/customer/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting basic info:', error);
      throw error;
    }
  },
  
  // Submit address information
  submitAddressInfo: async (profileId: string, addressData: {
    territoryId: string;
    regionId: string;
    districtId: string;
    wardId: string;
    street: string;
  }) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      const response = await api.post(`/customer/profile/address`, addressData, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting address info:', error);
      throw error;
    }
  },
  
  // Get profile by ID
  getProfileById: async (profileId: string) => {
    try {
      const response = await api.get(`/profile/${profileId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update profile
  updateProfile: async (profileId: string, profileData: any) => {
    try {
      const response = await api.put(`/profile/${profileId}`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
