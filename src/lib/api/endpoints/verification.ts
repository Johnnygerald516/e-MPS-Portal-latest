// Verification related API endpoints
import { toast } from "@/components/ui/use-toast";

// Type definitions
interface VerificationRequest {
  subjectId: string;
  dateOfBirth: string;
  phoneNumber?: string; 
  applicationTypeId?: number; 
}

interface VerificationResponse {
  ackCode: number;
  ackMessage: string;
  applicationId?: string;
  jsonResult?: {
    applicationID?: string;
    phoneNo?: string;
    [key: string]: any;
  };
}

interface OccupationType {
  EntryId?: number;
  OccupationTypeID?: number;
  OccupationName?: string;
  OccupationType?: string;
  AinaYaKazi?: string;
}

interface OccupationTypeLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: OccupationType[];
}

interface Occupation {
  OccupationID: number;
  OccupationName: string;
}

interface OccupationLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: Occupation[];
}

interface Country {
  EntryId: number;
  CountryName: string;
}

interface CountryLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: Country[];
}

interface Region {
  EntryId?: number;
  EntryID?: number;
  ID?: number;
  Id?: number;
  id?: number;
  RegionID?: number;
  RegionId?: number;
  RegionName: string;
}

interface District {
  EntryId?: number;
  EntryID?: number;
  ID?: number;
  Id?: number;
  id?: number;
  DistrictID?: number;
  DistrictId?: number;
  DistrictName: string;
}

interface Ward {
  EntryId?: number;
  EntryID?: number;
  ID?: number;
  Id?: number;
  id?: number;
  WardID?: number;
  WardId?: number;
  WardName: string;
}

interface Nationality {
  EntryId?: number;
  EntryID?: number;
  ID?: number;
  Id?: number;
  id?: number;
  NationalityID?: number;
  NationalityId?: number;
  Nationality?: string;
  NationalityName?: string;
  Name?: string;
  Description?: string;
  Value?: string;
  Text?: string;
  Label?: string;
  [key: string]: any;
}

interface RegionLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: Region[];
}

interface DistrictLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: District[];
}

interface WardLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: Ward[];
}

interface NationalityLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: Nationality[];
}

interface RelationType {
  RelationTypeID: number;
  RelationName: string;
  Uhusiano: string;
}

interface RelationTypeLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: RelationType[];
}

interface DocumentType {
  DocumentTypeID: number;
  DocumentName: string;
}

interface DocumentTypeLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: DocumentType[];
}

interface MaritalStatus {
  MaritalStatusID: number;
  MaritalStatus: string;
  HaliYaNdoa: string;
}

interface MaritalStatusLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: MaritalStatus[];
}

interface ApplicationType {
  ApplicationTypeID: number;
  ApplicationTypeNameSwahili: string;
}

interface ApplicationTypeLookupRequest {
  operationType: string;
  argument1: number;
  argument2: number;
}

interface ApplicationTypeLookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: ApplicationType[];
}

// Generic lookup request interface
interface LookupRequest {
  operationType: string;
  argument1: number;
  argument2: number;
}

// Generic lookup response interface
interface LookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: any[];
}

