"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface DateInputFieldProps {
  field: any;
  label?: string;
  required?: boolean;
  id?: string;
}

export function DateInputField({
  field,
  label,
  required = false,
  id,
}: DateInputFieldProps) {
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
            type="date"
            className="pl-10 rounded"
            value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : undefined;
              field.onChange(date);
            }}
            placeholder="mm/dd/yyyy"
            // Remove default date value to show placeholder
            onClick={(e) => {
              // Clear the default date value when clicked if empty
              const input = e.target as HTMLInputElement;
              if (!field.value && input.type === 'date') {
                input.showPicker();
              }
            }}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
