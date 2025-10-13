import { apiConfig } from '@/lib/config/api-config';
import { generateReceiptPDF, ReceiptPDFData } from '@/components/application/ReceiptPDF';

export interface ReceiptData {
  receiptNumber: string;
  controlNumber: string;
  amount: string;
  applicationId: string;
  applicantName: string;
  paymentDate: string;
  paymentMethod: string;
  serviceType: string;
  transactionId: string;
  payerMobile?: string;
  serviceProviderName?: string;
}

export interface ReceiptApiResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: ReceiptData | null;
}

export const getReceiptData = async (controlNumber: string | number): Promise<ReceiptData> => {
  try {
    // Convert controlNumber to string to ensure it has string methods
    const controlNumberStr = String(controlNumber);
    
    // Make API call to fetch receipt data
    const response = await fetch(`${apiConfig.baseUrl}/applications/${controlNumberStr}/receipt`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch receipt data: ${response.status} ${response.statusText}`);
    }
    
    const responseData: ReceiptApiResponse = await response.json();
    
    if (responseData.ackCode !== 1 || !responseData.jsonResult) {
      throw new Error(responseData.ackMessage || 'Failed to fetch receipt data');
    }
    
    return responseData.jsonResult;
  } catch (error) {
    console.error('Error fetching receipt data:', error);
    throw new Error('Failed to fetch receipt data');
  }
};

/**
 * Converts ReceiptData to ReceiptPDFData format for PDF generation
 * @param receiptData The receipt data from the API
 * @returns ReceiptPDFData object ready for PDF generation
 */
export const convertToReceiptPDFData = (receiptData: ReceiptData): ReceiptPDFData => {
  return {
    payerName: receiptData.applicantName,
    applicationID: receiptData.applicationId,
    PaymentControlNumber: receiptData.controlNumber,
    PaidAmount: parseFloat(receiptData.amount) || 0,
    Currency: 'TZS',
    PayerMobile: receiptData.payerMobile || '',
    PaymentChannel: receiptData.paymentMethod,
    PaymentReceipt: receiptData.receiptNumber,
    ServiceProviderName: receiptData.serviceProviderName || 'Immigration Services Department',
    paymentDate: receiptData.paymentDate
  };
};
