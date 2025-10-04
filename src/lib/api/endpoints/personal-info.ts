// Personal information API endpoints
import { toast } from "@/components/ui/use-toast";

interface PersonalInfoPayload {
  applicationId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  otherName?: string;
  dateOfBirth: string;
  gender: string;
  birthCountry?: string;
  birthRegion?: string;
  maritalStatus?: string;
  maritalStatusId?: number;
  nationality?: string;
  occupationType?: string;
  occupation?: string;
  occupationDetail?: string;
  occupationId?: number;
  email?: string;
  phoneNumber?: string;
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
      // Use the Next.js API route with POST method for updates
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
      return responseData;
    } catch (error) {
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
      return responseData;
    } catch (error) {
      // Return error response
      return {
        ackCode: 0,
        ackMessage: error instanceof Error ? error.message : "Unknown error occurred",
        jsonResult: null
      };
    }
  }
};
