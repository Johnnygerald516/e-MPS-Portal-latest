// Dependant information API endpoints
import { toast } from "@/components/ui/use-toast";

interface DependantInfoPayload {
  applicationId: string;
  dependants: Dependant[];
}

interface Dependant {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  relationshipTypeId: number;
  nationality: string;
}

interface DependantInfoResponse {
  ackCode: number;
  ackMessage: string;
  applicationId?: string;
}

export const dependantInfoEndpoints = {
  // Save dependant information
  saveDependantInfo: async (payload: DependantInfoPayload): Promise<DependantInfoResponse> => {
    try {
      console.log('Saving dependant info with payload:', payload);
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.post(`/applications/${payload.applicationId}/dependants`, payload);
      
      // Axios handles errors automatically
      console.log('Dependant info save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving dependant info:', error);
      
      // Show toast notification for error
      toast({
        title: "Error",
        description: "Failed to save dependant information. Please try again.",
        variant: "destructive"
      });
      
      // Return error response
      return {
        ackCode: 0,
        ackMessage: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },
  
  // Get dependant information
  getDependantInfo: async (applicationId: string): Promise<any> => {
    try {
      console.log('Getting dependant info for application:', applicationId);
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.get(`/applications/${applicationId}/dependants`);
      
      // Axios handles errors automatically
      console.log('Dependant info get response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting dependant info:', error);
      
      // Show toast notification for error
      toast({
        title: "Error",
        description: "Failed to retrieve dependant information. Please try again.",
        variant: "destructive"
      });
      
      // Return error response
      return {
        ackCode: 0,
        ackMessage: error instanceof Error ? error.message : "Unknown error occurred",
        data: null
      };
    }
  }
};
