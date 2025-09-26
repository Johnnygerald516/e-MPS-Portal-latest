"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FullscreenDialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FullscreenDialog({
  open,
  onClose,
  children,
  className,
}: FullscreenDialogProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background flex flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FullscreenDialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      {children}
    </div>
  );
}
