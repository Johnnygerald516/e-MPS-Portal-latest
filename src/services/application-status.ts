import axios, { AxiosError } from 'axios';

export interface ApplicationStatusPayload {
  applicationId: string;
  phoneNumber: string;
}

export interface ApplicationStatusResult {
  applicationID: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  StatusID: number;
  statusName: string;
  controlNumber?: string;
}

export interface ApplicationStatusResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: ApplicationStatusResult | null;
}

/**
 * Fetches application status information from the API
 * @param payload The application ID and phone number
 * @returns Application status data
 */
export const getApplicationStatus = async (payload: ApplicationStatusPayload): Promise<ApplicationStatusResponse> => {
  try {
    // Validate input
    if (!payload.applicationId && !payload.phoneNumber) {
      return {
        ackCode: 0,
        ackMessage: "Tafadhali weka namba ya ombi au namba ya simu",
        jsonResult: null
      };
    }

    // Make API request
    const response = await axios.post('/api/applications/status', payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApplicationStatusResponse>;
      
      // If the server returned an error response
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
      
      // Network error
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return {
          ackCode: 0,
          ackMessage: "Muda wa kusubiri umekwisha. Tafadhali jaribu tena.",
          jsonResult: null
        };
      }
    }
    
    // Generic error
    return {
      ackCode: 0,
      ackMessage: "Imeshindikana kupata hali ya ombi. Tafadhali jaribu tena baadae.",
      jsonResult: null
    };
  }
};
