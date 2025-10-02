import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { BillDetails } from '@/services/application-bill';
import { numberToWords } from '@/lib/utils/number-to-words';
import { safeFormatDate } from '@/lib/utils/date-formatter';

export interface BillPDFData {
  applicationId: string;
  controlNumber: string;
  name: string;
  billDetails: BillDetails | null;
}

// Helper function to convert image URL to base64
const imageToBase64 = async (imgUrl: string): Promise<string> => {
  return new Promise<string>(resolve => {
    try {
      if (!imgUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      
      const timeoutId = setTimeout(() => {
        console.warn(`Image loading timed out for ${imgUrl}`);
        resolve('');
      }, 5000);
      
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.height = img.height;
          canvas.width = img.width;
          ctx?.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (canvasError) {
          console.error('Error creating canvas for image:', canvasError);
          resolve('');
        }
      };
      
      img.onerror = error => {
        clearTimeout(timeoutId);
        console.error(`Error loading image from ${imgUrl}:`, error);
        resolve('');
      };
      
      img.src = imgUrl;
    } catch (error) {
      console.error('Error in imageToBase64:', error);
      resolve('');
    }
  });
};

// Helper function to generate barcode
const generateBarcode = (text: string): string => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 12,
      margin: 5
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('[BillPDF] Error generating barcode:', error);
    return '';
  }
};

