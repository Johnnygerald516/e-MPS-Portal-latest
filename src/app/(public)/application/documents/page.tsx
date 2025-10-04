"use client";

import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Save, ArrowRight } from "lucide-react";
import Image from "next/image";
import { applicationsEndpoints, DocumentAttachment } from "@/lib/api/endpoints/applications";
import { documentsEndpoints } from "@/lib/api";

// Import core components immediately needed
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { fileToBase64 } from "@/lib/utils/base64";

// Lazy load components that aren't needed immediately
const DocumentsTable = lazy(() => import("@/components/datatables/DocumentsTable"));
const Dialog = lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog })));
const DialogContent = lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent })));
const DialogDescription = lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogDescription })));
const DialogFooter = lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogFooter })));
const DialogHeader = lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader })));
const DialogTitle = lazy(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle })));
const Select = lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.Select })));
const SelectContent = lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectContent })));
const SelectItem = lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectItem })));
const SelectTrigger = lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectTrigger })));
const SelectValue = lazy(() => import("@/components/ui/select").then(mod => ({ default: mod.SelectValue })));
const Badge = lazy(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge })));

// Import additional icons only when needed
import dynamic from 'next/dynamic';
const Clock = dynamic(() => import('lucide-react').then(mod => mod.Clock), { ssr: false });
const CheckCircle = dynamic(() => import('lucide-react').then(mod => mod.CheckCircle), { ssr: false });
const AlertCircle = dynamic(() => import('lucide-react').then(mod => mod.AlertCircle), { ssr: false });



// Form validation schema
const documentsSchema = z.object({
  identificationType: z.enum(["national_id", "passport", "voter_id", "driving_license"]),
  identificationNumber: z.string().min(5, "Identification number is required"),
  previousPassNumber: z.string().optional(),
  // We'll handle file validation separately since z.instanceof(File) doesn't work well with form reset
});

type DocumentsFormValues = z.infer<typeof documentsSchema>;

// Define the document types we need to upload
interface DocumentFiles {
  applicantPhoto: File | null;
  localGovernmentLetter: File | null;
  entryProof: File | null;
  parentProof: File | null;
}

// Define the document types for the table
interface DocumentType {
  id: string;
  name: string;
  description: string;
  status: "pending" | "uploading" | "uploaded" | "approved" | "rejected";
  required: boolean;
}

// Extend the ApplicationFormData type to include document uploads
type ExtendedApplicationFormData = {
  documentUploads?: {
    applicantPhoto?: string;
    localGovernmentLetter?: string;
    entryProof?: string;
    parentProof?: string;
  };
}

