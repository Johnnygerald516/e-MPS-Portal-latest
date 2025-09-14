"use client";

import * as React from "react";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  spinnerSize?: "small" | "medium";
  spinnerVariant?: "default" | "primary" | "secondary" | "fancy";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, children, isLoading = false, loadingText, spinnerSize = "small", spinnerVariant = "primary", variant, size, ...props }, ref) => {
    return (
      <Button
        className={cn("relative transition-all", className)}
        variant={variant}
        size={size}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {isLoading && 
          // <LoadingSpinner size={spinnerSize} variant={spinnerVariant} className="mr-2" />
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
         }
          {isLoading ? loadingText : children}
        </span>
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
