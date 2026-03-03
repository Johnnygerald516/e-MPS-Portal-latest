// Parents information API endpoints
import { toast } from "@/components/ui/use-toast";
import { apiConfig } from '@/lib/config/api-config';

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
    // Use local Next.js API route for proper HTTPS handling
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
       return responseData;
    } catch (error) {
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
     // Use local Next.js API route for proper HTTPS handling
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
      return responseData;
    } catch (error) {
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
