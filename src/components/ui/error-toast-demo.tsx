"use client";

import React from "react";
import { Button } from "./button";
import { useCustomToast } from "@/hooks/use-custom-toast";

export function ErrorToastDemo() {
  const { showError } = useCustomToast();

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-medium">Error Toast Demo</h2>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="sm"
          className="border-red-500 text-red-700 hover:bg-red-50"
          onClick={() => showError({ description: "API error: 404 Not Found" })}
        >
          Show Error Toast
        </Button>
      </div>
    </div>
  );
}
