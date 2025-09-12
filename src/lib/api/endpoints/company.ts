import axios from 'axios';

// Create custom axios instance for company endpoints
const createCompanyApi = () => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_LOGIN_API_URL_CUSTOMER || '',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add API key and authorization token to headers
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers: Record<string, string> = {};
  
  if (apiKey) {
    headers['api-key'] = apiKey;
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return { api, headers };
};

// Company endpoints
export const companyEndpoints = {
  // Submit company basic info
  submitCompanyInfo: async (companyData: {
    companyName: string;
    registrationNumber: string;
    licenseNumber: string;
    business_license?: File | null;
    business_registration?: File | null;
  }) => {
    try {
      const { api, headers } = createCompanyApi();
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('companyName', companyData.companyName);
      formData.append('registrationNumber', companyData.registrationNumber);
      formData.append('licenseNumber', companyData.licenseNumber);
      
      if (companyData.business_license) {
        formData.append('business_license', companyData.business_license);
      }
      
      if (companyData.business_registration) {
        formData.append('business_registration', companyData.business_registration);
      }
      
      // Set content type to multipart/form-data for file uploads
      const response = await api.post('/company', formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Submit company address
  submitCompanyAddress: async (companyId: string, addressData: {
    territoryId: string;
    regionId: string;
    districtId: string;
    wardId: string;
    street: string;
  }) => {
    try {
      const { api, headers } = createCompanyApi();
      
      const response = await api.post(`/company/address?companyId=${companyId}`, addressData, {
        headers
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get company declaration (all info for review)
  getCompanyDeclaration: async (companyId: string) => {
    try {
      const { api, headers } = createCompanyApi();
      
      const response = await api.get(`/company/declaration?companyId=${companyId}`, {
        headers
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Submit final company declaration
  submitCompanyDeclaration: async (companyId: string, agreed: boolean) => {
    try {
      const { api, headers } = createCompanyApi();
      
      const response = await api.post(`/company/declaration?companyId=${companyId}`, 
        { agreed },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
