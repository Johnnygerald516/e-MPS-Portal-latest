import React from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "default" | "primary" | "secondary" | "white";
}

// Legacy spinner component - kept for backward compatibility
export function Spinner({
  size = "md",
  className,
  color = "default",
}: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  const colorClasses = {
    default: "border-slate-300 border-t-slate-600",
    primary: "border-blue-200 border-t-blue-600",
    secondary: "border-indigo-200 border-t-indigo-600",
    white: "border-white/30 border-t-white",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
        <LoadingSpinner size="medium" variant="primary" />
        <p className="mt-4 text-slate-700 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center">
      <LoadingSpinner size="large" variant="primary" />
      <p className="mt-4 text-slate-500">Loading...</p>
    </div>
  );
}
