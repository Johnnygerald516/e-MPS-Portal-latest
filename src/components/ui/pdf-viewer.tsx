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
      <DialogContent className="w-[70vw] h-[90vh] max-w-[95vw] sm:max-w-[800px] md:max-w-[1000px] lg:max-w-[1200px]">
 <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full mb-50">
            <iframe
              src={pdfPath}
              className="w-full h-full"
              title={title}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
