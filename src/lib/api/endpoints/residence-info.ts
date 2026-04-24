// Residence information API endpoints
import { toast } from "@/components/ui/use-toast";
import { apiConfig } from '@/lib/config/api-config';

interface ResidenceInfoPayload {
  applicationId: string;
  // Use the exact field names expected by the API
  wardResidenceId: number;
  streetName: string;
  phoneNo: string;
  houseNo: string;
  plotNo: string;
  countryOfOriginId: number;
  nationalityId: number;
  dateOfEntry: string;
  // Keep these for backward compatibility
  countryId?: number;
  regionId?: number;
  districtId?: number;
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
      
      // Use local Next.js API route for proper HTTPS handling
      const response = await fetch(`/applications/${payload.applicationId}/residence-info`, {
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
      console.log('Residence info save response:', responseData);
      return responseData;
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
      
      // Use local Next.js API route for proper HTTPS handling
      const response = await fetch(`/applications/${applicationId}/residence-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Residence info get response:', responseData);
      return responseData;
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
