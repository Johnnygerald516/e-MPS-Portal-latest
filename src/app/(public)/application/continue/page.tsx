"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, FileText, Phone, ChevronRight, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import Link from "next/link";
import Image from "next/image";
import { useApplication } from "@/contexts/application-context";
import { applicationsEndpoints, ContinueApplicationRequest } from "@/lib/api/endpoints/applications";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Continue application form interface
interface ContinueApplicationFormData {
  applicationId: string;
  phoneNumber: string;
}

// Map each saved application stage (appStageID) to the page the applicant
// left off at, so continuing returns them to their last saved page. These
// stage numbers match the ApplicationStep values in application-context.
const stepRoutes: Record<number, string> = {
  10: "/application/basic-info",      // registration verified - start basic-info
  20: "/application/basic-info",      // basic-info
  30: "/application/residence-info",  // residence-info
  40: "/application/parents-info",    // parents-info
  50: "/application/dependant-info",  // dependants-info
  60: "/application/documents",       // documents
  70: "/application/declaration",     // declaration
  80: "completed"                     // complete - show completed message
};

export default function ContinueApplicationPage() {
  const router = useRouter();
  const { updateFormData } = useApplication();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContinueApplicationFormData>({
    applicationId: "",
    phoneNumber: "",
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare request data
      const requestData: ContinueApplicationRequest = {
        applicationId: formData.applicationId,
        phoneNumber: formData.phoneNumber
      };
      
      // Call the API to continue the application
      const response = await applicationsEndpoints.continueApplication(requestData);
      
      if (response.ackCode === 1) {
        // Success - update application context with the response data
        // Handle both response formats: applicationId or applicationID
        const returnedAppId = response.jsonResult.applicationID || response.jsonResult.applicationId;
        const currentStep = response.jsonResult.appStageID || response.jsonResult.currentStep || 10;
        
        updateFormData({
          applicationId: returnedAppId,
          currentStep: currentStep as any // Type cast to ApplicationStep
        });
        
        // Get the route for the stage the applicant last saved
        const nextRoute = stepRoutes[currentStep];
        
        if (currentStep === 80) {
          // Application is already completed - show message
          setCompletedMessage(`Ombi lako ${returnedAppId} limekamilisha mchakato wa maombi. Asante kwa kutumia mfumo wetu.`);
          setIsLoading(false);
          return;
        }
        
        if (nextRoute && nextRoute !== "completed") {
          // Navigate to the appropriate page with the application ID
          router.push(`${nextRoute}?applicationId=${returnedAppId}`);
        } else {
          // Fallback to basic-info if step is not recognized
          router.push(`/application/basic-info?applicationId=${returnedAppId}`);
        }
      } else {
        // Error handling
        setError(response.ackMessage || "Failed to continue application. Please check your details.");
        toast({
          title: "Error",
          description: response.ackMessage || "Failed to continue application",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while trying to continue your application");
      toast({
        title: "Error",
        description: error.message || "An error occurred while trying to continue your application",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };
  
  return ( 
    <div className="max-w-7xl mx-auto py-8 px-6 border border-slate-200 rounded mt-2 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
          <h1 className="text-lg font-bold text-slate-500 mb-4 border-b border-slate-200 pb-1">Endeza ombi</h1>
          <p className="text-slate-600 mb-6">
          Ili kuweza kuendelea na Ombi lako ulilofanya kwenye mfumo huu wa mtandao, tafadhali weka namba ya Ombi lako sambamba na taarifa za msingi ulizojaza wakati unafanya ombi lako. </p>
        </div>


        {/* Right column - Form */}
        <div>
        <h2 className="text-lg font-bold text-slate-500 mb-6 border-b border-slate-200 pb-1">Taarifa za Msingi</h2>
        
      {/*   {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}*/}
        
        {completedMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Ombi Limekamilika</AlertTitle>
            <AlertDescription className="text-green-700">{completedMessage}</AlertDescription>
          </Alert>
        )}
        
         <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div variants={itemVariants} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="applicationId" className="text-sm font-medium">
                          Namba ya Ombi <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="applicationId"
                          name="applicationId"
                          value={formData.applicationId}
                          onChange={handleInputChange}
                          required
                          className="bg-white border-slate-300 rounded"
                          placeholder="Ingiza Namba ya Ombi (mfano: EMPS0000000000)"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-medium">
                          Namba ya Simu <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center">
                         
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                            className="rounded bg-white border-slate-300"
                            placeholder="0000000000"
                          />
                        </div>
                       
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="pt-6 flex justify-end border-t border-slate-200">
                      <LoadingButton
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Inaendelea..."
                        spinnerVariant="primary"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded flex items-center transition-colors shadow-md border-b"
                      >
                        Endeleza Ombi <ArrowRight className="ml-2 h-4 w-4" />
                      </LoadingButton>
                    </motion.div>
                  </form>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
