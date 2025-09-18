"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, Variants } from "framer-motion";
import { Search, CheckCircle, Clock, AlertCircle, Printer, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";

// Define the application status types
type ApplicationStatus = 
  | "received" 
  | "in_progress" 
  | "under_review" 
  | "returned_for_correction" 
  | "pass_printed" 
  | "issued" 
  | "rejected";

interface CorrectionItem {
  field: string;
  issue: string;
  instruction: string;
}

interface ApplicationStatusData {
  id: string;
  applicantName: string;
  subjectId: string;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdated: string;
  estimatedCompletionDate?: string;
  corrections?: CorrectionItem[];
  rejectionReason?: string;
  assessorComments?: string;
}

function ApplicationProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applicationId, setApplicationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-search when ID is provided in URL (only for correction flow)
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    const editId = searchParams.get('edit');
    
    // Only auto-search if coming from correction flow, not from landing page
    if (idFromUrl && !editId) {
      setApplicationId(idFromUrl);
      // Trigger search automatically only for correction redirects
      handleSearchWithId(idFromUrl);
    }
  }, [searchParams]);

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

  const handleSearchWithId = async (searchId: string) => {
    if (!searchId.trim()) {
      setError("Please enter an application ID");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, you would make an API call here:
      // const response = await fetch(`/api/applications/${searchId}`)
      // const data = await response.json()
      
      // For demo purposes, we'll simulate different statuses based on the application ID
      setTimeout(() => {
        // Mock data based on the last character of the application ID
        const lastChar = searchId.slice(-1);
        let mockStatus: ApplicationStatus;
        
        if (lastChar === "1") mockStatus = "received";
        else if (lastChar === "2") mockStatus = "in_progress";
        else if (lastChar === "3") mockStatus = "under_review";
        else if (lastChar === "4") mockStatus = "returned_for_correction";
        else if (lastChar === "5") mockStatus = "pass_printed";
        else if (lastChar === "6") mockStatus = "issued";
        else if (lastChar === "7") mockStatus = "rejected";
        else {
          // Random status for any other input
          const statuses: ApplicationStatus[] = ["received", "in_progress", "under_review", "returned_for_correction", "pass_printed", "issued", "rejected"];
          mockStatus = statuses[Math.floor(Math.random() * statuses.length)];
        }

        // Generate mock data based on application ID
        const mockData: ApplicationStatusData = {
          id: searchId,
          applicantName: "John Doe Smith",
          subjectId: `SUB-${searchId.slice(-4)}-2025`,
          status: mockStatus,
          submittedDate: "2025-08-15",
          lastUpdated: "2025-08-28",
          estimatedCompletionDate: mockStatus === "in_progress" || mockStatus === "under_review" ? "2025-09-10" : undefined,
          corrections: mockStatus === "returned_for_correction" ? [
            {
              field: "Personal Information - Date of Birth",
              issue: "Date format is incorrect",
              instruction: "Please provide date in DD/MM/YYYY format"
            },
            {
              field: "Documents - Picha ya Muombaji",
              issue: "Photo quality is poor",
              instruction: "Please upload a clear passport-size photo with white background"
            },
            {
              field: "Parents Information - Father's Nationality",
              issue: "Information missing",
              instruction: "Please provide complete father's nationality information"
            }
          ] : undefined,
          rejectionReason: mockStatus === "rejected" ? "Incomplete documentation and eligibility requirements not met." : undefined,
          assessorComments: mockStatus === "returned_for_correction" ? "Please make the required corrections and resubmit your application." : undefined,
        };

        setApplicationData(mockData);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError("Failed to fetch application status. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    await handleSearchWithId(applicationId);
  };

  const handleCorrectApplication = () => {
    if (applicationData?.id) {
      // Store the application ID in context instead of URL parameters
      // and navigate to the dashboard page for editing
      router.push('/dashboard');
    }
  };

  const handleNewApplication = () => {
    router.push("/dashboard");
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "received":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Application Received
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            In Progress
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            Under Review
          </Badge>
        );
      case "returned_for_correction":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Returned for Correction
          </Badge>
        );
      case "pass_printed":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5">
            <Printer className="w-4 h-4" />
            Pass Printed
          </Badge>
        );
      case "issued":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            Pass Issued
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Application Rejected
          </Badge>
        );
    }
  };

  return ( 
    <motion.div variants={itemVariants} className="container mx-auto py-8 px-4 border border-slate-200 rounded mt-2 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
          <h1 className="text-lg font-bold text-slate-500 mb-4 border-b border-slate-200 pb-1">Endeza ombi</h1>
          <p className="text-slate-600 mb-6">
          Ili kuweza kuendelea na Ombi lako ulilofanya kwenye mfumo huu wa mtandao, tafadhali weka namba ya Ombi lako sambamba na taarifa za msingi ulizojaza wakati unafanya ombi lako. </p>
        </div>
       
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <h2 className="text-lg font-bold text-slate-500 mb-6 border-b border-slate-200 pb-1">Taarifa za Msingi</h2>
            
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    placeholder="Enter your application ID"
                    className="bg-white border-slate-200 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 flex-1"
                  />
                </div>
                <motion.div variants={itemVariants} className="pt-6 flex justify-end border-t border-slate-200">
                <LoadingButton
                    onClick={handleSearch}
                    isLoading={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Search className="h-4 w-4" />
                    Check Status
                  </LoadingButton>
                </motion.div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {applicationData && (
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                          Application #{applicationData.id}
                        </h2>
                        <p className="text-slate-600 text-sm mt-1">
                          Submitted on {applicationData.submittedDate}
                        </p>
                      </div>
                      {getStatusBadge(applicationData.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Application ID</p>
                        <p className="font-medium">{applicationData.id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Applicant Name</p>
                        <p className="font-medium">{applicationData.applicantName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Subject ID</p>
                        <p className="font-medium">{applicationData.subjectId}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-500">Last Updated</p>
                        <p className="font-medium">{applicationData.lastUpdated}</p>
                      </div>
                      {applicationData.estimatedCompletionDate && (
                        <div className="space-y-1">
                          <p className="text-sm text-slate-500">Estimated Completion</p>
                          <p className="font-medium">{applicationData.estimatedCompletionDate}</p>
                        </div>
                      )}
                    </div>

                    {applicationData.status === "returned_for_correction" && applicationData.corrections && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-medium text-orange-800">Application Returned for Correction</h3>
                            <p className="text-orange-700 text-sm mt-1">
                              {applicationData.assessorComments}
                            </p>
                            
                            <div className="mt-4">
                              <h4 className="font-medium text-orange-800 mb-2">Required Corrections:</h4>
                              <div className="space-y-3">
                                {applicationData.corrections.map((correction, index) => (
                                  <div key={index} className="bg-white border border-orange-200 rounded p-3">
                                    <div className="font-medium text-slate-900 text-sm">{correction.field}</div>
                                    <div className="text-red-600 text-sm mt-1">Issue: {correction.issue}</div>
                                    <div className="text-slate-600 text-sm mt-1">Instruction: {correction.instruction}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <Button
                              onClick={handleCorrectApplication}
                              className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              Correct Application
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {applicationData.status === "rejected" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-red-800">Application Rejected</h3>
                            <p className="text-red-700 text-sm mt-1">
                              {applicationData.rejectionReason}
                            </p>
                            <Button
                              onClick={handleNewApplication}
                              variant="outline"
                              className="mt-3 bg-white text-red-700 border-red-300 hover:bg-red-50"
                            >
                              Submit New Application
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {applicationData.status !== "returned_for_correction" && applicationData.status !== "rejected" && (
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleNewApplication}
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          New Application
                        </Button>
                        <Button
                          onClick={() => window.print()}
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          Print Status
                        </Button>
                      </div>
                    )}
                  </div>
                )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ApplicationProgressPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4 text-center">Loading...</div>}>
      <ApplicationProgressContent />
    </Suspense>
  );
}
