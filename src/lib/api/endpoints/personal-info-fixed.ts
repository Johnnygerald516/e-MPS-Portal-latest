// Personal information API endpoints
import { toast } from "@/components/ui/use-toast";

interface PersonalInfoPayload {
  applicationId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatusId: number;
  nationality: string;
  occupationId: number;
  email: string;
  phoneNumber: string;
}

interface PersonalInfoResponse {
  ackCode: number;
  ackMessage: string;
  applicationId?: string;
}

export const personalInfoEndpoints = {
  // Save personal information
  savePersonalInfo: async (payload: PersonalInfoPayload): Promise<PersonalInfoResponse> => {
    try {
      console.log('Saving personal info with payload:', payload);
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.post(`/applications/${payload.applicationId}/personal-info`, payload);
      
      // Axios handles errors automatically
      console.log('Personal info save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving personal info:', error);
      
      // Show toast notification for error
      toast({
        title: "Error",
        description: "Failed to save personal information. Please try again.",
        variant: "destructive"
      });
      
      // Return error response
      return {
        ackCode: 0,
        ackMessage: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },
  
  // Get personal information
  getPersonalInfo: async (applicationId: string): Promise<any> => {
    try {
      console.log('Getting personal info for application:', applicationId);
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.get(`/applications/${applicationId}/personal-info`);
      
      // Axios handles errors automatically
      console.log('Personal info get response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting personal info:', error);
      
      // Show toast notification for error
      toast({
        title: "Error",
        description: "Failed to retrieve personal information. Please try again.",
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
