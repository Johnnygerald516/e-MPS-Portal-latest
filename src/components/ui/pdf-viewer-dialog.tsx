"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Download, Printer, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "./dialog";
import { Button } from "./button";
import { generatePDF } from "@/lib/utils/pdf-generator";

interface PDFViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  title: string;
  filename?: string;
}

export function PDFViewerDialog({
  isOpen,
  onClose,
  contentRef,
  title,
  filename = "document.pdf"
}: PDFViewerDialogProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Show content directly when dialog opens
  useEffect(() => {
    if (isOpen) {
      try {
        setIsGenerating(true);
        setError(null);
        
        // Check if contentRef exists
        if (!contentRef.current) {
          console.error("Content reference is null or undefined");
          setError("Content reference is missing. Please try again.");
          setIsGenerating(false);
          return;
        }
        
        console.log("Content reference found:", contentRef.current);
        
        // We'll just show the content directly instead of generating a PDF
        setTimeout(() => {
          setIsGenerating(false);
        }, 500); // Short delay to show loading state
      } catch (err) {
        console.error("Error in preview process:", err);
        setError("Failed to display preview. Please try again.");
        setIsGenerating(false);
      }
    }
  }, [isOpen, contentRef]);

  // Handle download using html2canvas and jsPDF
  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    try {
      setIsGenerating(true);
      const pdfBlob = await generatePDF(contentRef.current, filename);
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error generating PDF for download:', error);
      setError('Failed to generate PDF for download. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle print using browser's print functionality
  const handlePrint = () => {
    if (!contentRef.current) return;
    
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setError('Unable to open print window. Please check your popup blocker settings.');
        return;
      }
      
      // Write the content to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; }
              .container { width: 210mm; height: 297mm; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="container">
              ${contentRef.current.outerHTML}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing:', error);
      setError('Failed to print. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] w-[1200px] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full w-full">
          {/* Header - more compact */}
          <div className="flex justify-between items-center py-3 px-4 border-b bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                disabled={isGenerating || !contentRef.current}
                className="bg-white hover:bg-gray-100 border-gray-300"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrint}
                disabled={isGenerating || !contentRef.current}
                className="bg-white hover:bg-gray-100 border-gray-300"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 hover:bg-gray-200" 
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-6" />
                <p className="text-lg text-gray-600">Generating PDF preview...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center">
                <p className="text-red-500 text-lg mb-6">{error}</p>
                <Button onClick={onClose} size="lg">Close</Button>
              </div>
            ) : contentRef.current ? (
              <div className="w-full h-full flex justify-center bg-gray-100 p-4 overflow-auto">
                <div 
                  className="bg-white shadow-lg" 
                  style={{
                    width: "210mm",  /* A4 width */
                    height: "297mm", /* A4 height */
                    padding: "0",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {/* Insert the content directly */}
                  <div 
                    className="w-full h-full" 
                    dangerouslySetInnerHTML={{ __html: contentRef.current.outerHTML }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
