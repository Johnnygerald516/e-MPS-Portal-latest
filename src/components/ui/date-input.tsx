"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return ""
  }

  // Format as DD/MM/YYYY which is more common in Tanzania
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface DateInputProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateInput({
  date,
  setDate,
  label = "Date",
  placeholder = "Select date",
  className = "w-full",
  disabled = false,
}: DateInputProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(formatDate(date))

  // Update value when date prop changes (for external updates)
  React.useEffect(() => {
    setValue(formatDate(date))
    if (isValidDate(date)) {
      setMonth(date)
    }
  }, [date])

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Label htmlFor="date" className="font-medium text-sm mb-1">
          {label}
        </Label>
      )}
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div 
              className={`flex items-center h-10 px-3 py-2 rounded-md border border-input bg-background ring-offset-background 
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent hover:text-accent-foreground'} 
              ${className}`}
              onClick={() => !disabled && setOpen(true)}
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-green-600" />
              {value ? (
                <span className="font-medium">{value}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-2 shadow-lg rounded-lg overflow-hidden"
            align="start"
          >
            <div className="bg-green-600 text-white p-3 font-medium text-center">
              {label || "Select Date"}
            </div>
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              className="rounded-md bg-white p-3"
              onSelect={(date) => {
                setDate(date)
                setValue(formatDate(date))
                setOpen(false)
              }}
              initialFocus
              disabled={(date) => {
                // Disable future dates
                const today = new Date();
                return date > today;
              }}
              classNames={{
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-green-600 text-white hover:bg-green-600 hover:text-white focus:bg-green-600 focus:text-white",
                day_today: "bg-accent text-accent-foreground",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
