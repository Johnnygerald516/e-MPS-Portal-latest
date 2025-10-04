import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, X, Download, Printer, Loader2 } from 'lucide-react';
import { PassData, generatePassPDF } from './PassPDF';
import { getApplicationPass, convertToPassData } from '@/services/application-pass';

// Props for the component when used with direct pass data
interface DirectPassPDFPreviewProps {
  passData: PassData;
  onDownloadPDF: () => void;
  onPrintPDF?: () => void;
  photoUrl?: string;
  signatureUrl?: string;
  qrCodeUrl?: string;
}

// Props for the component when used with application ID
interface ApplicationPassPDFPreviewProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  applicationId: string | null;
  refreshApplications: () => void;
}

// Union type to accept either set of props
type PassPDFPreviewProps = DirectPassPDFPreviewProps | ApplicationPassPDFPreviewProps;

// Type guard to check which props are being used
function isApplicationProps(props: PassPDFPreviewProps): props is ApplicationPassPDFPreviewProps {
  return 'applicationId' in props && 'open' in props;
}

const PassPDFPreview: React.FC<PassPDFPreviewProps> = (props) => {
  // State for application ID based usage
  const [mockPassData, setMockPassData] = useState<PassData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Determine which props are being used
  const isAppProps = isApplicationProps(props);
  
  // For direct pass data usage
  const [isOpen, setIsOpen] = useState(isAppProps ? props.open : false);

  // Sync open state with props when using application ID
  useEffect(() => {
    if (isAppProps) {
      setIsOpen(props.open);
    }
  }, [isAppProps && props.open]);
  
  // Load application data when using application ID
  useEffect(() => {
    if (isAppProps && props.applicationId && props.open) {
      fetchApplicationData(props.applicationId);
    }
  }, [isAppProps && props.applicationId, isAppProps && props.open]);
  
  // Generate PDF data URL when the preview is opened
  useEffect(() => {
    if (isOpen && !pdfUrl && (!isAppProps || mockPassData)) {
      generatePDFPreview();
    }
  }, [isOpen, pdfUrl, mockPassData]);
  
  // Fetch application data based on ID
  const fetchApplicationData = async (id: string) => {
    setIsLoading(true);
    try {
     const response = await getApplicationPass(id);
      
      if (response.ackCode === 1 && response.jsonResult) {
        // Convert API response to PassData format
        const passData = convertToPassData(response);
        
        if (passData) {
          setMockPassData(passData);
        } else {
         
        }
      } else {
       
      }
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    if (isAppProps) {
      props.onOpenChange(true);
    } else {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    if (isAppProps) {
      props.onOpenChange(false);
      // Refresh applications if needed
      props.refreshApplications();
    } else {
      setIsOpen(false);
    }
    // Optionally clear the PDF URL to regenerate it next time
    // setPdfUrl(null);
  };

  const generatePDFPreview = async () => {
    try {
      setIsLoading(true);
      
      // Check if jsPDF is available
      const jsPDF = (await import('jspdf')).default;
      
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Determine which pass data to use
      const currentPassData = isAppProps ? mockPassData : (props as DirectPassPDFPreviewProps).passData;
      
      if (!currentPassData) {
        return;
      }
      
      // Generate the PDF using the same function used for download
      await generatePassPDF(
        doc, 
        currentPassData,
        // Use photo from passData if available (from API) or from props
        isAppProps ? currentPassData.photo : (props as DirectPassPDFPreviewProps).photoUrl,
        isAppProps ? undefined : (props as DirectPassPDFPreviewProps).signatureUrl,
        isAppProps ? undefined : (props as DirectPassPDFPreviewProps).qrCodeUrl
      );
      
      // Convert the PDF to a data URL
      const pdfDataUrl = doc.output('datauristring');
      setPdfUrl(pdfDataUrl);
      
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle download PDF for application ID usage
  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true);
      
      // Check if jsPDF is available
      const jsPDF = (await import('jspdf')).default;
      
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Determine which pass data to use
      const currentPassData = isAppProps ? mockPassData : (props as DirectPassPDFPreviewProps).passData;
      
      if (!currentPassData) {
        return;
      }
      
      // Generate the PDF
      await generatePassPDF(
        doc, 
        currentPassData,
        // Use photo from passData if available (from API) or from props
        isAppProps ? currentPassData.photo : (props as DirectPassPDFPreviewProps).photoUrl,
        isAppProps ? undefined : (props as DirectPassPDFPreviewProps).signatureUrl,
        isAppProps ? undefined : (props as DirectPassPDFPreviewProps).qrCodeUrl
      );
      
      // Save the PDF
      doc.save(`Migrant_Pass_${currentPassData.id}.pdf`);
      
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle print PDF for application ID usage
  const handlePrintPDF = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  // Only show the button if not using application props or if not open
  if (!isAppProps && !isOpen) {
    return (
      <Button
        onClick={handleOpen}
        variant="outline"
        className="flex items-center gap-2 rounded"
      >
        <Eye size={16} />
        Preview Pass
      </Button>
    );
  }
  
  // Don't render anything if using application props and not open
  if (isAppProps && !props.open) {
    return null;
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
        
        {/* Header removed to avoid duplicate titles */}
        
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
              title="Pass PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {/* <p className="text-red-500">Failed to generate PDF preview</p> */}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-4">
          <Button
            onClick={isAppProps ? handleDownloadPDF : (props as DirectPassPDFPreviewProps).onDownloadPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </Button>
          
          {(isAppProps || (props as DirectPassPDFPreviewProps).onPrintPDF) && (
            <Button
              onClick={isAppProps ? handlePrintPDF : (props as DirectPassPDFPreviewProps).onPrintPDF!}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Printer size={16} />
                  Print Pass
                </>
              )}
            </Button>
          )}
          
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

export default PassPDFPreview;
