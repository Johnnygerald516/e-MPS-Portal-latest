"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, Variants } from "framer-motion";
import { Search, CheckCircle, Clock, AlertCircle, Printer, FileCheck, Download, Receipt, FileText, Edit, CreditCard, FileSearch, Phone, MessageCircleQuestionMark, CircleQuestionMarkIcon } from "lucide-react";
import { getApplicationStatus, ApplicationStatusPayload, ApplicationStatusResponse } from "@/services/application-status";
import { ProfessionalLoader } from "@/components/ui/professional-loader";
import PassPDFPreview from "@/components/application/PassPDFPreview";
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
  | "billing" 
  | "under_review" 
  | "returned_for_correction" 
  | "pass_printed" 
  | "issued" 
  | "rejected" 
  | "pending_collection" 
  | "unknown";

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
  statusId?: number;
  statusName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  controlNumber?: string;
}

// import PassPDFContent from "@/components/ui/pass-pdf-content";

// Helper function to determine which action buttons to show based on StatusID
const getActionButtons = (
  status: ApplicationStatus, 
  applicationId: string, 
  applicationData: ApplicationStatusData | null, 
  isGeneratingPDF: boolean,
  setIsGeneratingPDF: (value: boolean) => void,
  setSelectedApplicationId: (id: string) => void,
  setIsPassPreviewOpen: (isOpen: boolean) => void
) => {
  const handlePrintBill = (id: string) => {
  };
  const handlePrintReceipt = (id: string) => {
    // Implementation for printing receipt
  };

  // State is passed from the parent component

  const handlePrintPass = (id: string) => {
    setSelectedApplicationId(id);
    setIsPassPreviewOpen(true);
  };

  const handleMarekebisho = (id: string) => {
  };

  // Use StatusID from applicationData if available, otherwise fall back to status string
  const statusId = applicationData?.statusId;

  // Check StatusID first if available
  if (statusId !== undefined) {
    switch (statusId) {
      case 180: // issued
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
                  <ProfessionalLoader size="sm" color="secondary" thickness="thin" className="mr-1" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" /> <span>Preview Pass</span>
                </>
              )}
            </Button>
          </div>
        );
      case 90: // returned_for_correction
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
      case 140: // billing
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
      case 170: // under_review
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
      default:
        return "inafanyiwa kazi";
    }
  }

  // Fall back to status string if StatusID is not available
  switch (status) {
    case "billing":
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
                <ProfessionalLoader size="sm" color="secondary" thickness="thin" className="mr-1" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" /> <span>Preview Pass</span>
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
      return "inafanyiwa kazi";
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
  const [isPassPreviewOpen, setIsPassPreviewOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

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
      setError("Tafadhali weka namba ya ombi au namba ya simu");
      return;
    }
    // Clear previous application data when starting a new search
    setApplicationData(null);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare the payload for the API call
      const payload: ApplicationStatusPayload = {
        applicationId: searchId.trim(),
        phoneNumber: searchPhone.trim()
      };
      
      // Call the API to get application status
      const response = await getApplicationStatus(payload);
      
      if (response.ackCode === 1 && response.jsonResult) {
        // Map the API response to our application data structure
        const result = response.jsonResult;
        
        // Determine application status based on StatusID
        let status: ApplicationStatus = "unknown";
        
        // Map StatusID to our application status types
        switch (result.StatusID) {
          // Updated StatusID mappings as per requirements
          case 140:
            status = "billing";
            break;
          case 170:
            status = "under_review";
            break;
          case 90:
            status = "returned_for_correction";
            break;
          case 180:
            status = "issued";
            break;
          // Keep other existing mappings for backward compatibility
          case 10:
            status = "received";
            break;
          case 20:
          case 30:
            status = "billing";
            break;
          case 40:
          case 50:
            status = "under_review";
            break;
          case 60:
            status = "returned_for_correction";
            break;
          case 80:
            status = "pass_printed";
            break;
          case 100:
            status = "pending_collection";
            break;
          case 110:
            status = "rejected";
            break;
          default:
            // If we don't recognize the status code, use the status name to determine the status
            if (result.statusName) {
              const statusNameLower = result.statusName.toLowerCase();
              if (statusNameLower.includes('fika ofisi') || statusNameLower.includes('makabidhiano')) {
                status = "pending_collection";
              } else if (statusNameLower.includes('kataliwa') || statusNameLower.includes('reject')) {
                status = "rejected";
              } else if (statusNameLower.includes('chapishwa') || statusNameLower.includes('print')) {
                status = "pass_printed";
              } else if (statusNameLower.includes('tolewa') || statusNameLower.includes('issue')) {
                status = "issued";
              } else {
                status = "billing";
              }
            } else {
              status = "billing";
            }
        }
        
        // Create application data directly from API response
        const applicationData: ApplicationStatusData = {
          id: result.applicationID,
          applicantName: `${result.firstName} ${result.middleName || ''} ${result.lastName}`.trim(),
          firstName: result.firstName,
          middleName: result.middleName || '',
          lastName: result.lastName,
          subjectId: result.applicationID,
          status: status,
          statusId: result.StatusID,
          statusName: result.statusName,
          submittedDate: new Date().toISOString().split('T')[0], // Use current date as we don't have this from API
          lastUpdated: new Date().toISOString().split('T')[0],
          phoneNumber: result.phoneNumber,
          controlNumber: result.controlNumber || '',
        };

        setApplicationData(applicationData);
      } else {
        setError(response.ackMessage || "Hakuna taarifa za ombi zilizopatikana. Tafadhali hakiki namba ya ombi na namba ya simu.");
        setApplicationData(null);
      }
    } catch (err) {
      setError("Imeshindikana kupata hali ya ombi. Tafadhali jaribu tena baadae.");
      setApplicationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    await handleSearchWithId(applicationId, phoneNumber);
  };

  const handleCorrectApplication = () => {
    if (applicationData?.id) {
      router.push('/dashboard');
    }
  };

  const handleNewApplication = () => {
    router.push("/dashboard");
  };

  const getStatusBadge = (status: ApplicationStatus, statusName?: string) => {
    const displayStatusName = statusName || "";
    
    switch (status) {
      case "received":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            {displayStatusName || "Ombi Limepokelewa"}
          </Badge>
        );
      case "billing":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {displayStatusName || "Inaendelea"}
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            {displayStatusName || "Inapitiwa"}
          </Badge>
        );
      case "returned_for_correction":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {displayStatusName || "Imerudishwa kwa Marekebisho"}
          </Badge>
        );
      case "pass_printed":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5">
            <Printer className="w-4 h-4" />
            {displayStatusName || "Kibali Kimechapishwa"}
          </Badge>
        );
      case "issued":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            {displayStatusName || "Kibali Kimetolewa"}
          </Badge>
        );
      case "pending_collection":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {displayStatusName || "Fika ofisi uliyoombea kwa makabidhiano"}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            {displayStatusName || "Ombi Limekataliwa"}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {displayStatusName || "Hali Haijulikani"}
          </Badge>
        );
    }
  };

  return ( 
    <motion.div variants={itemVariants} className="max-w-7xl mx-auto py-6 px-3 sm:px-4 border border-slate-200 rounded mt-2 bg-white shadow-sm">
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
                  className="bg-indigo-800 hover:bg-indigo-900 text-white px-6 py-2 rounded flex items-center gap-2 transition-colors shadow-sm w-full justify-center"
                >
                  <Search className="h-4 w-4" />
                  Tafuta Ombi
                </LoadingButton>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mt-2">
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
                <CircleQuestionMarkIcon className="h-16 w-16 text-slate-300" />
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
                <ProfessionalLoader size="xl" color="indigo" thickness="thin" />
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
                      <TableHead className="font-semibold">Control Number</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                            <TableCell className="font-medium">{applicationData.id}</TableCell>
                            <TableCell>{applicationData.applicantName}</TableCell>
                            <TableCell>{applicationData.controlNumber}</TableCell>
                            <TableCell>{getStatusBadge(applicationData.status, applicationData.statusName)}</TableCell>
                            <TableCell>{getActionButtons(applicationData.status, applicationData.id, applicationData, isGeneratingPDF, setIsGeneratingPDF, setSelectedApplicationId, setIsPassPreviewOpen)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              {/* Pass Preview Dialog */}
              <PassPDFPreview
                open={isPassPreviewOpen}
                onOpenChange={setIsPassPreviewOpen}
                applicationId={selectedApplicationId}
                refreshApplications={() => {
                  // Refresh application data if needed
                  if (applicationId || phoneNumber) {
                    handleSearchWithId(applicationId, phoneNumber);
                  }
                }}
              />
              
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