export default function DocumentsPage() {
  const router = useRouter();
  const { formData, updateFormData, isLoading, setIsLoading } = useApplication();
  const [autoNavigateToNext, setAutoNavigateToNext] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // Reset autoNavigateToNext when component mounts to prevent automatic navigation on page refresh
  useEffect(() => {
    setAutoNavigateToNext(false);
  }, []);
  
  // Get applicationId from context
  const applicationId = formData.applicationId || '';
  
  
  // State for tracking uploaded files
  const [documentFiles, setDocumentFiles] = useState<DocumentFiles>({
    applicantPhoto: null,
    localGovernmentLetter: null,
    entryProof: null,
    parentProof: null
  });
  
  // State to track if all required documents are uploaded successfully
  const [allDocumentsUploaded, setAllDocumentsUploaded] = useState(false);
  
  // State to store the nextStageId from document uploads
  const [nextStageId, setNextStageId] = useState<string | null>(null);
  
  // State for the document types table - initialize as empty, will be populated from API
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  
  // State for the currently selected document for upload
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  
  // State for the upload dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<DocumentsFormValues>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      identificationType: formData?.identificationType,
      identificationNumber: formData?.identificationNumber,
      previousPassNumber: formData?.previousPassNumber,
    },
  });
  
  // Create object URLs for file previews
  const [filePreviewUrls, setFilePreviewUrls] = useState<Record<string, string>>({
    applicantPhoto: '',
    localGovernmentLetter: '',
    entryProof: '',
    parentProof: ''
  });

  // File input references
  const fileInputRefs = {
    applicantPhoto: useRef<HTMLInputElement>(null),
    localGovernmentLetter: useRef<HTMLInputElement>(null),
    entryProof: useRef<HTMLInputElement>(null),
    parentProof: useRef<HTMLInputElement>(null)
  };

  // Handle file change for document uploads
  const handleFileChange = (field: keyof DocumentFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type - no PDFs allowed
      if (file.type === 'application/pdf') {
        toast({
          title: "File type not allowed",
          description: "PDF files are not allowed. Please upload an image file.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size - max 300KB
      const maxSize = 300 * 1024; // 300KB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "File size must be less than 300KB.",
          variant: "destructive"
        });
        return;
      }
      
      // Update the document files state
      setDocumentFiles(prev => ({
        ...prev,
        [field]: file
      }));
      
      // Create a preview URL for the file
      const fileUrl = URL.createObjectURL(file);
      setFilePreviewUrls(prev => ({
        ...prev,
        [field]: fileUrl
      }));
    }
  };
  
  // Note: Using shared fileToBase64 utility from @/lib/utils/base64
  
  // Upload file to server
  const uploadFile = async (documentId: string) => {
    const file = documentFiles[documentId as keyof DocumentFiles];
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Set loading state for this specific document
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, status: "uploading" } : doc
        )
      );
      
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Create document attachment payload
      const attachmentData: DocumentAttachment = {
        attachmentTypeId: documentId,
        attachment: base64Data
      };
      
      // Send the attachment to the API
      const response = await applicationsEndpoints.submitDocumentAttachment(applicationId, attachmentData);
      
      // Check if the upload was successful
      if (response && response.ackCode === 1) {
        // Update the document status in the table
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId ? { ...doc, status: "uploaded" } : doc
          )
        );
        
        // Close the dialog if it's open
        setIsDialogOpen(false);
        
        // Show success toast
        toast({
          title: "File uploaded",
          description: `${selectedDocument?.name} has been uploaded successfully.`,
          variant: "default"
        });
        
        // Check if all required documents are now uploaded
        checkAllDocumentsUploaded();
        
        return true;
      } else {
        throw new Error(response?.ackMessage || "Upload failed");
      }
    } catch (error) {
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, status: "pending" } : doc
        )
      );
      
      // Show error toast
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  // Check if all required documents are uploaded
  const checkAllDocumentsUploaded = () => {
    // Count documents with 'uploaded' or 'approved' status
    const uploadedDocs = documents.filter(doc => doc.status === "uploaded" || doc.status === "approved");
    
    // Get required documents
    const requiredDocuments = documents.filter(doc => doc.required);
    
    // Check if all required documents are uploaded or approved
    const allRequiredUploaded = requiredDocuments.every(doc => 
      doc.status === "uploaded" || doc.status === "approved"
    );
    
    // Check if at least 4 documents are uploaded, including applicant photo
    const validation = validateDocumentRequirements();
    const result = validation.isValid;
    
    setAllDocumentsUploaded(result);
    return result;
  };
  
  // Effect to check document status whenever documents change
  useEffect(() => {
    checkAllDocumentsUploaded();
  }, [documents]);
  
  // Handle file removal
  const handleRemoveFile = (documentType: keyof DocumentFiles) => {
    // Reset the file input
    if (fileInputRefs[documentType].current) {
      fileInputRefs[documentType].current!.value = '';
    }
    
    // Clear the file state
    setDocumentFiles(prev => ({ ...prev, [documentType]: null }));
    
    // Revoke the object URL to prevent memory leaks
    if (filePreviewUrls[documentType]) {
      URL.revokeObjectURL(filePreviewUrls[documentType]);
      setFilePreviewUrls(prev => ({ ...prev, [documentType]: '' }));
    }
    
    // Update the document status in the table
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentType ? { ...doc, status: "pending" } : doc
      )
    );
    
    // Show toast
    toast({
      title: "File removed",
      description: `Document has been removed.`,
      variant: "default"
    });
  };
  
  // Open upload dialog for a specific document
  const openUploadDialog = (document: DocumentType) => {
    setSelectedDocument(document);
    setIsDialogOpen(true);
  };
  
  // Get status badge for document
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"><Clock className="h-3 w-3" /> Bado</Badge>;
      case "uploading":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Inapakia...</Badge>;
      case "uploaded":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Inapakia</Badge>;
     default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Watch for application type to conditionally render fields
  const applicationType = formData.applicationType;
  const showPreviousPassportField = applicationType === "renew" || applicationType === "damage";
  
  // Handle save and exit
  const handleSaveAndExit = async () => {
    setIsExiting(true);
    try {
      const data = form.getValues();
      
      // Create document uploads object for form data
      const documentUploads = {
        applicantPhoto: documentFiles.applicantPhoto?.name,
        localGovernmentLetter: documentFiles.localGovernmentLetter?.name,
        entryProof: documentFiles.entryProof?.name,
        parentProof: documentFiles.parentProof?.name,
      };
      
      // Update global form data with type casting to allow documentUploads
      updateFormData({
        ...formData,
        ...data,
        documentUploads
      } as typeof formData & ExtendedApplicationFormData);
      
      // Try to use nextStageId if available, but don't require it
      if (nextStageId) {
        try {
          // Call the endpoint to proceed to the next stage
          const response = await fetch(`/api/applications/${applicationId}/attachments/${nextStageId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
          }
        } catch (error) {
        }
      }
      
      // Show success toast
      toast({
        title: "Taarifa",
        description: "Taarifa zimehifadhiwa kikamilifu",
        variant: "default",
      });
      
      // Navigate to landing page
      router.push('/');
    } catch (error) {
      toast({
        title: "Hitilafu",
        description: "Samahani, kuna hitilafu imetokea wakati wa kuhifadhi taarifa zako. Tafadhali jaribu tena.",
        variant: "destructive",
      });
    } finally {
      setIsExiting(false);
    }
  };
  
  // Check if validation requirements are met (at least 4 files including applicant photo)
  const validateDocumentRequirements = () => {
    // Get the uploaded documents from the documents state - include both 'uploaded' and 'approved' status
    const uploadedDocuments = documents.filter((doc: DocumentType) => doc.status === "uploaded" || doc.status === "approved");
    const uploadedCount = uploadedDocuments.length;
    
    // Check if applicant photo is uploaded - ID 1 is typically the applicant photo
    // Include both 'uploaded' and 'approved' status for the photo
    const applicantPhotoUploaded = documents.some(
      (doc: DocumentType) => doc.id === "1" && (doc.status === "uploaded" || doc.status === "approved")
    );
    
    // Return validation result with appropriate error message
    if (uploadedCount < 4 && !applicantPhotoUploaded) {
      // Both requirements are missing
      return { isValid: false, message: "Tafadhali pakia angalau nyaraka 4 ikiwemo picha ya muombaji" };
    } else if (uploadedCount < 4) {
      // Not enough documents
      return { isValid: false, message: "Tafadhali pakia angalau nyaraka 4 (ikiwemo picha ya muombaji)" };
    } else if (!applicantPhotoUploaded) {
      // Enough documents but no applicant photo
      return { isValid: false, message: "Picha ya muombaji ni lazima iwe miongoni mwa nyaraka zilizopakiwa" };
    }
    
    return { isValid: true, message: "" };
  };

  // Direct navigation function for the continue button
  const handleContinue = async () => {
    // First validate document requirements
    const validation = validateDocumentRequirements();
    
    if (!validation.isValid) {
      // Show error message if validation fails
      toast({
        title: "Taarifa Hazijatosheleza",
        description: validation.message,
        variant: "destructive",
      });
      return; // Stop execution if validation fails
    }
    
    // Show success message only if validation passes
    toast({
      title: "Mafanikio",
      description: "Nyaraka zimehifadhiwa kikamilifu",
      variant: "default",
    });
    
    setIsLoading(true);
    try {
      const data = form.getValues();
      updateFormData(data);
      
      // Use a default nextStageId if none is available
      const stageId = nextStageId || '80';
      
      // Call the endpoint to proceed to the next stage
      const response = await fetch(`/api/applications/${applicationId}/attachments/${stageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        if (responseData.ackCode === 1) {
          // Show success message
          toast({
            title: "Mafanikio",
            description: "Nyaraka zimehifadhiwa kikamilifu",
            variant: "default",
          });
          
          // Set autoNavigateToNext to true to trigger automatic navigation in ApplicationLayout
          // Important: Don't set isLoading to false here, let the navigation complete first
          setAutoNavigateToNext(true);
          return;
        }
      }
      
      // If API call succeeds, navigate to declaration page
      router.push('/application/declaration');
      // Don't set isLoading to false here, let the navigation complete first
    } catch (error) {
      // If there's an error, set isLoading to false and show error message
      setIsLoading(false);
      toast({
        title: "Hitilafu",
        description: "Samahani, kuna hitilafu imetokea. Tafadhali jaribu tena.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (data: DocumentsFormValues) => {
    // First validate document requirements
    const validation = validateDocumentRequirements();
    
    if (!validation.isValid) {
      // Show error message if validation fails
      toast({
        title: "Taarifa Hazijatosheleza",
        description: validation.message,
        variant: "destructive",
      });
      return; // Stop execution if validation fails
    }
    
    try {
      setIsLoading(true);
      
      // Show success message only if validation passes
      toast({
        title: "Mafanikio",
        description: "Nyaraka zimehifadhiwa kikamilifu",
        variant: "default",
      });
      
      // Create document uploads object for form data
      const documentUploads = {
        applicantPhoto: documentFiles.applicantPhoto?.name,
        localGovernmentLetter: documentFiles.localGovernmentLetter?.name,
        entryProof: documentFiles.entryProof?.name,
        parentProof: documentFiles.parentProof?.name,
      };
      
      // Update global form data with type casting to allow documentUploads
      updateFormData({
        currentStep: 70, // Update to declaration step
        ...formData,
        ...data,
        documentUploads
      } as typeof formData & ExtendedApplicationFormData);

      // Try to use nextStageId if available, but don't require it
      if (nextStageId) {
        try {
          // Call the endpoint to proceed to the next stage
          const response = await fetch(`/api/applications/${applicationId}/attachments/${nextStageId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const responseData = await response.json();
            
            if (responseData.ackCode === 1) {
              // Show success message
              toast({
                title: "Mafanikio",
                description: "Nyaraka zimehifadhiwa kikamilifu",
                variant: "default",
              });
              
              // If there's a redirect URL in the response, navigate to it
              if (responseData.jsonResult?.redirectUrl) {
                router.push(responseData.jsonResult.redirectUrl);
                return;
              }
              
              // Set autoNavigateToNext to true to trigger automatic navigation in ApplicationLayout
              setAutoNavigateToNext(true);
              return;
            }
          } 
        } catch (error) {
          // Continue with default navigation even if there's an error
        }
      }

      // Set autoNavigateToNext to true to trigger automatic navigation in ApplicationLayout
      setAutoNavigateToNext(true);
    } catch (error) {
      toast({
        title: "Hitilafu",
        description: "Samahani, kuna hitilafu imetokea wakati wa kuwasilisha nyaraka zako. Tafadhali jaribu tena.",
        variant: "destructive",
      });
      // Only set isLoading to false if there's an error and we're not navigating
      setIsLoading(false);
    }
  };
  
  return (
      <ApplicationLayout 
        title="Nyaraka za Maombi" 
        subtitle="Tafadhali pakia nyaraka zote zinazohitajika kwa ajili ya maombi yako."
      applicationId={applicationId}
      currentStep="viambatanisho"
      autoNavigateToNext={autoNavigateToNext}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-md border border-slate-100 shadow-sm">
           {showPreviousPassportField && (
              <FormField
                control={form.control}
                name="previousPassNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Previous Passport Number (if any)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter previous passport number" className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div> */}

          <div className="mt-8 p-4 rounded-md border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-lg font-medium text-slate-800">Nyaraka Muhimu</h2>
              <p className="text-sm text-slate-500">Tafadhali pakia nyaraka zote muhimu.</p>
            </div>
            
            {/* Document upload instructions */}
            {/* <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Document Upload Instructions:</h3>
              <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
                <li>Click the <strong>Upload</strong> button to select a PDF document</li>
                <li>Review your document in the preview window that appears</li>
                <li>Click <strong>Confirm & Submit Document</strong> if the document is correct</li>
                <li>Or click <strong>Close Preview</strong> and try again if you need to select a different file</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2">Note: All documents must be previewed before submission</p>
            </div> */}
            
            <div>
              {/* Using our new DocumentsTable component */}
              <Suspense fallback={
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2">Loading documents...</span>
                </div>
              }>
                <DocumentsTable 
                  applicationId={applicationId} 
                  onNextStageAvailable={(stageId) => setNextStageId(stageId)}
                  onDocumentsStatusChange={(updatedDocuments) => {
                    // Update the documents state with the latest documents from the table
                    if (updatedDocuments && updatedDocuments.length > 0) {
                      // Convert the document format if needed
                      const formattedDocuments = updatedDocuments.map(doc => ({
                        id: doc.id,
                        name: doc.name,
                        description: doc.description,
                        status: doc.status,
                        required: true
                      }));
                      
                      setDocuments(formattedDocuments);
                      
                      // Check if all required documents are uploaded
                      // We need to do this after setting the documents state
                      setTimeout(() => {
                        const validation = validateDocumentRequirements();
                        setAllDocumentsUploaded(validation.isValid);
                      }, 0);
                    }
                  }}
                />
              </Suspense>
            </div>
            
            {/* Upload Dialog */}
            <Suspense fallback={null}>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) setIsDialogOpen(false);
              }}>
                <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload {selectedDocument?.name}</DialogTitle>
                  <DialogDescription>
                    Please select a file to upload. Maximum size is 300KB. Only image files are allowed.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="uploadFile" className="text-sm font-medium text-neutral-500">
                      Select File
                    </label>
                    <input
                      className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded-md border border-solid border-slate-300 bg-transparent bg-clip-padding px-3 py-2 text-base font-normal text-slate-700 transition-all duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:me-3 file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-e file:border-solid file:border-inherit file:bg-slate-50 file:px-3 file:py-[0.32rem] file:text-slate-700 hover:border-slate-400 focus:border-blue-500 focus:text-slate-700 focus:shadow-sm focus:outline-none"
                      type="file"
                      id="uploadFile"
                      ref={selectedDocument ? fileInputRefs[selectedDocument.id as keyof DocumentFiles] : null}
                      accept="image/jpeg,image/png"
                      onChange={(e) => selectedDocument && handleFileChange(selectedDocument.id as keyof DocumentFiles, e)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border border-gray-300 text-gray-700"
                  >
                    Ghairi
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={async () => {
                      const input = fileInputRefs[selectedDocument?.id as keyof DocumentFiles].current;
                      if (input && input.files && input.files[0]) {
                        // First update the file in state
                        handleFileChange(selectedDocument?.id as keyof DocumentFiles, { target: input } as React.ChangeEvent<HTMLInputElement>);
                        
                        // Then upload the file
                        if (selectedDocument) {
                          await uploadFile(selectedDocument.id);
                        }
                      } else {
                        toast({
                          title: "No file selected",
                          description: "Please select a file to upload.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Pakia
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </Suspense>
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between">
              <LoadingButton 
                type="button" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-2 rounded flex items-center"
                onClick={handleSaveAndExit}
                isLoading={isExiting}
                loadingText="Inaendelea..."
                spinnerVariant="secondary"
              >
                <Save className="mr-2 h-4 w-4" />
                Hifadhi na Toka
              </LoadingButton>
              
              <LoadingButton 
                type="button" 
                className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded flex items-center"
                onClick={handleContinue}
                disabled={isLoading}
                isLoading={isLoading}
                loadingText="Inaendelea..."
                spinnerVariant="primary"
                title="Bonyeza ili kuendelea"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Hifadhi na Endelea
              </LoadingButton>
            </div>
          </div>
        </form>
      </Form>
      
      <Toaster />
    </ApplicationLayout>
  );
}
