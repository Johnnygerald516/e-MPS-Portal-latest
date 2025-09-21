"use client";

import React from "react";
import { ApplicationProvider } from "@/contexts/application-context";
// GlobalLoadingOverlay removed to prevent page overlay
import { Toaster } from "@/components/ui/toaster";

export default function ApplicationPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationProvider>
        {children}
        {/* GlobalLoadingOverlay removed to use button spinners instead */}
        <Toaster />
    </ApplicationProvider>
  );
}
