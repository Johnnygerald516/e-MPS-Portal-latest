import axios, { AxiosError } from 'axios';
import { apiConfig, ensureHttps } from '@/lib/config/api-config';

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
  jsonResult: ReceiptDetails;
}

/**
 * Fetch receipt details for an application by control number
 */
export const getReceiptByControlNumber = async (controlNumber: string): Promise<ReceiptResponse> => {
  try {
    // Validate input
    if (!controlNumber) {
      return {
        ackCode: 0,
        ackMessage: "Namba ya control inahitajika",
        jsonResult: {
          payerName: '',
          applicationID: '',
          PaymentControlNumber: '',
          PaidAmount: 0,
          Currency: 'TZS',
          PayerMobile: '',
          PaymentChannel: '',
          PaymentReceipt: '',
          ServiceProviderName: ''
        }
      };
    }

   // Use local Next.js API route for proper HTTPS handling and redirect management
    const response = await axios.get(`/api/applications/${controlNumber}/receipt`);
  
    
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
          jsonResult: {
            payerName: '',
            applicationID: '',
            PaymentControlNumber: '',
            PaidAmount: 0,
            Currency: 'TZS',
            PayerMobile: '',
            PaymentChannel: '',
            PaymentReceipt: '',
            ServiceProviderName: ''
          }
        };
      }
    }
    
    // Generic error
    return {
      ackCode: 0,
      ackMessage: "Imeshindikana kupata taarifa za risiti. Tafadhali jaribu tena baadae.",
      jsonResult: {
        payerName: '',
        applicationID: '',
        PaymentControlNumber: '',
        PaidAmount: 0,
        Currency: 'TZS',
        PayerMobile: '',
        PaymentChannel: '',
        PaymentReceipt: '',
        ServiceProviderName: ''
      }
    };
  }
};
