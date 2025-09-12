"use client";

import React from "react";
import { Button } from "./button";
import { useApplication } from "@/contexts/application-context";

export function ErrorToastDemo() {
  const { showError } = useApplication();

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-medium">Error Toast Demo</h2>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => showError("API error: 404 Not Found")}
        >
          Show Error Toast
        </Button>
      </div>
    </div>
  );
}
