"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, useNavigation } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Custom caption component with month and year dropdowns
function CustomCaption({ displayMonth, fromYear, toYear }: { displayMonth: Date; fromYear?: number; toYear?: number }) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  // Ensure we have a valid date
  const validDisplayMonth = displayMonth instanceof Date && !isNaN(displayMonth.getTime()) ? displayMonth : new Date();
  const currentYear = validDisplayMonth.getFullYear();
  const currentMonth = validDisplayMonth.getMonth();
  
  // Generate years for dropdown
  const years = [];
  const startYear = fromYear || currentYear - 50;
  const endYear = toYear || currentYear + 50;
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  
  // Generate months for dropdown
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  return (
    <div className="flex items-center justify-between px-2 py-1">
      <button 
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        className="p-1 rounded-full hover:bg-accent/20 text-muted-foreground"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <div className="flex items-center gap-1">
        <Select
          value={currentMonth.toString()}
          onValueChange={(value) => {
            const newDate = new Date(displayMonth);
            newDate.setMonth(parseInt(value));
            goToMonth(newDate);
          }}
        >
          <SelectTrigger className="h-7 w-[70px] border-0 bg-transparent hover:bg-accent/10 focus:ring-0 focus:ring-offset-0 text-sm font-normal">
            <SelectValue>{months[currentMonth]}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={currentYear.toString()}
          onValueChange={(value) => {
            const newDate = new Date(displayMonth);
            newDate.setFullYear(parseInt(value));
            goToMonth(newDate);
          }}
        >
          <SelectTrigger className="h-7 w-[70px] border-0 bg-transparent hover:bg-accent/10 focus:ring-0 focus:ring-offset-0 text-sm font-normal">
            <SelectValue>{currentYear}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <button 
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        className="p-1 rounded-full hover:bg-accent/20 text-muted-foreground"
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
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
  // We need to handle the month prop separately to avoid "Invalid time value" errors
  const { month, ...restProps } = props;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-2",
        caption: "flex justify-center relative items-center",
        caption_label: "hidden", // Hide default caption label
        nav: "hidden", // Hide default navigation
        table: "w-full border-collapse",
        head_row: "flex border-b border-accent/10",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] py-2",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/20 rounded-full flex items-center justify-center transition-all"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent/10 text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      captionLayout="dropdown"
      footer={
        <CustomCaption 
          displayMonth={validMonth} 
          fromYear={props.fromYear || 1900} 
          toYear={props.toYear || 2100} 
        />
      }
      month={validMonth}
      {...restProps}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
