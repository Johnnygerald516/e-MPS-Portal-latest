'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';
import { generateReceiptPDF, ReceiptPDFData } from './ReceiptPDF';
import { getReceiptByControlNumber } from '@/services/application-receipt';

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
  applicantName
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [receiptData, setReceiptData] = useState<ReceiptPDFData | null>(null);

  useEffect(() => {
    if (open && controlNumber) {
      fetchReceiptData();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, controlNumber]);

  const fetchReceiptData = async () => {
    if (!controlNumber) {
      setError('No control number provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
    const response = await getReceiptByControlNumber(controlNumber);
      
      if (response.ackCode !== 1) {
        setError(response.ackMessage || 'Failed to fetch receipt data');
        setIsLoading(false);
        return;
      }
     setReceiptData(response.jsonResult);
      
      // Generate PDF with the fetched data
      const pdfDataUrl = await generateReceiptPDF(response.jsonResult);
      setPdfUrl(pdfDataUrl);
      setIsLoading(false);
    } catch (error) {
      setError(`Failed to generate receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Receipt_${receiptData?.PaymentControlNumber || controlNumber || 'document'}.pdf`;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Generating receipt PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="font-semibold mb-2">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Receipt PDF Preview"
            />
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={!pdfUrl}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handlePrint} disabled={!pdfUrl}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPDFPreview;
