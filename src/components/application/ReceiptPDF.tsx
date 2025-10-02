import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { numberToWords } from '@/lib/utils/number-to-words';
import { safeFormatDate } from '@/lib/utils/date-formatter';

export interface ReceiptPDFData {
  payerName: string;
  applicationID: string;
  PaymentControlNumber: string;
  PaidAmount: number;
  Currency: string;
  PayerMobile: string;
  PaymentChannel: string;
  PaymentReceipt: string;
  ServiceProviderName: string;
  paymentDate?: string; // Optional, will use current date if not provided
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
    console.error('[ReceiptPDF] Error generating barcode:', error);
    return '';
  }
};

// Generate Receipt PDF
export const generateReceiptPDF = async (receiptData: ReceiptPDFData): Promise<string> => {
  try {
    console.log('[ReceiptPDF] Starting PDF generation');
    console.log('[ReceiptPDF] Receipt data received:', {
      PaymentReceipt: receiptData.PaymentReceipt,
      PaymentControlNumber: receiptData.PaymentControlNumber,
      payerName: receiptData.payerName,
      PaidAmount: receiptData.PaidAmount
    });
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    console.log('[ReceiptPDF] jsPDF instance created');

    // Load coat of arms image
    let coatOfArmsBase64 = '';
    try {
      const imagePaths = [
        '/images/coat-of-arms.png',
        '/images/coat_of_arm.png',
        '/assets/images/coat-of-arms.png',
        window.location.origin + '/images/coat-of-arms.png',
        window.location.origin + '/images/coat_of_arm.png'
      ];
      console.log('[ReceiptPDF] Attempting to load coat of arms from multiple paths...');
      for (const path of imagePaths) {
        try {
          console.log('[ReceiptPDF] Trying path:', path);
          coatOfArmsBase64 = await imageToBase64(path);
          if (coatOfArmsBase64 && coatOfArmsBase64.length > 100) {
            console.log('[ReceiptPDF] ✅ Successfully loaded coat of arms from:', path);
            break;
          }
        } catch (err) {
          console.warn('[ReceiptPDF] ❌ Failed to load from:', path, err);
        }
      }
      if (!coatOfArmsBase64) {
        console.warn('[ReceiptPDF] ⚠️ Could not load coat of arms from any path');
      }
    } catch (error) {
      console.error('[ReceiptPDF] Error in coat of arms loading:', error);
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
        console.log('[ReceiptPDF] Coat of arms added successfully');
      } catch (imgError) {
        console.error('[ReceiptPDF] Error adding coat of arms image:', imgError);
        currentY += 5;
      }
    } else {
      console.warn('[ReceiptPDF] No coat of arms image loaded, skipping');
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

      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text('EXCHEQUER RECEIPT', pageWidth / 2, currentY, { align: 'center' });
      currentY += 5;
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      doc.text('Stakabadhi Ya malipo ya Serikali', pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      console.log('[ReceiptPDF] Header added successfully');
    } catch (headerError) {
      console.error('[ReceiptPDF] Error adding header:', headerError);
      throw headerError;
    }

    // Receipt details section
    doc.setFontSize(11);
    doc.setFont('times', 'normal');

    const leftCol = 37; // Start at J position of JAMHURI
    const colonCol = 95; // Position for colon
    const rightCol = 98; // Value starts after colon
    const lineHeight = 8;

    // Receipt No
    doc.setFont('times', 'bold');
    doc.text('Receipt No', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(receiptData.PaymentReceipt), rightCol, currentY);
    currentY += lineHeight;

    // Full Name
    doc.setFont('times', 'bold');
    doc.text('Full Name', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(receiptData.payerName), rightCol, currentY);
    currentY += lineHeight;

    // App Ref No
    doc.setFont('times', 'bold');
    doc.text('Application Ref No', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(receiptData.applicationID), rightCol, currentY);
    currentY += lineHeight;

    // Control No
    doc.setFont('times', 'bold');
    doc.text('Control Number', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(receiptData.PaymentControlNumber), rightCol, currentY);
    currentY += lineHeight;

    // Paid Amount
    doc.setFont('times', 'bold');
    doc.text('Paid Amount', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(String(receiptData.PaidAmount) + ' ' + String(receiptData.Currency), rightCol, currentY);
    doc.setFontSize(11);
    currentY += lineHeight;

    // Amount in Words
    try {
      doc.setFont('times', 'bold');
      doc.text('Amount in Words', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'italic');
      const amountWords = numberToWords(receiptData.PaidAmount);
      const wordsText = String(amountWords) + ' ' + String(receiptData.Currency) + ' only';
      const wordsLines = doc.splitTextToSize(wordsText, pageWidth - rightCol - margin - 10);
      doc.text(wordsLines, rightCol, currentY);
      currentY += lineHeight * wordsLines.length;
    } catch (wordError) {
      console.warn('[ReceiptPDF] Error converting amount to words:', wordError);
      currentY += lineHeight;
    }

    // Payment Channel
    doc.setFont('times', 'bold');
    doc.text('Payment Channel', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(receiptData.PaymentChannel), rightCol, currentY);
    currentY += lineHeight;

    // Service Provider
    doc.setFont('times', 'bold');
    doc.text('Service Provider', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(receiptData.ServiceProviderName), rightCol, currentY);
    currentY += lineHeight;

    // Payer Mobile
    doc.setFont('times', 'bold');
    doc.text('Payer Mobile', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text(String(receiptData.PayerMobile), rightCol, currentY);
    currentY += lineHeight;

    // Date of Payment
    try {
      doc.setFont('times', 'bold');
      doc.text('Date of Payment', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'normal');
      const paymentDate = safeFormatDate(receiptData.paymentDate || new Date().toISOString());
      doc.text(String(paymentDate), rightCol, currentY);
      currentY += lineHeight;
    } catch (dateError) {
      console.warn('[ReceiptPDF] Error formatting payment date:', dateError);
      currentY += lineHeight;
    }

    // Issued By
    doc.setFont('times', 'bold');
    doc.text('Issued By', leftCol, currentY);
    doc.text(':', colonCol, currentY, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.text('Immigration Services Department', rightCol, currentY);
    currentY += lineHeight;

    // Date Issued
    try {
      doc.setFont('times', 'bold');
      doc.text('Date Issued', leftCol, currentY);
      doc.text(':', colonCol, currentY, { align: 'center' });
      doc.setFont('times', 'normal');
      const issuedDate = safeFormatDate(new Date().toISOString());
      doc.text(String(issuedDate), rightCol, currentY);
      currentY += lineHeight;
    } catch (dateError) {
      console.warn('[ReceiptPDF] Error formatting issued date:', dateError);
      currentY += lineHeight;
    }

    // Signature
    // doc.setFont('times', 'bold');
    // doc.text('Signature', leftCol, currentY);
    // doc.text(':', colonCol, currentY, { align: 'center' });
    // doc.setFont('times', 'normal');
    // doc.text('.....................', rightCol, currentY);
    // currentY += lineHeight + 10;

    // Add barcode at bottom
    if (receiptData.PaymentControlNumber) {
      try {
        const barcodeDataUrl = generateBarcode(String(receiptData.PaymentControlNumber));
        if (barcodeDataUrl) {
          const barcodeWidth = 60;
          const barcodeHeight = 15;
          doc.addImage(barcodeDataUrl, 'PNG', (pageWidth - barcodeWidth) / 2, currentY, barcodeWidth, barcodeHeight);
          currentY += barcodeHeight + 5;
          console.log('[ReceiptPDF] Barcode added successfully at bottom');
        }
      } catch (barcodeError) {
        console.error('[ReceiptPDF] Error adding barcode at bottom:', barcodeError);
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
    console.log('[ReceiptPDF] Generating PDF data URL');
    const pdfDataUrl = doc.output('dataurlstring');
    console.log('[ReceiptPDF] PDF generation complete');
    return pdfDataUrl;
  } catch (error) {
    console.error('[ReceiptPDF] Error generating receipt PDF:', error);
    console.error('[ReceiptPDF] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};
