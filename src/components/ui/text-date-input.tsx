"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, parse, isValid } from "date-fns";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface TextDateInputProps {
  field: any;
  label?: string;
  required?: boolean;
  id?: string;
}

export function TextDateInput({
  field,
  label,
  required = false,
  id,
}: TextDateInputProps) {
  // State to track the input value as text
  const [inputValue, setInputValue] = useState('');
  
  // Initialize with empty value to show placeholder
  React.useEffect(() => {
    if (field.value) {
      setInputValue(format(field.value, 'MM/dd/yyyy'));
    } else {
      setInputValue('');
    }
  }, [field.value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // If empty, set to undefined
    if (!value.trim()) {
      field.onChange(undefined);
      return;
    }
    
    // Try to parse the date
    try {
      const parsedDate = parse(value, 'MM/dd/yyyy', new Date());
      if (isValid(parsedDate)) {
        field.onChange(parsedDate);
      } else {
        field.onChange(undefined);
      }
    } catch (error) {
      field.onChange(undefined);
    }
  };

  return (
    <FormItem>
      {label && (
        <FormLabel className="text-sm font-medium text-neutral-500">
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <Input
            id={id}
            type="text"
            className="pl-10 rounded"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="mm/dd/yyyy"
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
