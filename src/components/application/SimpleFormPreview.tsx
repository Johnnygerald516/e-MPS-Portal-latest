import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';
import { MigrantFormData } from './MigrantFormPDF';
import MigrantFormHTML from './MigrantFormHTML';

interface SimpleFormPreviewProps {
  formData: MigrantFormData;
  onDownloadPDF: () => void;
  photoUrl?: string;
}

const SimpleFormPreview: React.FC<SimpleFormPreviewProps> = ({
  formData,
  onDownloadPDF,
  photoUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
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
      <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-5xl max-h-[90vh] overflow-auto p-6 relative">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
        
        {/* Header */}
        <div className="mb-4 border-b pb-2">
          <h2 className="text-xl font-semibold">Application Form Preview</h2>
        </div>
        
        {/* Content */}
        <div className="mt-4">
          <div id="printable-form">
            <MigrantFormHTML formData={formData} printable={true} photoUrl={photoUrl} />
          </div>
          
          {/* Footer */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
            <Button
              onClick={() => {
                onDownloadPDF();
                handleClose();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
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
    </div>
  );
};

export default SimpleFormPreview;