// Generate Bill PDF
export const generateBillPDF = async (billData: BillPDFData): Promise<string> => {
  try {
    console.log('[BillPDF] Starting PDF generation');
    console.log('[BillPDF] Bill data received:', {
      applicationId: billData.applicationId,
      controlNumber: billData.controlNumber,
      name: billData.name,
      hasBillDetails: !!billData.billDetails
    });
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    console.log('[BillPDF] jsPDF instance created');

    // Load coat of arms image
    let coatOfArmsBase64 = '';
    try {
      // Try multiple possible paths (paths relative to public folder)
      const imagePaths = [
        '/images/coat-of-arms.png',
        '/images/coat_of_arm.png',
        '/assets/images/coat-of-arms.png',
        window.location.origin + '/images/coat-of-arms.png',
        window.location.origin + '/images/coat_of_arm.png'
      ];
      console.log('[BillPDF] Attempting to load coat of arms from multiple paths...');
      for (const path of imagePaths) {
        try {
          console.log('[BillPDF] Trying path:', path);
          coatOfArmsBase64 = await imageToBase64(path);
          if (coatOfArmsBase64 && coatOfArmsBase64.length > 100) {
            console.log('[BillPDF] ✅ Successfully loaded coat of arms from:', path);
            break;
          }
        } catch (err) {
          console.warn('[BillPDF] ❌ Failed to load from:', path, err);
        }
      }
      if (!coatOfArmsBase64) {
        console.warn('[BillPDF] ⚠️ Could not load coat of arms from any path');
      }
    } catch (error) {
      console.error('[BillPDF] Error in coat of arms loading:', error);
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = margin;

    // Add coat of arms
    if (coatOfArmsBase64) {
      try {
        const imgWidth = 20;
        const imgHeight = 20;
        doc.addImage(coatOfArmsBase64, 'PNG', (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 3;
        console.log('[BillPDF] Coat of arms added successfully');
      } catch (imgError) {
        console.error('[BillPDF] Error adding coat of arms image:', imgError);
        currentY += 5;
      }
    } else {
      console.warn('[BillPDF] No coat of arms image loaded, skipping');
      currentY += 5;
    }

    // Header
    try {
      doc.setFontSize(13);
      doc.setFont('times', 'bold');
      doc.text('JAMHURI YA MUUNGANO WA TANZANIA', pageWidth / 2, currentY, { align: 'center' });
      currentY += 5;
      doc.setFontSize(12);
      doc.setFont('times', 'italic');
      doc.text('United Republic of Tanzania', pageWidth / 2, currentY, { align: 'center' });
      currentY += 5;
      doc.setFont('times', 'bold');
      doc.text('IMMIGRATION SERVICES DEPARTMENT', pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;

      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text('BILL DETAILS', pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      console.log('[BillPDF] Header added successfully');
    } catch (headerError) {
      console.error('[BillPDF] Error adding header:', headerError);
      throw headerError;
    }

    // Bill details section
    doc.setFontSize(11);
    doc.setFont('times', 'normal');

    const leftCol = 37; // Start at J position of JAMHURI
    const colonCol = 95; // Position for colon
    const rightCol = 98; // Value starts after colon
    const lineHeight = 8;

    // Application Reference Number
    doc.setFont('times', 'bold');
    doc.text('Application Ref No', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(billData.billDetails?.applicationID || billData.applicationId), rightCol, currentY);
    currentY += lineHeight;

    // Control Number
    doc.setFont('times', 'bold');
    doc.text('Control Number', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(billData.controlNumber), rightCol, currentY);
    currentY += lineHeight;

    // Full Name
    doc.setFont('times', 'bold');
    doc.text('Full Name', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(billData.billDetails?.payerName || billData.name), rightCol, currentY);
    currentY += lineHeight;

    // Description
    if (billData.billDetails?.billDescription) {
      doc.setFont('times', 'bold');
      doc.text('Item', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'normal');
      const descLines = doc.splitTextToSize(String(billData.billDetails.billDescription), pageWidth - rightCol - margin - 10);
      doc.text(descLines, rightCol, currentY);
      currentY += lineHeight * descLines.length;
    }

    // Amount
    doc.setFont('times', 'bold');
    doc.text('Bill Amount', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    const amount = billData.billDetails?.billAmount || 0;
    const currency = billData.billDetails?.currency || 'TZS';
    doc.text(String(amount) + ' ' + String(currency), rightCol, currentY);
    doc.setFontSize(11);
    currentY += lineHeight;

    // Amount in Words
    try {
      doc.setFont('times', 'bold');
      doc.text('Amount in Words', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'italic');
      const amountWords = numberToWords(amount);
      const wordsText = String(amountWords) + ' ' + String(currency) + ' only';
      const wordsLines = doc.splitTextToSize(wordsText, pageWidth - rightCol - margin - 10);
      doc.text(wordsLines, rightCol, currentY);
      currentY += lineHeight * wordsLines.length;
    } catch (wordError) {
      console.warn('[BillPDF] Error converting amount to words:', wordError);
      // Skip amount in words if it fails
      currentY += lineHeight;
    }

    // Generated By
    if (billData.billDetails?.billGeneratedBy) {
      doc.setFont('times', 'bold');
      doc.text('Billed By', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.text(String(billData.billDetails.billGeneratedBy), rightCol, currentY);
      currentY += lineHeight;
    }

    // Approved By
    if (billData.billDetails?.billApprovedBy) {
      doc.setFont('times', 'bold');
      doc.text('At', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'normal');
      doc.text(String(billData.billDetails.billApprovedBy), rightCol, currentY);
      currentY += lineHeight;
    }

    // Bill Date
    try {
      doc.setFont('times', 'bold');
      doc.text('Bill Date', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'normal');
      const billDate = safeFormatDate(billData.billDetails?.billGenerationDate || new Date().toISOString());
      doc.text(String(billDate), rightCol, currentY);
      currentY += lineHeight;
    } catch (dateError) {
      console.warn('[BillPDF] Error formatting bill date:', dateError);
      currentY += lineHeight;
    }

    // Expiry Date
    try {
      doc.setFont('times', 'bold');
      doc.text('Pay Before', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'normal');
      const expiryDate = billData.billDetails?.billExpireDate 
        ? safeFormatDate(billData.billDetails.billExpireDate) 
        : 'Not specified';
      doc.text(String(expiryDate), rightCol, currentY);
      currentY += lineHeight + 10;
    } catch (expiryError) {
      console.warn('[BillPDF] Error formatting expiry date:', expiryError);
      currentY += lineHeight + 10;
    }

    // Add some space before footer
    currentY += 10;
    
    // Add barcode at bottom
    if (billData.controlNumber) {
      try {
      const barcodeDataUrl = generateBarcode(String(billData.controlNumber));
        if (barcodeDataUrl) {
          const barcodeWidth = 60;
          const barcodeHeight = 15;
          doc.addImage(barcodeDataUrl, 'PNG', (pageWidth - barcodeWidth) / 2, currentY, barcodeWidth, barcodeHeight);
          currentY += barcodeHeight + 5;
          console.log('[BillPDF] Barcode added successfully at bottom');
        }
      } catch (barcodeError) {
        console.error('[BillPDF] Error adding barcode at bottom:', barcodeError);
        currentY += 5;
      }
    }
    
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.text('Immigration Services Department', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.text(`© ${new Date().getFullYear()} United Republic of Tanzania - All Rights Reserved`, pageWidth / 2, currentY, { align: 'center' });

    // Return as data URL
    console.log('[BillPDF] Generating PDF data URL');
    const pdfDataUrl = doc.output('dataurlstring');
    console.log('[BillPDF] PDF generation complete');
    return pdfDataUrl;
  } catch (error) {
    console.error('[BillPDF] Error generating bill PDF:', error);
    console.error('[BillPDF] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};
