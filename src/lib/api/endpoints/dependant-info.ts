// Dependant Info API endpoints
import { toast } from "@/components/ui/use-toast";

interface Dependant {
  dependantFullName: string;
  dependantGender: string;
  dependantNationalityID: number;
  dependantRelationTypeID: number;
  documentTypeID: number;
  documentNo: string;
  issuedDate: string;
  expireDate: string;
  issuedCountryID: number;
}

interface DependantInfoRequest {
  hasDocument: number;
  dependants: Dependant[];
}

interface DependantInfoResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: {
    applicationId: string;
  };
}

export const dependantInfoEndpoints = {

  // Submit dependant info
  submitDependantInfo: async (applicationId: string, formData: any): Promise<DependantInfoResponse> => {
    try {
      // Log the incoming form data for debugging
      console.log('Form data received:', formData);
      
      // Format dates properly
      const formatDate = (date: any): string => {
        if (!date) return '';
        
        // If it's already a string, check if it's a valid date format
        if (typeof date === 'string') {
          // Check for invalid years like 0001, 0002
          if (date.startsWith('000')) {
            // Replace with current year
            const currentYear = new Date().getFullYear();
            return `${currentYear}${date.substring(4)}`;
          }
          return date;
        }
        
        // If it's a Date object
        if (date instanceof Date) {
          const year = date.getFullYear();
          // Check if year is too low (likely invalid)
          if (year < 1900) {
            const currentYear = new Date().getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${currentYear}-${month}-${day}`;
          }
          return date.toISOString().split('T')[0];
        }
        
        return '';
      };
      
      // Log the incoming form data structure to help debug
      console.log('Raw form data structure:', JSON.stringify(formData, null, 2));
      
      // Map form values to API request format
      const dependants = Array.isArray(formData.dependants) 
        ? formData.dependants.map((dep: any) => {
            // Log each dependant's raw data
            console.log('Processing dependant raw data:', JSON.stringify(dep, null, 2));
            
            return {
              dependantFullName: dep.name || dep.dependantFullName || '',
              dependantGender: dep.gender || dep.dependantGender || 'M', // Default to Male if not specified
              dependantNationalityID: Number(dep.nationalityId || dep.dependantNationalityID) || 0,
              dependantRelationTypeID: Number(dep.relationshipTypeId || dep.dependantRelationTypeID) || 0,
              documentTypeID: Number(dep.documentTypeId || dep.documentTypeID) || 0,
              documentNo: dep.documentNumber || dep.documentNo || '',
              issuedDate: formatDate(dep.documentIssuedDate || dep.issuedDate),
              expireDate: formatDate(dep.documentExpiryDate || dep.expireDate),
              issuedCountryID: Number(dep.issuedCountryId || dep.issuedCountryID) || 0
            };
          })
        : Array.isArray(formData.dependants) 
          ? formData.dependants 
          : [];
      
      // Check if any dependant has documents
      const hasAnyDocuments = Array.isArray(formData.dependants) && formData.dependants.some((dep: any) => dep.hasDocument === true || dep.hasDocument === 1);
      
      const payload: DependantInfoRequest = {
        hasDocument: hasAnyDocuments ? 1 : 0,
        dependants: dependants
      };
      
      // Log the payload being sent to the API with detailed information
      console.log('==================== DEPENDANT INFO SUBMISSION ====================');
      console.log(`Application ID: ${applicationId}`);
      console.log('Has Dependants:', payload.hasDocument === 1 ? 'Yes' : 'No');
      console.log('Number of Dependants:', payload.dependants.length);
      console.log('Dependants Details:');
      payload.dependants.forEach((dep, index) => {
        console.log(`  [Dependant ${index + 1}]`);
        console.log(`    Name: ${dep.dependantFullName}`);
        console.log(`    Gender: ${dep.dependantGender}`);
        console.log(`    Nationality ID: ${dep.dependantNationalityID}`);
        console.log(`    Relation Type ID: ${dep.dependantRelationTypeID}`);
        console.log(`    Document Type ID: ${dep.documentTypeID}`);
        console.log(`    Document Number: ${dep.documentNo}`);
        console.log(`    Issued Date: ${dep.issuedDate}`);
        console.log(`    Expiry Date: ${dep.expireDate}`);
        console.log(`    Issued Country ID: ${dep.issuedCountryID}`);
      });
      console.log('Full Payload:', JSON.stringify(payload, null, 2));
      console.log('================================================================');

      // Use the API proxy to avoid CORS issues
      const response = await fetch(`/api/applications/${applicationId}/dependants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Check if the response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        // Show toast notification for API error
        toast({
          title: "API Error",
          description: `Error ${response.status}: ${response.statusText}`,
          variant: "destructive"
        });
        
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Try to parse the response as JSON
      try {
        const responseData = await response.json();
        console.log('Dependant info response:', responseData);
        return responseData;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        const responseText = await response.text();
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error: any) {
      console.error('Error submitting dependant info:', error);
      
      // Show toast notification for any caught error
      toast({
        title: "Error",
        description: error.message || "Failed to submit dependant information",
        variant: "destructive"
      });
      
      throw error;
    }
  }
};
