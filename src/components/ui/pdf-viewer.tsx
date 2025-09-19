"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface PDFViewerProps {
  pdfPath: string;
  buttonText?: string;
  title?: string;
  variant?: "outline" | "default" | "secondary" | "ghost" | "link";
  className?: string;
}

export function PDFViewer({ 
  pdfPath, 
  buttonText = "View PDF", 
  title = "Document Viewer",
  variant = "outline",
  className = "flex items-center gap-2"
}: PDFViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant={variant}
        className={className}
      >
        <FileText className="h-4 w-4 mr-2 text-red-400" />
        {buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-[650px] md:max-w-[700px] lg:max-w-[750px] p-3 pt-3 shadow-lg border border-gray-200">
          <div className="flex flex-col space-y-0">
            <DialogTitle className="text-lg font-semibold mb-0 pb-0">{title}</DialogTitle>
            <div className="w-full h-[calc(100%-1.5rem)] mt-1 overflow-hidden rounded">
              <iframe
                src={pdfPath}
                className="w-full h-full border-0 shadow-sm"
                title={title}
                loading="eager"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
