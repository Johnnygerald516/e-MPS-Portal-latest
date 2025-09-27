"use client";

import React from "react";
import { cn } from "../../lib/utils";

interface ProfessionalLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "default" | "primary" | "secondary" | "white" | "gray" | "indigo" | "green";
  thickness?: "thin" | "regular" | "thick";
  className?: string;
}

export function ProfessionalLoader({
  size = "md",
  color = "primary",
  thickness = "thin",
  className,
}: ProfessionalLoaderProps) {
  // Size classes for different loader sizes
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };
  
  // Color classes for different loader colors
  const colorClasses = {
    default: "text-slate-600",
    primary: "text-indigo-600",
    secondary: "text-blue-600",
    white: "text-white",
    gray: "text-gray-400",
    indigo: "text-indigo-500",
    green: "text-green-600",
  };
  
  // Thickness classes for stroke width
  const thicknessValues = {
    thin: 1.5,
    regular: 2,
    thick: 2.5,
  };

  return (
    <div className={cn("inline-flex", className)}>
      <svg
        className={cn("animate-spin", sizeClasses[size], colorClasses[color])}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={thicknessValues[thickness]}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  );
}
