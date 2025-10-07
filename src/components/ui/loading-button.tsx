"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { buttonVariants } from "./button";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";
import { VariantProps } from "class-variance-authority";

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  title?: string;
  extendedSpinTime?: boolean;
  spinnerSize?: "small" | "medium" | "large";
  spinnerVariant?: "default" | "primary" | "secondary" | "fancy" | "white";
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    className, 
    children, 
    isLoading = false, 
    loadingText, 
    spinnerSize = "small", 
    spinnerVariant = "primary", 
    variant, 
    size, 
    title,
    extendedSpinTime = false,
    ...props 
  }, ref) => {
    // State to track if we're showing extended loading time
    const [showExtendedLoading, setShowExtendedLoading] = useState(false);
    
    // Check if this is a "Hifadhi na Endelea" button
    const isHifadhiNaEndelea = 
      children === "Hifadhi na Endelea" || 
      loadingText?.includes("Hifadhi") || 
      extendedSpinTime;
      
    // Effect to handle extended loading time
    useEffect(() => {
      let timer: NodeJS.Timeout;
      
      if (isLoading && isHifadhiNaEndelea) {
        setShowExtendedLoading(true);
        // Keep showing loading state for 1.5 seconds even after isLoading becomes false
        timer = setTimeout(() => {
          setShowExtendedLoading(false);
        }, 1500);
      }
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [isLoading, isHifadhiNaEndelea]);
    
    // Use either the prop loading state or our extended loading state
    const effectiveLoading = isLoading || showExtendedLoading;
    // Determine spinner size in pixels
    const spinnerSizeMap = {
      small: "h-4 w-4",
      medium: "h-5 w-5",
      large: "h-6 w-6"
    };
    
    // Determine spinner color based on variant
    const spinnerColorMap = {
      default: "text-gray-600",
      primary: "text-blue-200",
      secondary: "text-gray-400",
      fancy: "text-purple-300",
      white: "text-white"
    };
    
    const spinnerClasses = cn(
      "animate-spin", 
      spinnerSizeMap[spinnerSize], 
      spinnerColorMap[spinnerVariant],
      effectiveLoading ? "opacity-100" : "opacity-0",
      "transition-opacity duration-150 ease-in-out",
      isHifadhiNaEndelea && "transition-opacity duration-500 ease-in-out" // Slower transition for Hifadhi buttons
    );

    return (
      <Button
        className={cn(
          "relative transition-all", 
          effectiveLoading && "cursor-progress",
          isHifadhiNaEndelea && "min-w-[180px]", // Ensure consistent width for Hifadhi buttons
          className
        )}
        variant={variant}
        size={size}
        disabled={effectiveLoading || props.disabled}
        ref={ref}
        title={title}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {/* Always render the spinner but control visibility with opacity */}
          <Loader2 className={spinnerClasses} />
          {effectiveLoading ? loadingText : children}
        </span>
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
