// Dependant information API endpoints
import { toast } from "@/components/ui/use-toast";
import { apiConfig } from '@/lib/config/api-config';

export interface DependantInfoPayload {
  applicationId: string;
  hasDocument: number;
  dependants: Dependant[];
}

export interface Dependant {
  dependantFullName: string;
  dependantGender: string;
  dependantNationalityID: number;
  dependantRelationTypeID: number;
  documentTypeID: number;
  documentNo: string;
  issuedDate: string;
  expireDate: string;
  issuedCountryID: number;
  // Keep these for backward compatibility
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  relationshipTypeId?: number;
  nationality?: string;
}

export interface DependantInfoResponse {
  ackCode: number;
  ackMessage: string;
  applicationId?: string;
}

export const dependantInfoEndpoints = {
  // Save dependant information
  saveDependantInfo: async (payload: DependantInfoPayload): Promise<DependantInfoResponse> => {
    try {
      console.log('Saving dependant info with payload:', payload);
      
      // Use local Next.js API route for proper HTTPS handling
      const response = await fetch(`/applications/${payload.applicationId}/dependants`, {
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
      console.log('Dependant info save response:', responseData);
      return responseData;
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
      
      // Use local Next.js API route for proper HTTPS handling
      const response = await fetch(`/applications/${applicationId}/dependants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Dependant info get response:', responseData);
      return responseData;
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
