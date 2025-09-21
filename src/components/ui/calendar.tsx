"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  month?: Date;
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined, closePopup?: boolean) => void;
  fromYear?: number;
  toYear?: number;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Ensure we have a valid month to prevent "Invalid time value" errors
  const validMonth = props.month instanceof Date && !isNaN(props.month.getTime()) 
    ? props.month 
    : new Date();
    
  // Create a safe version of props
  const { month, ...restProps } = props;
  
  // State for current month/year
  const [currentMonth, setCurrentMonth] = React.useState<Date>(validMonth);
  
  // Update currentMonth when props.month changes
  React.useEffect(() => {
    if (props.month && isValidDate(props.month)) {
      setCurrentMonth(props.month);
    }
  }, [props.month]);
  
  // Update currentMonth when props.selected changes
  React.useEffect(() => {
    if (props.selected && isValidDate(props.selected)) {
      setCurrentMonth(props.selected);
    }
  }, [props.selected]);
  
  // Helper function to check if a date is valid
  function isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
  
  // Generate months for dropdown
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Generate years for dropdown (100 years before and after current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i);
  
  // Handle month change
  const handleMonthChange = (month: number) => {
    console.log("Month changed to:", month);
    const newDate = new Date(currentMonth);
    newDate.setMonth(month);
    setCurrentMonth(newDate);
    
    // If there's a selected date, update it to the new month
    if (props.selected && props.onSelect) {
      const newSelectedDate = new Date(props.selected);
      newSelectedDate.setMonth(month);
      console.log("Updating selected date with new month:", newSelectedDate);
      props.onSelect(newSelectedDate, false); // Don't close popup
    }
  };
  
  // Handle year change
  const handleYearChange = (year: number) => {
    console.log("Year changed to:", year);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    
    // If there's a selected date, update it to the new year
    if (props.selected && props.onSelect) {
      const newSelectedDate = new Date(props.selected);
      newSelectedDate.setFullYear(year);
      console.log("Updating selected date with new year:", newSelectedDate);
      props.onSelect(newSelectedDate, false); // Don't close popup
    }
  };
  
  // Handle previous month
  const handlePrevMonth = () => {
    console.log("Previous month clicked");
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
    
    // If there's a selected date, update it to the previous month
    if (props.selected && props.onSelect) {
      const newSelectedDate = new Date(props.selected);
      newSelectedDate.setMonth(newSelectedDate.getMonth() - 1);
      console.log("Updating selected date to previous month:", newSelectedDate);
      props.onSelect(newSelectedDate, false); // Don't close popup
    }
  };
  
  // Handle next month
  const handleNextMonth = () => {
    console.log("Next month clicked");
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
    
    // If there's a selected date, update it to the next month
    if (props.selected && props.onSelect) {
      const newSelectedDate = new Date(props.selected);
      newSelectedDate.setMonth(newSelectedDate.getMonth() + 1);
      console.log("Updating selected date to next month:", newSelectedDate);
      props.onSelect(newSelectedDate, false); // Don't close popup
    }
  };

  return (
    <div className="w-full">
      {/* Custom Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-1">
          <select 
            value={currentMonth.getMonth()} 
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="text-sm font-medium bg-transparent border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            aria-label="Select month"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          
          <select 
            value={currentMonth.getFullYear()} 
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="text-sm font-medium bg-transparent border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentMonth, showOutsideDays).map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isSelected = props.selected instanceof Date && 
            day.getDate() === props.selected.getDate() && 
            day.getMonth() === props.selected.getMonth() && 
            day.getFullYear() === props.selected.getFullYear();
          const isToday = isDateToday(day);
          
          return (
            <button
              key={index}
              onClick={() => {
                console.log("Calendar day clicked:", day);
                if (props.onSelect) {
                  console.log("Calling onSelect with:", day);
                  // Don't close popup when selecting a day
                  props.onSelect(day, false);
                } else {
                  console.log("No onSelect handler provided");
                }
              }}
              disabled={!isCurrentMonth}
              className={cn(
                "h-8 w-full flex items-center justify-center rounded text-sm",
                isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                !isSelected && isCurrentMonth && "hover:bg-gray-100",
                !isSelected && !isCurrentMonth && "text-gray-300",
                !isSelected && isToday && "bg-gray-100 font-medium",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
      
      {/* Action Buttons */}
      <div className="mt-4 flex justify-between">
        <div className="flex gap-2">
          <button 
            onClick={() => {
              console.log("Today button clicked");
              const today = new Date();
              setCurrentMonth(today);
              
              if (props.onSelect) {
                console.log("Selecting today's date:", today);
                // Don't close popup when selecting today
                props.onSelect(today, false);
              }
            }}
            className="text-xs px-2 py-1 rounded hover:bg-gray-100 border border-gray-200"
          >
            Today
          </button>
          
          {props.selected && (
            <button 
              onClick={() => {
                console.log("Clear button clicked");
                if (props.onSelect) {
                  console.log("Clearing selected date");
                  // Don't close popup when clearing
                  props.onSelect(undefined, false);
                }
              }}
              className="text-xs px-2 py-1 rounded hover:bg-gray-100 border border-gray-200"
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Done button to explicitly close the popup */}
        {props.selected && (
          <button 
            onClick={() => {
              console.log("Done button clicked");
              if (props.onSelect) {
                // Close popup when done
                props.onSelect(props.selected, true);
              }
            }}
            className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}

// Helper function to get all days in a month including padding days
function getDaysInMonth(date: Date, includeOutsideDays: boolean): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const result: Date[] = [];
  
  // Add days from previous month if needed
  if (includeOutsideDays) {
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -i);
      result.unshift(prevMonthDay);
    }
  } else {
    // Add empty slots for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      result.push(new Date(0)); // Invalid date as placeholder
    }
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    result.push(new Date(year, month, day));
  }
  
  // Add days from next month to complete the grid (6 rows x 7 columns = 42 cells)
  const totalCells = 42;
  const remainingCells = totalCells - result.length;
  
  if (includeOutsideDays && remainingCells > 0) {
    for (let day = 1; day <= remainingCells; day++) {
      result.push(new Date(year, month + 1, day));
    }
  } else if (remainingCells > 0) {
    // Add empty slots for padding
    for (let day = 1; day <= remainingCells; day++) {
      result.push(new Date(0)); // Invalid date as placeholder
    }
  }
  
  return result;
}

// Helper function to check if a date is today
function isDateToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
}

Calendar.displayName = "Calendar"

export { Calendar }
