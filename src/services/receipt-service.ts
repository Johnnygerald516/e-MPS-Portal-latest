import axios, { AxiosError } from 'axios';
import { apiConfig } from '@/lib/config/api-config';
import { generateReceiptPDF, ReceiptPDFData } from '@/components/application/ReceiptPDF';

// Backend API response structure - matches your Postman response
export interface ReceiptDetails {
  payerName: string;
  applicationID: string;
  PaymentControlNumber: string;
  PaidAmount: number;
  Currency: string;
  PayerMobile: string;
  PaymentChannel: string;
  PaymentReceipt: string;
  ServiceProviderName: string;
}

export interface ReceiptResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: ReceiptDetails | null;
}

/**
 * Fetches receipt details for an application using its control number
 * @param controlNumber The control number of the application
 * @returns Receipt details data
 */
export const getApplicationReceipt = async (controlNumber: string): Promise<ReceiptResponse> => {
  try {
    // Validate input
    if (!controlNumber) {
      return {
        ackCode: 0,
        ackMessage: "Namba ya control inahitajika",
        jsonResult: null
      };
    }

    // Make API request using axios (same as bill service)
    const response = await axios.get(`${apiConfig.baseUrl}/applications/${controlNumber}/receipt`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ReceiptResponse>;
      
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
      ackMessage: "Imeshindikana kupata taarifa za risiti. Tafadhali jaribu tena baadae.",
      jsonResult: null
    };
  }
};

// Keep the old function name for backward compatibility
export const getReceiptData = getApplicationReceipt;
