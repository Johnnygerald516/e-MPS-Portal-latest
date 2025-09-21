"use client";

import * as React from "react";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  spinnerSize?: "small" | "medium" | "large";
  spinnerVariant?: "default" | "primary" | "secondary" | "fancy" | "white";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  title?: string;
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
    ...props 
  }, ref) => {
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
      isLoading ? "opacity-100" : "opacity-0",
      "transition-opacity duration-150 ease-in-out"
    );

    return (
      <Button
        className={cn(
          "relative transition-all", 
          isLoading && "cursor-progress",
          className
        )}
        variant={variant}
        size={size}
        disabled={isLoading || props.disabled}
        ref={ref}
        title={title}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {/* Always render the spinner but control visibility with opacity */}
          <Loader2 className={spinnerClasses} />
          {isLoading ? loadingText : children}
        </span>
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