export const verificationEndpoints = {
  // Fetch occupation types
  fetchOccupationTypes: async (): Promise<OccupationTypeLookupResponse> => {
    try {
      console.log('Fetching occupation types using API route');
      
      const payload = {
        operationType: "OccupationType",
        argument1: 1,
        argument2: 0
      };
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Occupation types response:', responseData);
      
      // Check if the response contains valid data
      if (responseData.ackCode === 0 || !responseData.jsonResult || responseData.jsonResult.length === 0) {
        console.warn('Invalid or empty occupation types response');
        throw new Error('Invalid or empty occupation types response');
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching occupation types:', error);
      // Throw the error to be handled by the component
      throw error;
    }
  },
  
  // Fetch occupations by type
  fetchOccupations: async (occupationTypeId: number): Promise<OccupationLookupResponse> => {
    try {
      console.log('Fetching occupations using API route for type:', occupationTypeId);
      
      const payload = {
        operationType: "Occupation",
        argument1: occupationTypeId,
        argument2: 0
      };
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Occupations response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching occupations:', error);
      throw error;
    }
  },
  
  // Fetch occupations based on OccupationID
  fetchOccupationsByID: async (occupationTypeId: number): Promise<OccupationLookupResponse> => {
    try {
      console.log('Fetching occupations by ID using API route for type:', occupationTypeId);
      
      const payload = {
        operationType: "Occupation",
        argument1: occupationTypeId,
        argument2: 0
      };
      
      console.log('Fetching occupations with payload:', payload);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Occupations by ID response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching occupations by ID:', error);
      throw error;
    }
  },
  
  // Fetch countries
  fetchCountries: async (): Promise<CountryLookupResponse> => {
    try {
      console.log('Fetching countries using API route');
      
      const payload = {
        operationType: "Country",
        argument1: 1,
        argument2: 0
      };
      
      console.log('Fetching countries with payload:', payload);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Countries response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  },
  
  // Fetch regions for a country
  fetchRegions: async (countryId: number): Promise<RegionLookupResponse> => {
    try {
      console.log('Fetching regions using API route for countryId:', countryId);
      
      // Ensure countryId is a number
      const numericCountryId = Number(countryId);
      if (isNaN(numericCountryId)) {
        console.error('Invalid countryId provided:', countryId);
        throw new Error(`Invalid country ID provided: ${countryId}`);
      }
      
      const payload = {
        operationType: "Region",
        argument1: numericCountryId,
        argument2: 0
      };
      
      console.log('Fetching regions with payload:', payload);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Regions response:', responseData);
      
      // Validate response structure
      if (!responseData.jsonResult) {
        console.error('Invalid response structure - missing jsonResult:', responseData);
        throw new Error('Invalid response format from server');
      }
      
      console.log('Region results count:', responseData.jsonResult.length);
      if (responseData.jsonResult.length > 0) {
        console.log('First region sample:', responseData.jsonResult[0]);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },
  
  // Fetch districts for a region
  fetchDistricts: async (regionId: number): Promise<DistrictLookupResponse> => {
    try {
      console.log('Fetching districts using API route for regionId:', regionId);
      
      // Ensure regionId is a number
      const numericRegionId = Number(regionId);
      if (isNaN(numericRegionId)) {
        console.error('Invalid regionId provided:', regionId);
        throw new Error(`Invalid region ID provided: ${regionId}`);
      }
      
      const payload = {
        operationType: "District",
        argument1: numericRegionId,
        argument2: 0
      };
      
      console.log('Fetching districts with payload:', payload);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Districts response:', responseData);
      
      // Validate response structure
      if (!responseData.jsonResult) {
        console.error('Invalid response structure - missing jsonResult:', responseData);
        throw new Error('Invalid response format from server');
      }
      
      console.log('District results count:', responseData.jsonResult.length);
      if (responseData.jsonResult.length > 0) {
        console.log('First district sample:', responseData.jsonResult[0]);
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },
  
  // Fetch wards for a district
  fetchWards: async (districtId: number): Promise<WardLookupResponse> => {
    try {
      console.log('Fetching wards using API route for districtId:', districtId);
      
      // Ensure districtId is a number
      const numericDistrictId = Number(districtId);
      if (isNaN(numericDistrictId)) {
        console.error('Invalid districtId provided:', districtId);
        throw new Error(`Invalid district ID provided: ${districtId}`);
      }
      
      const payload = {
        operationType: "Ward",
        argument1: numericDistrictId,
        argument2: 0
      };
      
      console.log('Fetching wards with payload:', payload);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Wards response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  },
  
  // Fetch nationalities
  fetchNationalities: async (): Promise<NationalityLookupResponse> => {
    try {
      console.log('Fetching nationalities using API route');
      
      const payload = {
        operationType: "Nationality",
        argument1: 1,
        argument2: 0
      };
      
      console.log('Fetching nationalities with payload:', payload);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Nationalities response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      throw error;
    }
  },
  
  // Fetch relation types
  fetchRelationTypes: async (): Promise<RelationTypeLookupResponse> => {
    try {
      console.log('Fetching relation types using API route');
      
      const payload = {
        operationType: "RelationType",
        argument1: 1,
        argument2: 0
      };
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Relation types response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching relation types:', error);
      throw error;
    }
  },
  
  // Fetch document types
  fetchDocumentTypes: async (): Promise<DocumentTypeLookupResponse> => {
    try {
      console.log('Fetching document types using API route');
      
      const payload = {
        operationType: "DocumentType",
        argument1: 1,
        argument2: 0
      };
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Document types response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  },
  
  // Fetch marital status options
  fetchMaritalStatus: async (): Promise<MaritalStatusLookupResponse> => {
    try {
      console.log('Fetching marital status using API route');
      
      const payload = {
        operationType: "MaritalStatus",
        argument1: 1,
        argument2: 0
      };
      
      console.log('Marital status payload:', payload);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Marital status response:', responseData);
      
      // Check if the response contains valid data
      if (responseData.ackCode === 0 || !responseData.jsonResult || responseData.jsonResult.length === 0) {
        console.warn('Invalid or empty marital status response');
        throw new Error('Invalid or empty marital status response');
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching marital status options:', error);
      throw error;
    }
  },
  
  // Fetch application types
  fetchApplicationTypes: async (parentTypeId: number = 1): Promise<ApplicationTypeLookupResponse> => {
    try {
      console.log('Fetching application types using API route for parentTypeId:', parentTypeId);
      
      const payload = {
        operationType: "AppType",
        argument1: parentTypeId,
        argument2: 0
      };
      
      console.log('Application types payload:', payload);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log('Application types response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching application types:', error);
      throw error;
    }
  },
  
  // Generic lookup function for various data types
  fetchLookup: async (payload: LookupRequest): Promise<LookupResponse> => {
    try {
      console.log(`Fetching lookup using API route for operation: ${payload.operationType}`);
      
      // Use the Next.js API route instead of direct API call
      const response = await fetch('/api/applications/lookup', {
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
      console.log(`Lookup response for ${payload.operationType}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Error fetching lookup for ${payload.operationType}:`, error);
      throw error;
    }
  },
  
  // Verify registration
  verifyRegistration: async (data: VerificationRequest): Promise<VerificationResponse> => {
    try {
      // Just pass the data directly to the API route
      // The API route will handle the transformation
      console.log('Original data received:', JSON.stringify(data));
      
      // Use the Next.js API route to avoid CORS issues
      console.log('Sending request to /api/applications');
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        // Try to get detailed error information
        try {
          const errorData = await response.json();
          console.error('API error details:', errorData);
          throw new Error(errorData.ackMessage || `API error: ${response.status} ${response.statusText}`);
        } catch (e) {
          // If we can't parse the error as JSON, just throw the status
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }
      
      const responseData = await response.json();
      console.log('Verification response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error verifying registration:', error);
      
      // Show toast notification for error
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify registration",
        variant: "destructive"
      });
      
      // Return error response
      return {
        ackCode: 0,
        ackMessage: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
};
