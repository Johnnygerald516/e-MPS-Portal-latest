// Residence information API endpoints
import { toast } from "@/components/ui/use-toast";

interface ResidenceInfoPayload {
  applicationId: string;
  countryId: number;
  regionId: number;
  districtId: number;
  wardId: number;
  streetName: string;
  houseNumber: string;
}

interface ResidenceInfoResponse {
  ackCode: number;
  ackMessage: string;
  applicationId?: string;
}

export const residenceInfoEndpoints = {
  // Save residence information
  saveResidenceInfo: async (payload: ResidenceInfoPayload): Promise<ResidenceInfoResponse> => {
    try {
      console.log('Saving residence info with payload:', payload);
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.post(`/applications/${payload.applicationId}/residence-info`, payload);
      
      // Axios handles errors automatically
      console.log('Residence info save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving residence info:', error);
      
      // Show toast notification for error
      toast({
        title: "Error",
        description: "Failed to save residence information. Please try again.",
        variant: "destructive"
      });
      
      // Return error response
      return {
        ackCode: 0,
        ackMessage: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },
  
  // Get residence information
  getResidenceInfo: async (applicationId: string): Promise<any> => {
    try {
      console.log('Getting residence info for application:', applicationId);
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.get(`/applications/${applicationId}/residence-info`);
      
      // Axios handles errors automatically
      console.log('Residence info get response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting residence info:', error);
      
      // Show toast notification for error
      toast({
        title: "Error",
        description: "Failed to retrieve residence information. Please try again.",
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
