"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const today = new Date();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal border-input bg-background hover:bg-accent/10 transition-colors",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {date ? format(date, "MMMM d, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 shadow-lg rounded-lg border-accent" align="start">
        <div className="p-3 border-b bg-primary/5">
          <div className="flex justify-center py-1 text-sm font-medium text-primary">
            {date ? format(date, "MMMM yyyy") : "Select a date"}
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            setDate(date);
          }}
          defaultMonth={date || today}
          initialFocus
          className="rounded-md p-3"
          classNames={{
            months: "flex flex-col space-y-4",
            month: "space-y-4",
            caption: "flex justify-between pt-1 relative items-center mb-4",
            caption_label: "text-sm font-medium hidden",
            nav: "flex items-center justify-between w-full px-2",
            nav_button: cn(
              "h-8 w-8 bg-accent/10 p-0 hover:bg-accent/30 rounded-full flex items-center justify-center transition-colors"
            ),
            table: "w-full border-collapse",
            head_row: "flex border-b border-accent/20 mb-1 pb-1",
            head_cell: "text-muted-foreground rounded-md w-9 font-medium text-[0.8rem] py-2",
            row: "flex w-full mt-1",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent/30 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:rounded-full transition-all duration-200 flex items-center justify-center"
            ),
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
            day_today: "bg-accent/30 text-accent-foreground font-medium rounded-full border border-primary/20",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
          captionLayout="dropdown"
          fromYear={1900}
          toYear={2100}
          showOutsideDays={true}
          fixedWeeks={true}
        />
        <div className="p-3 border-t bg-primary/5 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-xs hover:bg-accent/20 border-accent/20"
            onClick={() => setDate(today)}
          >
            Today
          </Button>
          
          {date && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs hover:bg-accent/20"
              onClick={() => setDate(undefined)}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
