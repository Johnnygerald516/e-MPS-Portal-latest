"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  FormControl,
  FormItem,
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
  // Debug the field value
  React.useEffect(() => {
    console.log("DatePickerFormField field value:", field.value);
  }, [field.value]);

  // Handle date change from the DatePickerInput component
  const handleDateChange = (date: Date | undefined, formattedValue: string) => {
    console.log("DatePickerFormField handleDateChange:", date, formattedValue);
    
    // Convert Date to ISO string format (YYYY-MM-DD) for the form field
    if (date) {
      const isoDateString = format(date, "yyyy-MM-dd");
      console.log("Setting form field value to:", isoDateString);
      field.onChange(isoDateString);
    } else {
      console.log("Clearing form field value");
      field.onChange("");
    }
  };

  return (
    <FormItem className={className}>
      <FormControl>
        <DatePickerInput
          label={label}
          required={required}
          placeholder={placeholder}
          value={field.value}
          onChange={handleDateChange}
          className="w-full"
          inputClassName="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </FormControl>
      <FormMessage />  
    </FormItem>
  );
}
