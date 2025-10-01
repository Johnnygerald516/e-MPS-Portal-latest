"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePickerInput } from "@/components/ui/date-picker-input";

interface DatePickerFormFieldProps {
  field: {
    value: string | Date | undefined;
    onChange: (value: string) => void;
  };
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function DatePickerFormField({
  field,
  label,
  required = false,
  placeholder = "Chagua tarehe",
  className,
}: DatePickerFormFieldProps) {
  // Handle date change from the DatePickerInput component
  const handleDateChange = (date: Date | undefined, formattedValue: string) => {
    // Convert Date to ISO string format (YYYY-MM-DD) for the form field
    if (date) {
      const isoDateString = format(date, "yyyy-MM-dd");
      field.onChange(isoDateString);
    } else {
      field.onChange("");
    }
  };

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel className="text-sm font-medium text-neutral-500">
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <DatePickerInput
          placeholder={placeholder}
          value={field.value}
          onChange={handleDateChange}
          className="w-full"
          inputClassName="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none"
        />
      </FormControl>
      <FormMessage />  
    </FormItem>
  );
}
