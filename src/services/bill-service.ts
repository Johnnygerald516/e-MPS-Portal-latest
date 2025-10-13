import { apiConfig } from '@/lib/config/api-config';
import { BillDetails } from '@/services/application-bill';
import { generateBillPDF, BillPDFData } from '@/components/application/BillPDF';

export interface BillData {
  controlNumber: string | number;
  billAmount: number;
  applicationID: string;
  payerName: string;
  billGenerationDate: string;
  billExpireDate: string;
  billDescription: string;
  billGeneratedBy?: string;
  billApprovedBy?: string;
  CustomerID?: string;
  currency?: string;
}

export interface BillApiResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: BillData | null;
}

export const getBillData = async (controlNumber: string | number): Promise<BillData> => {
  try {
    // Convert controlNumber to string to ensure it has string methods
    const controlNumberStr = String(controlNumber);
    
    // Make API call to fetch bill data
    const response = await fetch(`${apiConfig.baseUrl}/applications/${controlNumberStr}/bill`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bill data: ${response.status} ${response.statusText}`);
    }
    
    const responseData: BillApiResponse = await response.json();
    
    if (responseData.ackCode !== 1 || !responseData.jsonResult) {
      throw new Error(responseData.ackMessage || 'Failed to fetch bill data');
    }
    
    return responseData.jsonResult;
  } catch (error) {
    console.error('Error fetching bill data:', error);
    throw new Error('Failed to fetch bill data');
  }
};

/**
 * Converts BillData to BillPDFData format for PDF generation
 * @param billData The bill data from the API
 * @returns BillPDFData object ready for PDF generation
 */
export const convertToBillPDFData = (billData: BillData): BillPDFData => {
  return {
    applicationId: billData.applicationID,
    controlNumber: String(billData.controlNumber),
    name: billData.payerName,
    billDetails: {
      applicationID: billData.applicationID,
      payerName: billData.payerName,
      billAmount: billData.billAmount,
      currency: billData.currency || 'TZS',
      billDescription: billData.billDescription,
      billGenerationDate: billData.billGenerationDate,
      billExpireDate: billData.billExpireDate,
      billGeneratedBy: billData.billGeneratedBy,
      billApprovedBy: billData.billApprovedBy
    }
  };
};
