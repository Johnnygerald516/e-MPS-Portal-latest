// Residence Info API endpoints
import { toast } from "@/components/ui/use-toast";

interface ResidenceInfoRequest {
  wardResidenceId: number;
  streetName: string;
  phoneNo: string;
  houseNo?: string;
  plotNo?: string;
  countryOfOriginId: number;
  nationalityId: number;
  dateOfEntry: string;
}

interface ResidenceInfoResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: {
    applicationId: string;
  };
}

export const residenceInfoEndpoints = {
  // Submit residence info
  submitResidenceInfo: async (applicationId: string, formData: any): Promise<ResidenceInfoResponse> => {
    try {
      // Log the incoming form data for debugging
      console.log('Form data received:', formData);
      
      // Map form values to API request format with proper type conversion
      const payload: ResidenceInfoRequest = {
        wardResidenceId: Number(formData.wardResidenceId) || 0,
        streetName: String(formData.streetName || '').trim(),
        phoneNo: String(formData.phoneNo || '').trim(),
        houseNo: String(formData.houseNo || '').trim(),
        plotNo: String(formData.plotNo || '').trim(),
        countryOfOriginId: Number(formData.countryOfOriginId) || 0,
        nationalityId: Number(formData.nationalityId) || 0,
        dateOfEntry: String(formData.dateOfEntry || '').trim()
      };
      
      // Validate payload before sending
      if (!payload.wardResidenceId || !payload.streetName || !payload.phoneNo || !payload.countryOfOriginId || !payload.nationalityId || !payload.dateOfEntry) {
        throw new Error('Missing required fields in payload');
      }
      
      // Log the payload being sent to the API
      console.log('Payload being sent to API:', payload);

      // Use the API proxy to avoid CORS issues
      const response = await fetch(`/api/applications/${applicationId}/residence-info`, {
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
        console.log('Residence info response:', responseData);
        return responseData;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        const responseText = await response.text();
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error: any) {
      console.error('Error submitting residence info:', error);
      
      // Show toast notification for any caught error
      toast({
        title: "Error",
        description: error.message || "Failed to submit residence information",
        variant: "destructive"
      });
      
      throw error;
    }
  }
};
