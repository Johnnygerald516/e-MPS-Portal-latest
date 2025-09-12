"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Helper function to format date to MM/DD/YYYY
function formatDateToMMDDYYYY(date: Date | string | undefined): string {
  if (!date) return '';
  
  if (date instanceof Date) {
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    // Check for unrealistic years (like 0001, 0002)
    const year = date.getFullYear();
    if (year < 1900) {
      // Use current year instead
      const currentYear = new Date().getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}/${day}/${currentYear}`;
    }
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}/${year}`;
  }
  
  // If it's a string in ISO format (YYYY-MM-DD)
  if (typeof date === 'string' && date.includes('-')) {
    try {
      const [year, month, day] = date.split('-');
      // Validate parts
      if (!year || !month || !day) return '';
      
      // Check for unrealistic years
      let yearNum = parseInt(year);
      if (yearNum < 1900) {
        yearNum = new Date().getFullYear();
      }
      
      // Create a date object to validate
      const dateObj = new Date(`${yearNum}-${month}-${day}T00:00:00`);
      if (isNaN(dateObj.getTime())) return '';
      
      return `${month}/${day}/${yearNum}`;
    } catch (error) {
      console.error('Error parsing date:', error);
      return '';
    }
  }
  
  // If it's a string in MM/DD/YYYY format
  if (typeof date === 'string' && date.includes('/')) {
    try {
      const [month, day, year] = date.split('/');
      // Validate parts
      if (!year || !month || !day) return '';
      
      // Check for unrealistic years
      let yearNum = parseInt(year);
      if (yearNum < 1900) {
        yearNum = new Date().getFullYear();
        return `${month}/${day}/${yearNum}`;
      }
      
      // Create a date object to validate
      const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
      if (isNaN(dateObj.getTime())) return '';
      
      return date.toString();
    } catch (error) {
      console.error('Error parsing date:', error);
      return '';
    }
  }
  
  // Return as is if format is unknown
  return date.toString();
}

// Helper function to convert MM/DD/YYYY to YYYY-MM-DD
function convertToISOFormat(dateString: string): string {
  try {
    if (!dateString) return '';
    
    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/');
      if (!year || !month || !day) return '';
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateString;
  } catch (error) {
    console.error('Error converting date format:', error);
    return '';
  }
}

interface CustomDateInputProps {
  field: any;
  label?: string; 
  required?: boolean;
  id?: string;
}

export function CustomDateInput({
  field,
  label,
  required = false,
  id,
}: CustomDateInputProps) {
  // Format the initial value if it exists
  const [displayValue, setDisplayValue] = useState<string>(
    formatDateToMMDDYYYY(field.value)
  );
  
  // Update display value when field.value changes
  useEffect(() => {
    setDisplayValue(formatDateToMMDDYYYY(field.value));
  }, [field.value]);
  
  // Handle date change from the date picker
  const handleDateChange = (e: React.FormEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.currentTarget.value;
    
    if (dateValue) {
      try {
        // Parse the date value
        let [year, month, day] = dateValue.split('-');
        let yearNum = parseInt(year);
        
        // Check for unrealistic years (like 0001, 0002)
        if (yearNum < 1900) {
          // Use current year instead
          yearNum = new Date().getFullYear();
          year = yearNum.toString();
          
          // Create a corrected date string
          const correctedDateValue = `${year}-${month}-${day}`;
          
          // Update the input value
          if (e.currentTarget.type === 'date') {
            e.currentTarget.value = correctedDateValue;
          }
        }
        
        // Create a proper ISO date string (YYYY-MM-DD)
        const isoDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        // Update the form field with the ISO string, not a Date object
        // This is important because the residence-info page expects a string
        field.onChange(isoDateString);
        
        // Format for display
        const dateObj = new Date(`${isoDateString}T12:00:00Z`);
        if (!isNaN(dateObj.getTime())) {
          setDisplayValue(formatDateToMMDDYYYY(dateObj));
        } else {
          // If date is invalid, still use the input value but format it
          setDisplayValue(`${month}/${day}/${year}`);
        }
        
        return;
      } catch (error) {
        console.error('Error handling date change:', error);
        // If there's an error parsing, try to salvage the date
        try {
          // Just use the raw value as a fallback
          field.onChange(dateValue);
          setDisplayValue(dateValue);
        } catch (e) {
          // Last resort - use today's date
          const today = new Date();
          const todayIso = today.toISOString().split('T')[0];
          field.onChange(todayIso);
          setDisplayValue(formatDateToMMDDYYYY(today));
        }
      }
    } else {
      field.onChange('');
      setDisplayValue('');
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
            placeholder="mm/dd/yyyy"
            value={displayValue}
            onChange={(e) => setDisplayValue(e.target.value)}
            onFocus={(e) => {
              // When focused, change to date type to show date picker
              e.currentTarget.type = "date";
              
              // If we have a value, convert from MM/DD/YYYY to YYYY-MM-DD for the date input
              if (displayValue && displayValue.includes('/')) {
                const isoDate = convertToISOFormat(displayValue);
                if (isoDate) {
                  e.currentTarget.value = isoDate;
                }
              }
              
              // Don't call showPicker() here as it requires a user gesture
              // The date picker will show automatically when the input type is 'date'
            }}
            onBlur={(e) => {
              // When blurred, change back to text type to show placeholder
              if (!e.currentTarget.value) {
                e.currentTarget.type = "text";
              } else if (e.currentTarget.type === "date") {
                // Handle the date value when blurring from date picker
                handleDateChange(e);
                e.currentTarget.type = "text";
              }
            }}
            // Handle when date is selected from picker
            onChangeCapture={(e) => {
              if (e.currentTarget.type === "date") {
                handleDateChange(e);
              }
            }}
 />
 </div>    
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
