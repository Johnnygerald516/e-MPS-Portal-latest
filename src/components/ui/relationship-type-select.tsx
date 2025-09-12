"use client";

import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { verificationEndpoints } from '@/lib/api/endpoints/verification';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface RelationshipTypeOption {
  value: string;
  label: string;
  id: number;
  localizedLabel?: string;
}

interface RelationshipTypeSelectProps {
  field: any;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onRelationshipTypeChange?: (id: number, name: string) => void;
  showLocalizedLabels?: boolean;
}

export function RelationshipTypeSelect({
  field,
  label,
  required = false,
  placeholder = "Select Relationship Type",
  disabled = false,
  onRelationshipTypeChange,
  showLocalizedLabels = true,
}: RelationshipTypeSelectProps) {
  const [relationshipOptions, setRelationshipOptions] = useState<RelationshipTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRelationshipTypes = async () => {
      setIsLoading(true);
      try {
        // Direct API call to ensure we're using the live endpoint
        const payload = {
          operationType: "RelationType",
          argument1: 1,
          argument2: 0
        };
        
        const response = await fetch('/api/applications/lookup', {
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
            value: type.RelationTypeID.toString(),
            label: type.RelationName,
            id: type.RelationTypeID,
            localizedLabel: type.Uhusiano
          }));
          
          setRelationshipOptions(options);
          console.log('Relationship types loaded:', options.length);
        } else {
          console.warn('API returned success but no relationship types found');
          setRelationshipOptions([]);
        }
      } catch (error) {
        console.error("Error fetching relationship types:", error);
        setRelationshipOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelationshipTypes();
  }, []);

  return (
    <FormItem>
      {label && (
        <FormLabel className="text-sm font-medium text-neutral-500">
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
      )}
      <Select
        onValueChange={(value) => {
          field.onChange(value);
          
          if (onRelationshipTypeChange) {
            const selectedOption = relationshipOptions.find(opt => opt.value === value);
            if (selectedOption) {
              onRelationshipTypeChange(selectedOption.id, selectedOption.label);
            }
          }
        }}
        value={field.value}
        disabled={disabled || isLoading}
      >
        <FormControl>
          <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-slate-400" />
              <SelectValue placeholder={placeholder} />
            </div>
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : relationshipOptions.length > 0 ? (
            relationshipOptions.map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {showLocalizedLabels && option.localizedLabel ? 
                  `${option.label} (${option.localizedLabel})` : 
                  option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No relationship types found</SelectItem>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
