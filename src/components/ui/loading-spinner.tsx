"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
  variant?: "default" | "primary" | "secondary" | "fancy";
}

export function LoadingSpinner({
  size = "medium",
  className,
  variant = "default",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };
  
  const variantClasses = {
    default: "text-gray-600/40",
    primary: "text-blue-600/40",
    secondary: "text-indigo-600/40",
    fancy: "text-blue-600/40",
  };

  return (
    <div className={cn("flex items-center justify-center opacity-60", className)}>
      <div
        className={cn(
          "relative",
          sizeClasses[size]
        )}
      >
        <svg 
          className={cn("animate-spin", variantClasses[variant])} 
          viewBox="0 0 50 50"
          style={{ width: '100%', height: '100%' }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="4"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            d="M25 5 A20 20 0 0 1 45 25"
          />
        </svg>
      </div>
    </div>
  );
}
