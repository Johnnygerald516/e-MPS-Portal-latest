import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, X, Download } from 'lucide-react';
import { MigrantFormData, generateMigrantFormPDF } from './MigrantFormPDF';

interface PDFPreviewProps {
  formData: MigrantFormData;
  onDownloadPDF: () => void;
  photoUrl?: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  formData,
  onDownloadPDF,
  photoUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate PDF data URL when the preview is opened
  useEffect(() => {
    if (isOpen && !pdfUrl) {
      generatePDFPreview();
    }
  }, [isOpen, pdfUrl]);

  const handleOpen = () => {
    console.log('Opening PDF preview...');
    setIsOpen(true);
  };

  const handleClose = () => {
    console.log('Closing PDF preview...');
    setIsOpen(false);
    // Optionally clear the PDF URL to regenerate it next time
    // setPdfUrl(null);
  };

  const generatePDFPreview = async () => {
    try {
      setIsLoading(true);
      console.log('Generating PDF preview...');
      
      // Check if jsPDF is available
      const jsPDF = (await import('jspdf')).default;
      
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Generate the PDF using the same function used for download
      await generateMigrantFormPDF(
        doc, 
        formData,
        photoUrl || ''
      );
      
      // Convert the PDF to a data URL
      const pdfDataUrl = doc.output('datauristring');
      setPdfUrl(pdfDataUrl);
      
      console.log('PDF preview generated successfully');
    } catch (error) {
      console.error('Error generating PDF preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        variant="outline"
        className="flex items-center gap-2 rounded"
      >
        <Eye size={16} />
        Preview Form
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-5xl h-[90vh] flex flex-col relative">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 z-10"
        >
          <X size={20} />
        </button>
        
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Application Form Preview</h2>
        </div>
        
        {/* PDF Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              <span className="ml-3 text-gray-700">Generating preview...</span>
            </div>
          ) : pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">Failed to generate PDF preview</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-4">
          <Button
            onClick={onDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </Button>
          
          <Button
            onClick={handleClose}
            variant="outline"
            className="border border-gray-300 px-4 py-2 rounded"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
