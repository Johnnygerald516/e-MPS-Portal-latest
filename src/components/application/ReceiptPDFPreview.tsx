import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { ReceiptPDFData, generateReceiptPDF } from './ReceiptPDF';
import { getApplicationReceipt, ReceiptDetails } from '@/services/receipt-service';

interface ReceiptPDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controlNumber: string | null;
  applicationId: string;
  applicantName: string;
}

const ReceiptPDFPreview: React.FC<ReceiptPDFPreviewProps> = ({
  open,
  onOpenChange,
  controlNumber,
  applicationId,
  applicantName,
}) => {
  const [receiptData, setReceiptData] = useState<ReceiptPDFData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch receipt data when dialog opens
  useEffect(() => {
    if (open && controlNumber) {
      fetchReceiptData(controlNumber);
    } else {
      // Reset state when closed
      setPdfUrl(null);
      setReceiptData(null);
      setError(null);
    }
  }, [open, controlNumber]);

  // Generate PDF when receipt data is available
  useEffect(() => {
    if (receiptData && !pdfUrl) {
      generatePDFPreview();
    }
  }, [receiptData, pdfUrl]);

  const fetchReceiptData = async (ctrlNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getApplicationReceipt(ctrlNumber);

      if (response.ackCode === 1 && response.jsonResult) {
        const data: ReceiptPDFData = {
          payerName: response.jsonResult.payerName,
          applicationID: response.jsonResult.applicationID,
          PaymentControlNumber: response.jsonResult.PaymentControlNumber,
          PaidAmount: response.jsonResult.PaidAmount,
          Currency: response.jsonResult.Currency,
          PayerMobile: response.jsonResult.PayerMobile,
          PaymentChannel: response.jsonResult.PaymentChannel,
          PaymentReceipt: response.jsonResult.PaymentReceipt,
          ServiceProviderName: response.jsonResult.ServiceProviderName,
        };
        setReceiptData(data);
      } else {
        setError(response.ackMessage || 'Failed to fetch receipt details');
      }
    } catch (err) {
      setError('An error occurred while fetching receipt details');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFPreview = async () => {
    if (!receiptData) return;

    try {
      const pdfDataUrl = await generateReceiptPDF(receiptData);
      setPdfUrl(pdfDataUrl);
    } catch (error) {
      setError(`Failed to generate PDF preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Receipt_${receiptData?.PaymentControlNumber || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!pdfUrl) return;

    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Receipt Preview</h2>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </>
            )}
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Loading receipt details...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-red-600">{error}</p>
                <Button onClick={handleClose} variant="outline" size="sm" className="mt-4">
                  Close
                </Button>
              </div>
            </div>
          )}

          {pdfUrl && !isLoading && !error && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Receipt PDF Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptPDFPreview;
