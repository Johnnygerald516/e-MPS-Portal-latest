"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DatePickerInputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: Date | string;
  onChange?: (date: Date | undefined, formattedValue: string) => void;
  required?: boolean;
  className?: string;
  inputClassName?: string;
}

export function DatePickerInput({
  id,
  label,
  placeholder = "Pick a date",
  value,
  onChange,
  required = false,
  className,
  inputClassName,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false)
  
  // Initialize date state from value prop
  const initialDate = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    try {
      const date = new Date(value)
      return isValidDate(date) ? date : undefined
    } catch {
      return undefined
    }
  }, [value])
  
  const [date, setDate] = React.useState<Date | undefined>(initialDate)
  const [month, setMonth] = React.useState<Date | undefined>(initialDate || new Date())
  const [inputValue, setInputValue] = React.useState(formatDate(initialDate))

  // Update internal state when value prop changes
  React.useEffect(() => {
    console.log("DatePickerInput value changed:", value);
    
    if (!value) {
      console.log("No value, clearing date state");
      setDate(undefined);
      setInputValue("");
      return;
    }
    
    try {
      const newDate = value instanceof Date ? value : new Date(value);
      console.log("Parsed date:", newDate);
      
      if (isValidDate(newDate)) {
        console.log("Setting date state to:", newDate);
        setDate(newDate);
        setMonth(newDate);
        const formatted = formatDate(newDate);
        console.log("Setting input value to:", formatted);
        setInputValue(formatted);
      } else {
        console.log("Invalid date:", newDate);
      }
    } catch (error) {
      console.error("Error parsing date value:", error);
    }
  }, [value])

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined, closePopup: boolean = false) => {
    console.log("DatePickerInput handleDateSelect:", newDate, "closePopup:", closePopup);
    
    setDate(newDate);
    const formatted = formatDate(newDate);
    console.log("Formatted selected date:", formatted);
    
    setInputValue(formatted);
    
    // Only close the popup if explicitly requested
    if (closePopup) {
      console.log("Closing popup as requested");
      setOpen(false);
    }
    
    if (onChange) {
      console.log("Calling onChange with:", newDate, formatted);
      onChange(newDate, formatted);
    } else {
      console.log("No onChange handler provided");
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    try {
      const newDate = new Date(value)
      if (isValidDate(newDate)) {
        setDate(newDate)
        setMonth(newDate)
        
        if (onChange) {
          onChange(newDate, value)
        }
      } else if (onChange && value === "") {
        // Handle clearing the input
        onChange(undefined, "")
      }
    } catch (error) {
      // Invalid date format, just update the input value
      console.log("Invalid date format in input")
    }
  }

  const uniqueId = id || React.useId()

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={uniqueId} className="text-sm font-medium text-neutral-500 mb-1 block">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          id={uniqueId}
          value={inputValue}
          placeholder={placeholder}
          className={cn(
            "pl-3 pr-10 py-2 border rounded w-full",
            inputClassName
          )}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${uniqueId}-picker`}
              type="button"
              variant="ghost"
              className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
            >
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-4 shadow-md rounded-md border border-gray-200"
            align="start"
          >
            <Calendar
              selected={date}
              month={month}
              onSelect={handleDateSelect}
              fromYear={1900}
              toYear={2100}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
