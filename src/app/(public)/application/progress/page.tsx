"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, Variants } from "framer-motion";
import { Search, CheckCircle, Clock, AlertCircle, Printer, FileCheck, Download, Receipt, FileText, Edit, CreditCard, Loader2, FileSearch, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";

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
  phoneNumber?: string;
  estimatedCompletionDate?: string;
  corrections?: CorrectionItem[];
  rejectionReason?: string;
  assessorComments?: string;
}

import PassPDFContent from "@/components/ui/pass-pdf-content";

// Helper function to determine which action buttons to show based on status
const getActionButtons = (
  status: ApplicationStatus, 
  applicationId: string, 
  applicationData: ApplicationStatusData | null, 
  isGeneratingPDF: boolean,
  setIsGeneratingPDF: (value: boolean) => void
) => {
  const handlePrintBill = (id: string) => {
    console.log(`Printing bill for application ${id}`);
    // Implementation for printing bill
  };
  const handlePrintReceipt = (id: string) => {
    // Implementation for printing receipt
  };

  // State is passed from the parent component

  const handlePrintPass = async (id: string) => {
    console.log(`Downloading pass for application ${id}`);
    
    // Get the pass content element
    const passContent = document.getElementById('pass-content');
    if (!passContent) {
      console.error('Pass content element not found');
      alert('Error: Pass content element not found. Please try again.');
      return;
    }
    
    try {
      // Set loading state
      setIsGeneratingPDF(true);
      
      // Wrap in a try-catch to handle any import errors
      let generatePDF;
      try {
        // Import the generatePDF function dynamically
        const pdfUtils = await import('@/lib/utils/pdf-generator');
        generatePDF = pdfUtils.generatePDF;
      } catch (importError) {
        console.error('Error importing PDF generator:', importError);
        alert('Error loading PDF generator. Please try again.');
        setIsGeneratingPDF(false);
        return;
      }
      
      // Add a small delay to ensure the DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate the PDF with error handling
      let pdfBlob;
      try {
        pdfBlob = await generatePDF(passContent, `Migrant_Pass_${id}.pdf`);
      } catch (pdfError) {
        console.error('Error in PDF generation:', pdfError);
        alert('Error generating PDF. Please try again.');
        setIsGeneratingPDF(false);
        return;
      }
      
      // Create a link and trigger download with error handling
      try {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Migrant_Pass_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL after a short delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (downloadError) {
        console.error('Error downloading PDF:', downloadError);
        alert('Error downloading PDF. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error in PDF process:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      // Reset loading state
      setIsGeneratingPDF(false);
    }
  };

  const handleMarekebisho = (id: string) => {
    console.log(`Editing application ${id}`);
    // Implementation for marekebisho (corrections)
  };

  switch (status) {
    case "received":
      return (
        <div className="flex space-x-2">
          <Button 
            onClick={() => handlePrintBill(applicationId)} 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <CreditCard className="h-4 w-4" />
            <span>Print Bill</span>
          </Button>
        </div>
      );
    case "in_progress":
      return (
        <div className="flex space-x-2">
          <Button 
            onClick={() => handlePrintBill(applicationId)} 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <CreditCard className="h-4 w-4" />
            <span>Print Bill</span>
          </Button>
          <Button 
            onClick={() => handleMarekebisho(applicationId)} 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <Edit className="h-4 w-4" />
            <span>Marekebisho</span>
          </Button>
        </div>
      );
    case "under_review":
      return (
        <div className="flex space-x-2">
          <Button 
            onClick={() => handlePrintReceipt(applicationId)} 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <Receipt className="h-4 w-4" />
            <span>Print Receipt</span>
          </Button>
        </div>
      );
    case "returned_for_correction":
      return (
        <div className="flex space-x-2">
          <Button 
            onClick={() => handleMarekebisho(applicationId)} 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Edit className="h-4 w-4" />
            <span>Marekebisho</span>
          </Button>
        </div>
      );
    case "pass_printed":
      return (
        <div className="flex space-x-2">
          <Button 
            onClick={() => handlePrintPass(applicationId)} 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </>
            )}
          </Button>
        </div>
      );
    case "issued":
      return (
        <div className="flex space-x-2">
          <Button 
            onClick={() => handlePrintPass(applicationId)} 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Download PDF</span>
              </>
            )}
          </Button>
        </div>
      );
    case "rejected":
      return (
        <div className="flex space-x-2">
          <Button 
            onClick={() => handleMarekebisho(applicationId)} 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Edit className="h-4 w-4" />
            <span>New Application</span>
          </Button>
        </div>
      );
    default:
      return null;
  }
};

function ApplicationProgressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applicationId, setApplicationId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Auto-search when ID or phone number is provided in URL (only for correction flow)
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    const phoneFromUrl = searchParams.get('phone');
    const editId = searchParams.get('edit');
    
    // Only auto-search if coming from correction flow, not from landing page
    if ((idFromUrl || phoneFromUrl) && !editId) {
      if (idFromUrl) setApplicationId(idFromUrl);
      if (phoneFromUrl) setPhoneNumber(phoneFromUrl);
      // Trigger search automatically only for correction redirects
      handleSearchWithId(idFromUrl || "", phoneFromUrl || "");
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

  const handleSearchWithId = async (searchId: string, searchPhone: string = "") => {
    if (!searchId.trim() && !searchPhone.trim()) {
      setError("Please enter an application ID or phone number");
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

        // Generate mock data based on application ID or phone number
        const mockData: ApplicationStatusData = {
          id: searchId || `APP-${Math.floor(Math.random() * 10000)}`,
          applicantName: "John Doe Smith",
          subjectId: `SUB-${(searchId || Math.floor(Math.random() * 10000).toString()).slice(-4)}-2025`,
          status: mockStatus,
          submittedDate: "2025-08-15",
          lastUpdated: "2025-08-28",
          phoneNumber: searchPhone || "+255 712 345 678",
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
    await handleSearchWithId(applicationId, phoneNumber);
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
    <motion.div variants={itemVariants} className="max-w-5xl mx-auto py-6 px-3 sm:px-4 border border-slate-200 rounded mt-2 bg-white shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3" style={{ minHeight: '450px' }}>
        
        <div className="border border-slate-100 rounded-lg bg-white p-3 shadow-sm sm:col-span-2">
          <h1 className="text-lg font-bold text-slate-500 mb-3 border-b border-slate-200 pb-1">Taarifa za Msingi</h1>
          <p className="text-slate-600 mb-4 text-sm">
            Ili kuweza kufatilia hali ya ombi lako, tafadhali weka namba ya ombi lako na namba ya simu kisha bonyeza "Tafuta Ombi".
          </p>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="applicationId" className="block text-sm font-medium text-slate-700 mb-1">Namba ya Ombi</label>
              <div className="relative">
                <FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="applicationId"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  placeholder="Namba ya ombi"
                  className="bg-white border-slate-200 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full pl-10"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">Namba ya Simu</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Namba ya simu"
                  className="bg-white border-slate-200 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-full pl-10"
                />
              </div>
            </div>
            
            <div className="flex justify-center border-t border-slate-200 pt-4 mt-2">
                <LoadingButton
                  onClick={handleSearch}
                  isLoading={isLoading}
                  loadingText="Inatafuta..."
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded flex items-center gap-2 transition-colors shadow-sm w-full justify-center"
                >
                  <Search className="h-4 w-4" />
                  Tafuta Ombi
                </LoadingButton>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2 flex flex-col h-full border border-slate-100 rounded-lg bg-slate-50/50 p-3 sm:col-span-3 w-full overflow-x-auto"
        >
          {!applicationData && !isLoading && (
            <div className="text-center py-8 px-4 w-full">
              <div className="flex justify-center mb-4">
                <Search className="h-16 w-16 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Hali ya Ombi</h3>
              <p className="text-slate-500 max-w-md mx-auto text-center">
                Tafadhali weka namba ya ombi lako na namba ya simu kisha bonyeza "Tafuta Ombi" kuona hali ya ombi lako.
              </p>
            </div>
          )}
          
          {isLoading && (
            <div className="text-center py-8 px-4 w-full">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Inatafuta...</h3>
              <p className="text-slate-500 max-w-md mx-auto text-center">
                Subiri kidogo tunapotafuta taarifa za ombi lako.
              </p>
            </div>
          )}
          
          {applicationData && !isLoading && (
            <div className="w-full">
              <div className="flex flex-col justify-between items-start mb-3">
                <h2 className="text-lg font-bold text-slate-500 mb-3 border-b border-slate-200 pb-1">Hali ya Ombi</h2>
              </div>
              
              <div className="border shadow-sm overflow-x-auto mb-3 w-full">
                <Table className="w-full min-w-[500px] text-xs">
                  <TableHeader>
                    <TableRow className="bg-slate-50 h-8">
                      <TableHead className="font-semibold">Application ID</TableHead>
                      <TableHead className="font-semibold">Applicant Name</TableHead>
                      <TableHead className="font-semibold">Phone Number</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                            <TableCell className="font-medium">{applicationData.id}</TableCell>
                            <TableCell>{applicationData.applicantName}</TableCell>
                            <TableCell>{applicationData.phoneNumber}</TableCell>
                            <TableCell>{getStatusBadge(applicationData.status)}</TableCell>
                            <TableCell>{getActionButtons(applicationData.status, applicationData.id, applicationData, isGeneratingPDF, setIsGeneratingPDF)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {/* Pass PDF Content (hidden) */}
              <div className="hidden" id="pass-content">
                <PassPDFContent
                  applicationData={{
                    id: applicationData.id,
                    fullName: applicationData.applicantName,
                    nationality: "Tanzania",
                    passportNo: applicationData.id,
                    paymentDate: applicationData.submittedDate,
                    controlNo: applicationData.id,
                    region: "Dar es Salaam"
                  }}
                />
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
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-red-800">Application Rejected</h3>
                        <p className="text-red-700 text-sm">
                          {applicationData.rejectionReason}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleNewApplication}
                      variant="outline"
                      className="ml-4 bg-white text-red-700 border-red-300 hover:bg-red-50 whitespace-nowrap"
                    >
                      Submit New Application
                    </Button>
                  </div>
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
