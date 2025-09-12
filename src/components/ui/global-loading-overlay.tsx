"use client";

import React from "react";
import { LoadingSpinner } from "./loading-spinner";
import { useApplication } from "@/contexts/application-context";

interface GlobalLoadingOverlayProps {
  message?: string;
}

export function GlobalLoadingOverlay({ message = "Loading..." }: GlobalLoadingOverlayProps) {
  const { isLoading } = useApplication();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
        <LoadingSpinner size="large" variant="primary" />
        <p className="mt-4 text-slate-700 font-medium">{message}</p>
      </div>
    </div>
  );
}
