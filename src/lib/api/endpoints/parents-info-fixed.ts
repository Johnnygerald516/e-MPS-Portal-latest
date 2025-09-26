// Parents information API endpoints
import { toast } from "@/components/ui/use-toast";

interface ParentsInfoPayload {
  applicationId: string;
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherLastName: string;
  fatherNationality: string;
  fatherOccupation: string;
  motherFirstName: string;
  motherMiddleName: string;
  motherLastName: string;
  motherNationality: string;
  motherOccupation: string;
}

interface ParentsInfoResponse {
  ackCode: number;
  ackMessage: string;
  applicationId?: string;
}

export const parentsInfoEndpoints = {
  // Save parents information
  saveParentsInfo: async (payload: ParentsInfoPayload): Promise<ParentsInfoResponse> => {
    try {
      console.log('Saving parents info with payload:', payload);
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.post(`/applications/${payload.applicationId}/parents-info`, payload);
      
      // Axios handles errors automatically
      console.log('Parents info save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving parents info:', error);
      
      // Show toast notification for error
      toast({
        title: "Error",
        description: "Failed to save parents information. Please try again.",
        variant: "destructive"
      });
      
      // Return error response
      return {
        ackCode: 0,
        ackMessage: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },
  
  // Get parents information
  getParentsInfo: async (applicationId: string): Promise<any> => {
    try {
      console.log('Getting parents info for application:', applicationId);
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.get(`/applications/${applicationId}/parents-info`);
      
      // Axios handles errors automatically
      console.log('Parents info get response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting parents info:', error);
      
      // Show toast notification for error
      toast({
        title: "Error",
        description: "Failed to retrieve parents information. Please try again.",
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
