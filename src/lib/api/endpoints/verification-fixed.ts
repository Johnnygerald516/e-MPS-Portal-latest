// Verification related API endpoints
import { toast } from "@/components/ui/use-toast";

// Type definitions
interface VerificationRequest {
  idNumber: string;
  idType: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
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
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const payload = {
        operationType: "OccupationType",
        argument1: 1,
        argument2: 0
      };
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('Occupation types response:', response.data);
      const responseData = response.data;
      
      // Check if the response contains valid data
      if (responseData.ackCode === 0 || !responseData.jsonResult || responseData.jsonResult.length === 0) {
        console.warn('Invalid or empty occupation types response, using fallback data');
        return {
          ackCode: 1,
          ackMessage: "Using fallback occupation types data",
          jsonResult: [
            { EntryId: 1, OccupationType: "Employed" },
            { EntryId: 2, OccupationType: "Self Employed" },
            { EntryId: 3, OccupationType: "Business Owner" },
            { EntryId: 4, OccupationType: "Student" },
            { EntryId: 5, OccupationType: "Retired" },
            { EntryId: 6, OccupationType: "Unemployed" }
          ]
        };
      }
      
      return responseData;
    } catch (error) {
      console.warn('Error fetching occupation types, using fallback data:', error);
      // Return fallback data instead of empty response
      return {
        ackCode: 1,
        ackMessage: "Using fallback occupation types data",
        jsonResult: [
          { EntryId: 1, OccupationType: "Employed" },
          { EntryId: 2, OccupationType: "Self Employed" },
          { EntryId: 3, OccupationType: "Business Owner" },
          { EntryId: 4, OccupationType: "Student" },
          { EntryId: 5, OccupationType: "Retired" },
          { EntryId: 6, OccupationType: "Unemployed" }
        ]
      };
    }
  },
  
  // Fetch occupations by type
  fetchOccupations: async (occupationTypeId: number): Promise<OccupationLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const payload = {
        operationType: "Occupation",
        argument1: occupationTypeId,
        argument2: 0
      };
      
      const response = await api.post('/applications/lookup', payload);
      console.log('Occupations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching occupations:', error);
      throw error;
    }
  },
  
  // Fetch occupations based on OccupationID
  fetchOccupationsByID: async (occupationTypeId: number): Promise<OccupationLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const payload = {
        operationType: "Occupation",
        argument1: occupationTypeId,
        argument2: 0
      };
      
      console.log('Fetching occupations with payload:', payload);
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('Occupations by ID response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('Error fetching occupations by ID, using fallback data:', error);
      
      // Return fallback occupation data based on occupation type ID
      const fallbackOccupations: Record<number, { OccupationID: number; OccupationName: string; }[]> = {
        1: [{ OccupationID: 1, OccupationName: "Full-time Employee" }, { OccupationID: 2, OccupationName: "Part-time Employee" }],
        2: [{ OccupationID: 3, OccupationName: "Freelancer" }, { OccupationID: 4, OccupationName: "Consultant" }],
        3: [{ OccupationID: 5, OccupationName: "Small Business Owner" }, { OccupationID: 6, OccupationName: "Entrepreneur" }],
        4: [{ OccupationID: 7, OccupationName: "University Student" }, { OccupationID: 8, OccupationName: "High School Student" }],
        5: [{ OccupationID: 9, OccupationName: "Retired Professional" }, { OccupationID: 10, OccupationName: "Pensioner" }],
        6: [{ OccupationID: 11, OccupationName: "Job Seeker" }, { OccupationID: 12, OccupationName: "Not Working" }]
      };
      
      return {
        ackCode: 1,
        ackMessage: "Using fallback occupation data",
        jsonResult: fallbackOccupations[occupationTypeId] || []
      };
    }
  },
  
  // Fetch countries
  fetchCountries: async (): Promise<CountryLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const payload = {
        operationType: "Country",
        argument1: 1,
        argument2: 0
      };
      
      console.log('Fetching countries with payload:', payload);
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('Countries response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Return empty result instead of throwing
      return {
        ackCode: 0,
        ackMessage: "Failed to fetch countries. Please try again later.",
        jsonResult: []
      };
    }
  },
  
  // Fetch regions for a country
  fetchRegions: async (countryId: number): Promise<RegionLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      console.log('fetchRegions called with countryId:', countryId);
      
      // Ensure countryId is a number
      const numericCountryId = Number(countryId);
      if (isNaN(numericCountryId)) {
        console.error('Invalid countryId provided:', countryId);
        return {
          ackCode: 0,
          ackMessage: "Invalid country ID provided",
          jsonResult: []
        };
      }
      
      const payload = {
        operationType: "Region",
        argument1: numericCountryId,
        argument2: 0
      };
      
      console.log('Fetching regions with payload:', payload);
      console.log('Payload JSON:', JSON.stringify(payload));
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('API response status:', response.status);
      console.log('Regions response:', response.data);
      const responseData = response.data;
      
      // Validate response structure
      if (!responseData.jsonResult) {
        console.error('Invalid response structure - missing jsonResult:', responseData);
        return {
          ackCode: 0,
          ackMessage: "Invalid response format from server",
          jsonResult: []
        };
      } else {
        console.log('Region results count:', responseData.jsonResult.length);
        if (responseData.jsonResult.length > 0) {
          console.log('First region sample:', responseData.jsonResult[0]);
        }
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching regions:', error);
      return {
        ackCode: 0,
        ackMessage: "Failed to fetch regions. Please try again later.",
        jsonResult: []
      };
    }
  },
  
  // Fetch districts for a region
  fetchDistricts: async (regionId: number): Promise<DistrictLookupResponse> => {
    try {
      console.log('fetchDistricts called with regionId:', regionId);
      
      // Ensure regionId is a number
      const numericRegionId = Number(regionId);
      if (isNaN(numericRegionId)) {
        console.error('Invalid regionId provided:', regionId);
        return {
          ackCode: 0,
          ackMessage: "Invalid region ID provided",
          jsonResult: []
        };
      }
      
      const payload = {
        operationType: "District",
        argument1: numericRegionId,
        argument2: 0
      };
      
      console.log('Fetching districts with payload:', payload);
      console.log('Payload JSON:', JSON.stringify(payload));
      
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('API response status:', response.status);
      console.log('Districts response:', response.data);
      const responseData = response.data;
      
      // Validate response structure
      if (!responseData.jsonResult) {
        console.error('Invalid response structure - missing jsonResult:', responseData);
        return {
          ackCode: 0,
          ackMessage: "Invalid response format from server",
          jsonResult: []
        };
      } else {
        console.log('District results count:', responseData.jsonResult.length);
        if (responseData.jsonResult.length > 0) {
          console.log('First district sample:', responseData.jsonResult[0]);
        }
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching districts:', error);
      return {
        ackCode: 0,
        ackMessage: "Failed to fetch districts. Please try again later.",
        jsonResult: []
      };
    }
  },
  
  // Fetch wards for a district
  fetchWards: async (districtId: number): Promise<WardLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      console.log('fetchWards called with districtId:', districtId);
      
      // Ensure districtId is a number
      const numericDistrictId = Number(districtId);
      if (isNaN(numericDistrictId)) {
        console.error('Invalid districtId provided:', districtId);
        return {
          ackCode: 0,
          ackMessage: "Invalid district ID provided",
          jsonResult: []
        };
      }
      
      const payload = {
        operationType: "Ward",
        argument1: numericDistrictId,
        argument2: 0
      };
      
      console.log('Fetching wards with payload:', payload);
      console.log('Payload JSON:', JSON.stringify(payload));
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('Wards response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching wards:', error);
      return {
        ackCode: 0,
        ackMessage: "Failed to fetch wards. Please try again later.",
        jsonResult: []
      };
    }
  },
  
  // Fetch nationalities
  fetchNationalities: async (): Promise<NationalityLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const payload = {
        operationType: "Nationality",
        argument1: 1,
        argument2: 0
      };
      
      console.log('Fetching nationalities with payload:', payload);
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('Nationalities response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      return {
        ackCode: 0,
        ackMessage: "Failed to fetch nationalities. Please try again later.",
        jsonResult: []
      };
    }
  },
  
  // Fetch relation types
  fetchRelationTypes: async (): Promise<RelationTypeLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const payload = {
        operationType: "RelationType",
        argument1: 1,
        argument2: 0
      };
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('Relation types response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching relation types:', error);
      throw error;
    }
  },
  
  // Fetch document types
  fetchDocumentTypes: async (): Promise<DocumentTypeLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const payload = {
        operationType: "DocumentType",
        argument1: 1,
        argument2: 0
      };
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('Document types response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  },
  
  // Fetch marital status options
  fetchMaritalStatus: async (): Promise<MaritalStatusLookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      const payload = {
        operationType: "MaritalStatus",
        argument1: 1,
        argument2: 0
      };
      
      console.log('Marital status payload:', payload);
      console.log('Sending request to /applications/lookup');
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log('Marital status response:', response.data);
      const responseData = response.data;
      
      // Check if the response contains valid data
      if (responseData.ackCode === 0 || !responseData.jsonResult || responseData.jsonResult.length === 0) {
        console.warn('Invalid or empty marital status response, using fallback data');
        return {
          ackCode: 1,
          ackMessage: "Using fallback marital status data",
          jsonResult: [
            { MaritalStatusID: 1, MaritalStatus: "Single", HaliYaNdoa: "Single" },
            { MaritalStatusID: 2, MaritalStatus: "Married", HaliYaNdoa: "Married" },
            { MaritalStatusID: 3, MaritalStatus: "Divorced", HaliYaNdoa: "Divorced" },
            { MaritalStatusID: 4, MaritalStatus: "Widowed", HaliYaNdoa: "Widowed" }
          ]
        };
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
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      console.log('API URL being used in fetchApplicationTypes:', process.env.NEXT_PUBLIC_API_URL);
      
      const payload: ApplicationTypeLookupRequest = {
        operationType: "AppType",
        argument1: parentTypeId,
        argument2: 0
      };
      
      console.log('Sending request to:', '/applications/lookup');
      
      try {
        // Use the axios instance that's already configured with the API URL
        const response = await api.post('/applications/lookup', payload);
        console.log('Application types response:', response.data);
        return response.data;
      } catch (axiosError) {
        console.error('Axios error:', axiosError);
        
        // Return fallback data instead of throwing
        console.warn('Using fallback application types data');
        return {
          ackCode: 1,
          ackMessage: "Using fallback application types data",
          jsonResult: [
            { ApplicationTypeID: 1, ApplicationTypeNameSwahili: "Ombi Jipya" },
            { ApplicationTypeID: 2, ApplicationTypeNameSwahili: "Kuhuisha" }
          ]
        };
      }
    } catch (error) {
      console.error('Error in fetchApplicationTypes:', error);
      
      // Return fallback data instead of throwing
      return {
        ackCode: 1,
        ackMessage: "Using fallback application types data due to error",
        jsonResult: [
          { ApplicationTypeID: 1, ApplicationTypeNameSwahili: "Ombi Jipya" },
          { ApplicationTypeID: 2, ApplicationTypeNameSwahili: "Kuhuisha" }
        ]
      };
    }
  },
  
  // Generic lookup function for various data types
  fetchLookup: async (payload: LookupRequest): Promise<LookupResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      console.log(`fetchLookup called with operation: ${payload.operationType}`);
      
      const response = await api.post('/applications/lookup', payload);
      
      console.log(`Lookup response for ${payload.operationType}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching lookup for ${payload.operationType}:`, error);
      throw error;
    }
  },
  
  // Verify registration
  verifyRegistration: async (data: VerificationRequest): Promise<VerificationResponse> => {
    try {
      // Import axios instance to ensure we use the configured API URL
      const api = (await import('../axios')).default;
      
      // Use the API proxy to avoid CORS issues
      const response = await api.post('/applications', data);
      
      console.log('Verification response:', response.data);
      return response.data;
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
