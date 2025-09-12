"use client";

import React from "react";
import { Button } from "./button";
import { useApplication } from "@/contexts/application-context";

export function ToastDemo() {
  const { showSuccess, showError, showInfo } = useApplication();

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold">Toast Styles Demo</h2>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="border-green-500 text-green-700 hover:bg-green-50"
          onClick={() => showSuccess("Operation completed successfully!")}
        >
          Show Success Toast
        </Button>
        
        <Button 
          variant="outline" 
          className="border-red-500 text-red-700 hover:bg-red-50"
          onClick={() => showError("An error occurred during the operation.")}
        >
          Show Error Toast
        </Button>
        
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-700 hover:bg-blue-50"
          onClick={() => showInfo("This is an informational message.")}
        >
          Show Info Toast
        </Button>
      </div>
    </div>
  );
}
