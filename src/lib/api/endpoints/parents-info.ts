// Parents information API endpoints
import { toast } from "@/components/ui/use-toast";

interface ParentsInfoPayload {
  applicationId: string;
  // Updated fields to match the expected API format
  fatherFullName: string;
  fatherDateOfBirth: string;
  fatherCountryOfBirthId: number;
  fatherCountryOfResidentId: number;
  fatherNationalityId: number;
  fatherRegionOfBirthId: number;
  motherFullName: string;
  motherDateOfBirth: string;
  motherRegionOfBirthId: number;
  motherCountryOfBirthId: number;
  motherCountryOfResidentId: number;
  motherNationalityId: number;
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
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch(`/api/applications/${payload.applicationId}/parents-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Parents info save response:', responseData);
      return responseData;
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
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch(`/api/applications/${applicationId}/parents-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Parents info get response:', responseData);
      return responseData;
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
