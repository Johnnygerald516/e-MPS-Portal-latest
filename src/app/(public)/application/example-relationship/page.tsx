"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { RelationshipTypeSelect } from "@/components/ui/relationship-type-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  relationshipType: z.string().min(1, "Relationship type is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExampleRelationshipPage() {
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<number | null>(null);
  const [selectedRelationshipName, setSelectedRelationshipName] = useState<string>("");
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      relationshipType: "",
    },
  });

  // Test the API directly
  useEffect(() => {
    const testApiEndpoint = async () => {
      setApiStatus('loading');
      try {
        const payload = {
          operationType: "RelationType",
          argument1: 1,
          argument2: 0
        };
        
        const response = await fetch('/api/applications/lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setApiResponse(data);
        setApiStatus('success');
      } catch (error) {
        console.error("Error testing API endpoint:", error);
        setApiStatus('error');
      }
    };
    
    testApiEndpoint();
  }, []);

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    toast({
      title: "Form Submitted",
      description: (
        <div className="mt-2">
          <p>Relationship Type ID: {selectedRelationshipId}</p>
          <p>Relationship Type: {selectedRelationshipName}</p>
          <p>Form Value: {data.relationshipType}</p>
        </div>
      ),
    });
  };

  // Handle relationship type change
  const handleRelationshipTypeChange = (id: number, name: string) => {
    setSelectedRelationshipId(id);
    setSelectedRelationshipName(name);
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto mb-6">
        <CardHeader>
          <CardTitle>API Endpoint Test</CardTitle>
          <CardDescription>
            Testing direct API call to /api/applications/lookup with RelationType payload
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiStatus === 'loading' && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
              <span>Testing API endpoint...</span>
            </div>
          )}
          
          {apiStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Error</AlertTitle>
              <AlertDescription>
                Failed to connect to the API endpoint. Please check the server connection.
              </AlertDescription>
            </Alert>
          )}
          
          {apiStatus === 'success' && (
            <div>
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">API Connected Successfully</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully fetched relationship types from the API.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 border rounded-md p-4 bg-slate-50 overflow-auto max-h-40">
                <p className="font-medium mb-2">API Response:</p>
                <pre className="text-xs">{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Relationship Type Example</CardTitle>
          <CardDescription>
            Select a relationship type from the dropdown below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="relationshipType"
                render={({ field }) => (
                  <RelationshipTypeSelect
                    field={field}
                    label="Relationship Type"
                    required={true}
                    placeholder="Select a relationship type"
                    onRelationshipTypeChange={handleRelationshipTypeChange}
                  />
                )}
              />

              <div className="mt-4">
                {selectedRelationshipId && (
                  <div className="p-4 bg-slate-50 rounded-md mb-4">
                    <p className="text-sm font-medium">Selected Relationship:</p>
                    <p className="text-sm">ID: {selectedRelationshipId}</p>
                    <p className="text-sm">Name: {selectedRelationshipName}</p>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
