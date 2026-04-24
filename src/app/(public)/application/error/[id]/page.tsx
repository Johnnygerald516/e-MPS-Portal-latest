"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";

interface ErrorDetail {
  field: string;
  message: string;
  required: boolean;
}

interface ApplicationErrorData {
  id: string;
  applicantName: string;
  submittedDate: string;
  errors: ErrorDetail[];
}

export default function ApplicationErrorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorData, setErrorData] = useState<ApplicationErrorData | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

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
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    
    const fetchErrorData = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch the error data from your API
        // await fetch(`/applications/${resolvedParams.id}/errors`)
        
        // For demo purposes, we'll simulate the API response
        setTimeout(() => {
          const mockData: ApplicationErrorData = {
            id: resolvedParams.id,
            applicantName: "John Doe",
            submittedDate: "2025-08-15",
            errors: [
              {
                field: "passportCopy",
                message: "Missing passport copy. Please upload a clear scan of your passport.",
                required: true
              },
              {
                field: "employerLetter",
                message: "Employment verification letter is required. Please upload a signed letter from your employer.",
                required: true
              },
              {
                field: "addressProof",
                message: "Address proof is unclear or expired. Please provide a recent utility bill or lease agreement.",
                required: false
              }
            ]
          };
          
          setErrorData(mockData);
          
          // Initialize form data with empty values for each error field
          const initialFormData: Record<string, string> = {};
          mockData.errors.forEach(error => {
            initialFormData[error.field] = "";
          });
          setFormData(initialFormData);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
       setIsLoading(false);
      }
    };

    fetchErrorData();
  }, [resolvedParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real application, you would submit the form data to your API
      // await fetch(`/applications/${params.id}/fix`, {
      //   method: 'POST',
      //   body: JSON.stringify(formData)
      // })
      
      // For demo purposes, we'll simulate the API response
      setTimeout(() => {
        setSuccess(true);
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100">
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="flex items-center">
            <Button
              variant="ghost"
              className="flex items-center text-slate-600 hover:text-slate-900 mr-4"
              onClick={() => router.push('/application/progress')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Status
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Application Issues</h1>
              <p className="mt-1 text-slate-600 text-sm">
                Application #{resolvedParams?.id || 'Loading...'} requires attention
              </p>
            </div>
          </motion.div>

          {isLoading ? (
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-lg bg-white overflow-hidden rounded-xl">
                <CardContent className="p-8 flex justify-center items-center h-64">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600">Loading application details...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : success ? (
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-lg bg-white overflow-hidden rounded-xl">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">Corrections Submitted Successfully</h2>
                    <p className="text-slate-600 text-center max-w-md mb-6">
                      Your application corrections have been submitted and will be reviewed shortly. You will be notified once the review is complete.
                    </p>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => router.push('/application/progress')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Check Status
                      </Button>
                      <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        className="border-slate-300"
                      >
                        Return to Home
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : errorData ? (
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-lg bg-white overflow-hidden rounded-xl">
                <CardContent className="p-8">
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-red-800">Application Requires Corrections</h3>
                        <p className="text-slate-700 text-sm mt-1">
                          Please address the following issues to continue processing your application.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {errorData.errors.map((error, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start mb-4">
                          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-amber-700 text-xs font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900 capitalize">
                              {error.field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              {error.required && <span className="text-red-500 ml-1">*</span>}
                            </h4>
                            <p className="text-slate-600 text-sm mt-1">{error.message}</p>
                          </div>
                        </div>

                        {error.field.toLowerCase().includes("copy") || 
                         error.field.toLowerCase().includes("proof") || 
                         error.field.toLowerCase().includes("letter") ? (
                          <div className="mt-2">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50">
                              <div className="flex flex-col items-center justify-center">
                                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                <p className="text-sm text-slate-600 mb-2">
                                  Drag and drop your file here, or click to browse
                                </p>
                                <Input
                                  type="file"
                                  className="hidden"
                                  id={`file-${error.field}`}
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleInputChange(error.field, e.target.files[0].name);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`file-${error.field}`}
                                  className="bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm cursor-pointer"
                                >
                                  Select File
                                </label>
                                {formData[error.field] && (
                                  <p className="mt-2 text-xs text-indigo-600">
                                    Selected: {formData[error.field]}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <Textarea
                              placeholder={`Enter additional information for ${error.field}`}
                              value={formData[error.field] || ""}
                              onChange={(e) => handleInputChange(error.field, e.target.value)}
                              className="bg-white border-slate-200 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <LoadingButton
                      onClick={handleSubmit}
                      isLoading={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md flex items-center transition-colors shadow-sm"
                    >
                      Submit Corrections
                    </LoadingButton>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Card className="border-none shadow-lg bg-white overflow-hidden rounded-xl">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Application Not Found</h2>
                    <p className="text-slate-600 text-center max-w-md mb-6">
                      We couldn't find the application with ID #{resolvedParams?.id || 'Unknown'}. Please check the ID and try again.
                    </p>
                    <Button
                      onClick={() => router.push("/application/progress")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Return to Status Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
