import api from "../axios";

// Service type
export interface Service {
  serviceId: string;
  type: string;
  amount: number;
  serviceCode: string;
  duration: number;
  // Keep these for backward compatibility
  id?: string;
  name?: string;
  code?: string;
  description?: string;
  price?: number;
}

// Services endpoints
export const servicesEndpoints = {
  // Get all services
  getAll: async () => {
    try {
      const response = await api.get('/backend/services');
      // Log the response structure to help debug
      console.log('Services API response:', response);
      
      // Return the full response to allow flexible handling in components
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },
  
  // Create application with service code
  createApplication: async (serviceCode: string) => {
    try {
      const response = await api.post('/customer/application', { serviceCode });
      console.log('Application creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }
};
