"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check } from "lucide-react";

// List of ID types with their codes and formats
const idTypes = [
  { 
    code: "NIDA", 
    name: "National ID", 
    format: "00000000-00000-00000-00",
    flag: "🇹🇿",
    prefix: "TZ"
  },
  { 
    code: "PASS", 
    name: "Passport", 
    format: "A00000000",
    flag: "🌐",
    prefix: "PP"
  },
  { 
    code: "VOTE", 
    name: "Voter ID", 
    format: "0000-0000-0000-0000",
    flag: "🗳️",
    prefix: "VT"
  },
  { 
    code: "DL", 
    name: "Driver's License", 
    format: "00000000000",
    flag: "🚗",
    prefix: "DL"
  },
  { 
    code: "SSN", 
    name: "Social Security", 
    format: "000-00-0000",
    flag: "🔢",
    prefix: "SS"
  }
];

export interface NationalIdInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

// Format NIDA number (00000000-00000-00000-00)
const formatNIDA = (value: string): string => {
  // Remove non-digit and non-hyphen characters
  const cleaned = value.replace(/[^0-9-]/g, '');
  
  // Format as 00000000-00000-00000-00
  const parts = [];
  if (cleaned.length > 0) {
    // First part (up to 8 digits)
    parts.push(cleaned.slice(0, 8).padEnd(8, '_'));
    
    if (cleaned.length > 8) {
      // Second part (up to 5 digits)
      parts.push(cleaned.slice(8, 13).padEnd(5, '_'));
      
      if (cleaned.length > 13) {
        // Third part (up to 5 digits)
        parts.push(cleaned.slice(13, 18).padEnd(5, '_'));
        
        if (cleaned.length > 18) {
          // Fourth part (up to 2 digits)
          parts.push(cleaned.slice(18, 20).padEnd(2, '_'));
        } else {
          parts.push('__');
        }
      } else {
        parts.push('_____');
        parts.push('__');
      }
    } else {
      parts.push('_____');
      parts.push('_____');
      parts.push('__');
    }
  } else {
    return "________-_____-_____-__";
  }
  
  return parts.join('-');
};

export function NationalIdInput({ className, value, onChange, ...props }: NationalIdInputProps) {
  // Extract ID type and number
  const extractIdType = (val: string) => {
    for (const idType of idTypes) {
      if (val.startsWith(idType.prefix)) {
        return {
          prefix: idType.prefix,
          idNumber: val.substring(idType.prefix.length)
        };
      }
    }
    return { prefix: "TZ", idNumber: val }; // Default to National ID if no match
  };

  const { prefix, idNumber } = extractIdType(value);
  const [open, setOpen] = React.useState(false);
  const [selectedIdType, setSelectedIdType] = React.useState(
    idTypes.find((idType) => idType.prefix === prefix) || idTypes[0]
  );

  const handleIdTypeSelect = (idType: typeof idTypes[0]) => {
    setSelectedIdType(idType);
    onChange(`${idType.prefix}${idNumber}`);
    setOpen(false);
  };

  const handleIdNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newIdNumber = e.target.value;
    
    // Apply formatting based on ID type
    if (selectedIdType.code === "NIDA") {
      newIdNumber = formatNIDA(newIdNumber);
    } else if (selectedIdType.code === "VOTE") {
      // Format voter ID as 0000-0000-0000-0000
      const cleaned = newIdNumber.replace(/[^0-9-]/g, "");
      const parts = [];
      for (let i = 0; i < cleaned.length && i < 16; i += 4) {
        parts.push(cleaned.slice(i, i + 4));
      }
      newIdNumber = parts.join('-');
    }
    
    onChange(`${selectedIdType.prefix}${newIdNumber}`);
  };

  // Extract the formatted ID number for display
  const displayIdNumber = idNumber;

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-shrink-0 w-[80px] gap-1 px-2 border border-input bg-background"
          >
            <span className="text-base">{selectedIdType.flag}</span>
            <ChevronDown className="ml-auto h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search ID type..." />
            <CommandList>
              <CommandEmpty>No ID type found.</CommandEmpty>
              <CommandGroup>
                {idTypes.map((idType) => (
                  <CommandItem
                    key={idType.code}
                    onSelect={() => handleIdTypeSelect(idType)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2 text-lg">{idType.flag}</span>
                    <span>{idType.name}</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {idType.prefix}
                    </span>
                    {idType.prefix === selectedIdType.prefix && (
                      <Check className="ml-2 h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="relative flex-1">
        <Input
          className="pl-3"
          value={displayIdNumber}
          onChange={handleIdNumberChange}
          placeholder={selectedIdType.format}
          {...props}
        />
      </div>
    </div>
  );
}
