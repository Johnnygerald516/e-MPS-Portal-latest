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
  // Initialize with empty value - never use default values
  const [displayValue, setDisplayValue] = useState<string>('');
  
  // Update display value when field.value changes, but only if user has explicitly set it
  useEffect(() => {
    // Reset the field value to empty on component mount
    if (field.value) {
      // Check if this is a default value (today's date or close to it)
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      // If it's today, yesterday or tomorrow, it's likely a default value - clear it
      if (field.value === todayString || 
          field.value === yesterdayString || 
          field.value === tomorrowString ||
          (typeof field.value === 'string' && field.value.includes(today.getFullYear().toString()))) {
        // Clear the default value
        field.onChange('');
        setDisplayValue('');
      } else {
        // If it's not a default value, keep it (user might have selected it before)
        setDisplayValue(formatDateToMMDDYYYY(field.value));
      }
    }
  }, []);
  
  // Handle date change from the date picker
  const handleDateChange = (e: React.FormEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.currentTarget.value;
    console.log('Date input value changed to:', dateValue);
    
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
          console.log('Corrected date value:', correctedDateValue);
          
          // Update the input value
          if (e.currentTarget.type === 'date') {
            e.currentTarget.value = correctedDateValue;
          }
        }
        
        // Create a proper ISO date string (YYYY-MM-DD)
        const isoDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log('ISO date string to be saved:', isoDateString);
        
        // Update the form field with the ISO string, not a Date object
        // This is important because the API expects a string
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
          console.log('Using raw date value as fallback:', dateValue);
          field.onChange(dateValue);
          setDisplayValue(dateValue);
        } catch (e) {
          // Don't use today's date as fallback, just clear the field
          console.log('Error handling date, clearing field');
          field.onChange('');
          setDisplayValue('');
        }
      }
    } else {
      console.log('Empty date value, clearing field');
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
          <div className="absolute left-3 top-2.5 h-5 w-5 text-blue-600 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
            <button 
              type="button" 
              className="h-full px-2 text-blue-600 focus:outline-none"
              onClick={() => {
                const inputElement = document.getElementById(id || '');
                if (inputElement) {
                  inputElement.focus();
                  inputElement.click();
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
         
          <Input
            id={id}
            type="text" 
            className="pl-10 pr-10 border border-blue-500 rounded h-10"
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
              
              // Clear any default value that might be set
              if (e.currentTarget.value === new Date().toISOString().split('T')[0]) {
                e.currentTarget.value = '';
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
