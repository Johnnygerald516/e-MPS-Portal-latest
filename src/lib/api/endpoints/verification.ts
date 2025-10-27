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
     const payload = {
        operationType: "OccupationType",
        argument1: 1,
        argument2: 0
      };
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
      if (responseData.ackCode === 0 || !responseData.jsonResult || responseData.jsonResult.length === 0) {
        throw new Error('Invalid or empty occupation types response');
      }
      
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch occupations by type
  fetchOccupations: async (occupationTypeId: number): Promise<OccupationLookupResponse> => {
    try {
      const payload = {
        operationType: "Occupation",
        argument1: occupationTypeId,
        argument2: 0
      };
      
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch occupations based on OccupationID
  fetchOccupationsByID: async (occupationTypeId: number): Promise<OccupationLookupResponse> => {
    try {
      const payload = {
        operationType: "Occupation",
        argument1: occupationTypeId,
        argument2: 0
      };
      
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch countries
  fetchCountries: async (): Promise<CountryLookupResponse> => {
    try {
      const payload = {
        operationType: "Country",
        argument1: 1,
        argument2: 0
      };
      
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch regions for a country
  fetchRegions: async (countryId: number): Promise<RegionLookupResponse> => {
    try {
      const numericCountryId = Number(countryId);
      if (isNaN(numericCountryId)) {
        throw new Error(`Invalid country ID provided: ${countryId}`);
      }
      
      const payload = {
        operationType: "Region",
        argument1: numericCountryId,
        argument2: 0
      };
      
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
      
      // Validate response structure
      if (!responseData.jsonResult) {
        throw new Error('Invalid response format from server');
      }
      
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch districts for a region
  fetchDistricts: async (regionId: number): Promise<DistrictLookupResponse> => {
    try {
      const numericRegionId = Number(regionId);
      if (isNaN(numericRegionId)) {
       throw new Error(`Invalid region ID provided: ${regionId}`);
      }
      
      const payload = {
        operationType: "District",
        argument1: numericRegionId,
        argument2: 0
      };
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
    if (!responseData.jsonResult) {
       throw new Error('Invalid response format from server');
      }
      
      if (responseData.jsonResult.length > 0) {
      }
      
      return responseData;
    } catch (error) {
   throw error;
    }
  },
  
  // Fetch wards for a district
  fetchWards: async (districtId: number): Promise<WardLookupResponse> => {
    try {
    const numericDistrictId = Number(districtId);
      if (isNaN(numericDistrictId)) {
        throw new Error(`Invalid district ID provided: ${districtId}`);
      }
      
      const payload = {
        operationType: "Ward",
        argument1: numericDistrictId,
        argument2: 0
      };
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch nationalities
  fetchNationalities: async (): Promise<NationalityLookupResponse> => {
    try {
      const payload = {
        operationType: "Nationality",
        argument1: 1,
        argument2: 0
      };
      
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch relation types
  fetchRelationTypes: async (): Promise<RelationTypeLookupResponse> => {
    try {
      const payload = {
        operationType: "RelationType",
        argument1: 1,
        argument2: 0
      };
      
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch document types
  fetchDocumentTypes: async (): Promise<DocumentTypeLookupResponse> => {
    try {
      const payload = {
        operationType: "DocumentType",
        argument1: 1,
        argument2: 0
      };
      
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch marital status options
  fetchMaritalStatus: async (): Promise<MaritalStatusLookupResponse> => {
    try {
      const payload = {
        operationType: "MaritalStatus",
        argument1: 1,
        argument2: 0
      };
      
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
      
      // Check if the response contains valid data
      if (responseData.ackCode === 0 || !responseData.jsonResult || responseData.jsonResult.length === 0) {
        throw new Error('Invalid or empty marital status response');
      }
      
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Fetch application types
  fetchApplicationTypes: async (parentTypeId: number = 1): Promise<ApplicationTypeLookupResponse> => {
    try {
      const payload = {
        operationType: "AppType",
        argument1: parentTypeId,
        argument2: 0
      };
      
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  // Generic lookup function for various data types
  fetchLookup: async (payload: LookupRequest): Promise<LookupResponse> => {
    try {
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
      return responseData;
    } catch (error) {
      throw error;
    }
  },
  
  
  // Verify registration
  verifyRegistration: async (data: VerificationRequest): Promise<VerificationResponse> => {
    try {
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
          throw new Error(errorData.ackMessage || `API error: ${response.status} ${response.statusText}`);
        } catch (e) {
          // If we can't parse the error as JSON, just throw the status
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (error) {
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
