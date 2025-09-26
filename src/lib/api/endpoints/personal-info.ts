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
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch(`/api/applications/${payload.applicationId}/personal-info`, {
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
      console.log('Personal info save response:', responseData);
      return responseData;
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
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch(`/api/applications/${applicationId}/personal-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Personal info get response:', responseData);
      return responseData;
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
