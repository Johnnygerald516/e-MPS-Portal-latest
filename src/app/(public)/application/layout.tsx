"use client";

import React from "react";
import { ApplicationProvider } from "@/contexts/application-context";
import { ApplicationLayout } from "@/components/application/application-layout";
// GlobalLoadingOverlay removed to prevent page overlay
import { Toaster } from "@/components/ui/toaster";

export default function ApplicationPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplicationProvider>
      {/* <ApplicationLayout> */}
        {children}
        {/* GlobalLoadingOverlay removed to use button spinners instead */}
        <Toaster />
      {/* </ApplicationLayout> */}
    </ApplicationProvider>
  );
}
