import axios, { AxiosError } from 'axios';
import { apiConfig } from '@/lib/config/api-config';

export interface BillDetails {
  applicationID: string;
  payerName: string;
  billAmount: number;
  currency: string;
  billDescription?: string;
  billGeneratedBy?: string;
  billApprovedBy?: string;
  billGenerationDate?: string;
  billExpireDate?: string;
}

export interface BillResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: BillDetails | null;
}

/**
 * Fetches bill details for an application using its control number
 * @param controlNumber The control number of the application
 * @returns Bill details data
 */
export const getApplicationBill = async (controlNumber: string): Promise<BillResponse> => {
  try {
    // Validate input
    if (!controlNumber) {
      return {
        ackCode: 0,
        ackMessage: "Namba ya control inahitajika",
        jsonResult: null
      };
    }

    // Make API request
    const response = await axios.get(`${apiConfig.baseUrl}/applications/${controlNumber}/bill`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<BillResponse>;
      
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
      ackMessage: "Imeshindikana kupata taarifa za bili. Tafadhali jaribu tena baadae.",
      jsonResult: null
    };
  }
};
