"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
  onChange: (file: File | null) => void;
  value?: File | null;
  error?: string;
}

export function FileUpload({
  label,
  description,
  accept = "image/jpeg,image/png,application/pdf",
  maxSize = 5, // Default 5MB
  required = false,
  onChange,
  value,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFileError(null);

    // Check file type
    const fileType = file.type;
    const validTypes = accept.split(",");
    if (!validTypes.includes(fileType)) {
      setFileError(`Invalid file type. Please upload ${accept.replace(/,/g, " or ")}`);
      return;
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      setFileError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    onChange(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {!value ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 text-center transition-colors",
            isDragging ? "border-blue-400 bg-blue-50" : "border-slate-300",
            (error || fileError) && "border-red-300 bg-red-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto text-slate-400" />
          <p className="mt-2 text-sm text-slate-500">
            Drag and drop your file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {description || `Accepted formats: ${accept.replace(/image\//g, "").replace(/application\//g, "")}, max size: ${maxSize}MB`}
          </p>
          <Button 
            type="button" 
            className="mt-4 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
            onClick={handleBrowseClick}
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-md p-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="truncate max-w-[200px]">
                <p className="text-sm font-medium text-slate-700">{value.name}</p>
                <p className="text-xs text-slate-500">
                  {(value.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {(error || fileError) && (
        <div className="flex items-center mt-1 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error || fileError}</span>
        </div>
      )}
    </div>
  );
}
