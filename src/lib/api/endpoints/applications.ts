import api from "../axios";

// Application type
export interface Application {
  id: string;
  applicantName: string;
  dateSubmitted: string;
  status: "pending" | "approved" | "rejected" | "review";
  documents: number;
  applicationType: string;
}

// Personal Information type
export interface PersonalInfo {
  applicationId?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  countryOfBirth: string;
}

// Citizenship Information type
export interface CitizenshipInfo {
  applicationId: string;
  homeAddress: string;
  nationality: string;
  residenceCountry: string;
  documentType: string;
  documentNumber: string;
  expireDate: string;
  issuedAuthority: string;
  issuedCountry: string;
  issuedDate: string;
}

// Activity Information type
export interface ActivityInfo {
  applicationId: string;
  maritalStatus: string;
  educationLevel: string;
  activityName: string;
  activityCategory: string;
  activityPayment: number;
}

// Address Information type
export interface AddressInfo {
  applicationId: string;
  territory: string;
  region: string;
  district: string;
  ward: string;
  street: string;
}

// Dependant Information type
export interface DependantInfo {
  fullName: string;
  relationshipTypeId: string;
  passportNumber: string;
  nationalityId: string;
  issueDate: string;
  expireDate: string;
}

// Dependants submission payload
export interface DependantsPayload {
  dependants: DependantInfo[];
}

// Document Attachment type
export interface DocumentAttachment {
  attachmentTypeId: string;
  attachment: string; // base64 encoded file
}

// Continue Application type
export interface ContinueApplicationRequest {
  applicationId: string;
  phoneNumber: string;
}

// Continue Application Response type
export interface ContinueApplicationResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: {
    applicationId?: string;
    applicationID?: string;
    currentStep?: number;
    appStageID?: number;
    // Additional application data may be included
  };
}

// Applications endpoints
export const applicationsEndpoints = {
  // Get all applications
  getAll: async () => {
    try {
      const response = await api.get('/customer/applications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get application by ID
  getById: async (id: string) => {
    try {
      const response = await api.get(`/customer/applications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update application status
  updateStatus: async (id: string, status: string) => {
    try {
      const response = await api.patch(`/customer/applications/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Submit personal information
  submitPersonalInfo: async (data: PersonalInfo) => {
    try {
      const response = await api.post('/application/subject', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Submit citizenship information
  submitCitizenshipInfo: async (data: CitizenshipInfo) => {
    try {
      const response = await api.post('/application/citizenship', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Submit activity information
  submitActivityInfo: async (data: ActivityInfo) => {
    try {
      const response = await api.post('/application/activity', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Submit address information
  submitAddressInfo: async (data: AddressInfo) => {
    try {
      const response = await api.post('/application/address', data);
      return response.data;
    } catch (error) {
     throw error;
    }
  },
  
  // Upload application files
  uploadFiles: async (applicationId: string, files: FormData) => {
    try {
      const response = await api.post(`/application/files?api-key=f9fcda23-3fcd-497f-875e-e211562331ea`, files, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
    throw error;
    }
  },
  
  // Get declaration page data
  getDeclaration: async (applicationId: string) => {
    try {
      const response = await api.get(`/application/declaration`, {
        params: { applicationId }
      });
      return response.data;
    } catch (error) {
     throw error;
    }
  },
  
  // Submit dependant information
  submitDependantInfo: async (applicationId: string, data: DependantsPayload) => {
    try {
      const response = await api.post(`/applications/${applicationId}/dependants`, data);
      return response.data;
    } catch (error) {
     throw error;
    }
  },
  
  // Submit document attachment
  submitDocumentAttachment: async (applicationId: string, data: DocumentAttachment) => {
    try {
      const response = await api.post(`/applications/${applicationId}/attachments`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Continue application — uses relative URL so the request is proxied through
  // Next.js rewrites (/applications/:path* → external API), avoiding CORS.
  continueApplication: async (data: ContinueApplicationRequest): Promise<ContinueApplicationResponse> => {
    try {
      const response = await fetch('/applications/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.ackMessage || `API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json() as ContinueApplicationResponse;
    } catch (error) {
      throw error;
    }
  }
};
