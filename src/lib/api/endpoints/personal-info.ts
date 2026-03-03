// Personal information API endpoints
import { toast } from "@/components/ui/use-toast";
import { apiConfig } from '@/lib/config/api-config';

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
      // Use local Next.js API route for proper HTTPS handling
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
      // Use local Next.js API route for proper HTTPS handling
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
