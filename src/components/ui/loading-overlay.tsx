"use client";

import React from "react";
import { LoadingSpinner } from "./loading-spinner";
import { useNavigation } from "../../contexts/navigation-context";
import { cn } from "../../lib/utils";

interface LoadingOverlayProps {
  className?: string;
}

export function LoadingOverlay({ className }: LoadingOverlayProps) {
  const { isNavigating } = useNavigation();

  if (!isNavigating) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="large" />
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
