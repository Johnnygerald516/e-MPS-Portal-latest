"use client";

import React from "react";
import { Button } from "./button";
import { useCustomToast } from "@/hooks/use-custom-toast";

export function ToastDemo() {
  const { showSuccess, showError, showInfo, showWarning } = useCustomToast();

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold">Toast Styles Demo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="border-green-500 text-green-700 hover:bg-green-50"
          onClick={() => showSuccess({ description: "Message Content" })}
        >
          Show Success Toast
        </Button>
        
        <Button 
          variant="outline" 
          className="border-amber-500 text-amber-700 hover:bg-amber-50"
          onClick={() => showWarning({ description: "Message Content" })}
        >
          Show Warning Toast
        </Button>
        
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-700 hover:bg-blue-50"
          onClick={() => showInfo({ description: "Message Content" })}
        >
          Show Info Toast
        </Button>
        
        <Button 
          variant="outline" 
          className="border-red-500 text-red-700 hover:bg-red-50"
          onClick={() => showError({ description: "Message Content" })}
        >
          Show Error Toast
        </Button>
      </div>
    </div>
  );
}
