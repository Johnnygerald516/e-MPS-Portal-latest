"use client";

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { verificationEndpoints } from '@/lib/api/endpoints/verification';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface DocumentTypeOption {
  value: string;
  label: string;
  id: number;
}

interface DocumentTypeSelectProps {
  field: any;
  label?: string; 
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onDocumentTypeChange?: (id: number, name: string) => void;
}

export function DocumentTypeSelect({
  field,
  label,
  required = false,
  placeholder = "Select Document Type",
  disabled = false,
  onDocumentTypeChange,
}: DocumentTypeSelectProps) {
  const [documentTypeOptions, setDocumentTypeOptions] = useState<DocumentTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      setIsLoading(true);
      try {
        // Direct API call to ensure we're using the live endpoint
        const payload = {
          operationType: "DocumentType",
          argument1: 1,
          argument2: 0
        };
        
        const response = await fetch('/applications/lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.ackCode === 1 && data.jsonResult && data.jsonResult.length > 0) {
          const options = data.jsonResult.map((type: any) => ({
            value: type.DocumentTypeID.toString(),
            label: type.DocumentName,
            id: type.DocumentTypeID
          }));
          
          setDocumentTypeOptions(options);
          console.log('Document types loaded:', options.length);
        } else {
          console.warn('API returned success but no document types found');
          setDocumentTypeOptions([]);
        }
      } catch (error) {
        console.error("Error fetching document types:", error);
        setDocumentTypeOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  return (
    <FormItem>
      {label && (
        <FormLabel className="text-sm font-medium text-neutral-500">
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
      )}
      <Select
        onValueChange={(value: string) => {
          field.onChange(value);
          
          if (onDocumentTypeChange) {
            const selectedOption = documentTypeOptions.find(opt => opt.value === value);
            if (selectedOption) {
              onDocumentTypeChange(selectedOption.id, selectedOption.label);
            }
          }
        }}
        value={field.value}
        disabled={disabled || isLoading}
      >
        <FormControl>
          <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-slate-400" />
              <SelectValue placeholder={placeholder} />
            </div>
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : documentTypeOptions.length > 0 ? (
            documentTypeOptions.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No document types found</SelectItem>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
