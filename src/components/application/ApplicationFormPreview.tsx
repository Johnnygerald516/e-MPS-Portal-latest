import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Download } from 'lucide-react';
import MigrantFormHTML from './MigrantFormHTML';
import { MigrantFormData } from './MigrantFormPDF';

interface ApplicationFormPreviewProps {
  formData: MigrantFormData;
  onDownloadPDF: () => void;
}

const ApplicationFormPreview: React.FC<ApplicationFormPreviewProps> = ({ 
  formData, 
  onDownloadPDF 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the form');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Migrant Pass Application Form - ${formData.applicationId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            
            th {
              font-weight: bold;
              width: 40%;
            }
            
            .form-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
              text-align: center;
            }
            
            .header-text {
              flex-grow: 1;
              text-align: center;
            }
            
            .header-text h1 {
              font-size: 14px;
              font-weight: bold;
              margin: 0;
              text-transform: uppercase;
            }
            
            .header-text h2 {
              font-size: 12px;
              margin: 5px 0;
              text-transform: uppercase;
            }
            
            .form-title {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              text-transform: uppercase;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: bold;
              margin: 20px 0 10px 0;
              text-transform: uppercase;
            }
            
            .signature-line {
              display: flex;
              justify-content: space-between;
              margin: 30px 0;
            }
            
            .signature-field {
              display: flex;
              flex-direction: column;
            }
            
            .signature-field-line {
              border-bottom: 1px solid #000;
              width: 200px;
              height: 20px;
              margin-bottom: 5px;
            }
            
            .signature-field-label {
              font-size: 10px;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
            }
          </style>
        </head>
        <body>
          <div id="printable-content"></div>
          <script>
            document.getElementById('printable-content').innerHTML = '${
              document.getElementById('printable-form')?.innerHTML
                .replace(/'/g, "\\'")
                .replace(/"/g, '\\"')
                .replace(/\n/g, '')
            }';
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 500);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline" 
        className="flex items-center gap-2 rounded"
      >
        <Eye size={16} />
        Preview Form
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Form Preview</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div id="printable-form">
              <MigrantFormHTML formData={formData} printable={true} />
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button 
                onClick={handlePrint} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Printer size={16} />
                Print Form
              </Button>
              
              <Button 
                onClick={() => {
                  onDownloadPDF();
                  setIsOpen(false);
                }} 
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationFormPreview;
