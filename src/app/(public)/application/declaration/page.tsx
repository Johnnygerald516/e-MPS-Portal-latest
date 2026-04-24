"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { CheckCircle, Loader2, Edit2, User, Home, Users, FileText, Upload, Calendar, Globe, Save, Eye, X, UserPen } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InteractiveCheckbox } from "@/components/ui/interactive-checkbox";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useApplication } from "@/contexts/application-context";
import { useRouter, useSearchParams } from "next/navigation";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { getExtendedSpinTimeProps } from "@/lib/utils/button-utils";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { processApiImageData, debugBase64Image } from "@/lib/utils/base64";
import Base64Image from "@/components/ui/base64-image";
import PersonalInfoEditDialog from "@/components/application/personal-info-edit-dialog";
import { ResidenceInfoEditDialog } from "@/components/application/residence-info-edit-dialog";
import { ParentsInfoEditDialog } from "@/components/application/parents-info-edit-dialog";
import { DependantsInfoEditDialog } from "@/components/application/dependants-info-edit-dialog";

// Form validation schema
const declarationSchema = z.object({
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type DeclarationFormValues = z.infer<typeof declarationSchema>;

// Define document types for the image viewer
type DocumentType = 'barua_ya_mtendaji' | 'picha_ya_muombaji' | 'ushahidi_wa_kuingia_nchini' | 'ushahidi_wa_wazazi';

type DocumentInfo = {
  title: string;
  imagePath: string;
  description: string;
};

// Define interface for dependant data from API
interface DependantData {
  dependantFullName?: string;
  dependantRelationType: number;
  dependantGender?: string;
  dependantNationality: number;
  documentNumber?: string;
  expireDate?: string;
  issueDate?: string;
}

// Define interfaces for lookup data
interface LookupItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

interface LookupResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: LookupItem[];
}
export default function DeclarationPage() {
  const { formData, updateFormData, setIsLoading, isLoading } = useApplication();
  const router = useRouter();
  const [autoNavigateToNext, setAutoNavigateToNext] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Reset autoNavigateToNext when component mounts to prevent automatic navigation on page refresh
  useEffect(() => {
    setAutoNavigateToNext(false);
  }, []);
  
  // Get applicationId from context instead of URL parameters
  const applicationId = formData.applicationId || '';
  
  // Turn off loading state when declaration page loads
  useEffect(() => {
    // Short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [setIsLoading]);
  
  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Store a reference to whether this is an initial render
  const isInitialRender = React.useRef(true);
  
  // Find the current step index in the navigation items
  const navigationItems = [
    { id: 'habari-binafsi', label: 'Habari Binafsi', href: '/application/basic-info' },
    { id: 'anuwani-ya-makazi', label: 'Anuwani ya Makazi', href: '/application/residence-info' },
    { id: 'habari-za-wazazi', label: 'Habari za Wazazi', href: '/application/parents-info' },
    { id: 'habari-za-wategemezi', label: 'Habari za Wategemezi', href: '/application/dependant-info' },
    { id: 'viambatanisho', label: 'Viambatanisho', href: '/application/documents' },
    { id: 'tamko-rasmi', label: 'Tamko Rasmi', href: '/application/declaration' },
    { id: 'complete', label: 'Mafanikio', href: '/application/complete' }
  ];
  
  const currentStepIndex = navigationItems.findIndex(item => item.id === 'tamko-rasmi');
  
  // Get the next step if it exists
  const nextStep = currentStepIndex >= 0 && currentStepIndex < navigationItems.length - 1 
    ? navigationItems[currentStepIndex + 1] 
    : null;

  // Effect to handle automatic navigation to the next tab when autoNavigateToNext is true
  useEffect(() => {
    // Only navigate if:
    // 1. autoNavigateToNext is true
    // 2. We have a next step to navigate to
    // 3. The component is mounted
    // 4. This is NOT the initial render (prevents navigation on page refresh)
    if (autoNavigateToNext && nextStep && isMounted && !isInitialRender.current) {
      // Keep the loading state active during navigation
      // The loading state will be handled by the next page after navigation
      const timer = setTimeout(() => {
        router.push(nextStep.href);
      }, 300); // 300ms delay before navigation - faster response
      
      return () => clearTimeout(timer);
    }
    
    // After the first render, set isInitialRender to false
    if (isInitialRender.current) {
      isInitialRender.current = false;
    }
  }, [autoNavigateToNext, nextStep, router, isMounted]);
  const [currentDocument, setCurrentDocument] = useState<DocumentInfo | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
  // State for edit dialogs
  const [isPersonalInfoDialogOpen, setIsPersonalInfoDialogOpen] = useState(false);
  const [isResidenceInfoDialogOpen, setIsResidenceInfoDialogOpen] = useState(false);
  const [isParentsInfoDialogOpen, setIsParentsInfoDialogOpen] = useState(false);
  const [isDependantsInfoDialogOpen, setIsDependantsInfoDialogOpen] = useState(false);
  
  // State for applicant photo
  const [applicantPhoto, setApplicantPhoto] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  
  // State for all attachments
  const [attachments, setAttachments] = useState<Record<string, string>>({});
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  
  // State for application data
  const [applicationData, setApplicationData] = useState<any>(null);
  const [isLoadingApplicationData, setIsLoadingApplicationData] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // Function to fetch application data - used by dialogs
  const fetchApplicationData = async () => {
    if (!applicationId) return;
    
    setIsLoadingApplicationData(true);
    try {
      const response = await fetch(`/applications/${applicationId}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch application data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.ackCode === 1 && data.jsonResult) {
        setApplicationData(data.jsonResult);
        // Update form data with the new values
        const applicationDetails = data.jsonResult.ApplicationDetails && 
          data.jsonResult.ApplicationDetails.length > 0 ? 
          data.jsonResult.ApplicationDetails[0] : null;
        
        if (applicationDetails) {
          updateFormData({
            // Update form data with the new values
            firstName: applicationDetails.firstName || "",
            middleName: applicationDetails.middleName || "",
            lastName: applicationDetails.lastName || "",
            countryOfBirth: applicationDetails.countryOfBirth || "",
            // Other fields are updated in the main useEffect
          });
        }
      }
    } catch (error) {
    } finally {
      setIsLoadingApplicationData(false);
    }
  };
  

  // Fetch application data including applicant photo and attachments
  useEffect(() => {
    // Initialize empty attachments map
    const initializeAttachments = () => {
      // Empty attachments map since we're not fetching documents separately anymore
      const attachmentMap: Record<string, string> = {};
      setAttachments(attachmentMap);
    };
    
    // Maximum number of retries
    const MAX_RETRIES = 3;
    let retryCount = 0;
    
    const fetchData = async (retry = 0) => {
      if (!applicationId) {
        return;
      }
      
      if (retry === 0) {
        // Only show loading indicators on first attempt
        setIsLoadingPhoto(true);
        setIsLoadingAttachments(true);
        setPhotoError(null);
        setIsLoadingApplicationData(true);
      }
      
      // Add timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        setIsLoadingPhoto(false);
        setPhotoError("Muda wa kusubiri umekwisha");
      }, 15000); // 15 second timeout (increased from 10s)
      
      try {
        // Add a timeout to prevent hanging requests
        const controller = new AbortController();
        const requestTimeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout (increased from 15s)
        const response = await fetch(`/applications/${applicationId}`, {
          signal: controller.signal,
          // Add cache control headers to prevent caching issues
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        clearTimeout(requestTimeoutId);
        
        if (!response.ok) {
          // Handle specific error codes
          if (response.status === 503 && retry < MAX_RETRIES) {
            clearTimeout(timeoutId);
            clearTimeout(requestTimeoutId);
            
            // Wait longer between each retry
            await new Promise(resolve => setTimeout(resolve, (retry + 1) * 2000));
            return fetchData(retry + 1);
          }
          
          throw new Error(`Failed to fetch application data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.ackCode === 1 && data.jsonResult) {
          // Store the full application data for reference
          setApplicationData(data.jsonResult);
           const applicationDetails = data.jsonResult.ApplicationDetails && 
            data.jsonResult.ApplicationDetails.length > 0 ? 
            data.jsonResult.ApplicationDetails[0] : null;
          
          if (applicationDetails) {
            updateFormData({
              firstName: applicationDetails.firstName || "",
              middleName: applicationDetails.middleName || "",
              lastName: applicationDetails.lastName || "",
              otherName: applicationDetails.otherName || "",
              dateOfBirth: applicationDetails.dateOfBirth ? new Date(applicationDetails.dateOfBirth) : undefined,
              gender: applicationDetails.gender || "",
              maritalStatus: applicationDetails.maritalStatus || "",
              // Occupation fields
              occupationType: applicationDetails.occupationType || "",
              occupation: applicationDetails.occupation || "", // Added occupation field
              occupationDetail: applicationDetails.occupationDetail || "",
              employmentStatus: applicationDetails.occupationDetail || "",
              
              // Contact information
              mobileNumber: applicationDetails.mobileNumber || "",
              
              // Birth information
              countryOfBirth: applicationDetails.countryOfBirth || "",
              birthRegionName: applicationDetails.regionOfBirth || "",
              
              // Residence information
              countryOfResidence: applicationDetails.countryOfResidence || "",
              region: applicationDetails.regionOfResidence || applicationDetails.region || "", // Added region field
              district: applicationDetails.districtOfResidence || "",
              ward: applicationDetails.wardOfResidence || "",
              street: applicationDetails.streetOfResidence || "",
              
              // Additional residence details
              houseNumber: applicationDetails.houseNumber || "",
              plotNumber: applicationDetails.plotNumber || "",
              
              // Nationality information
              nationality: applicationDetails.nationality || "",
              countryOfOrigin: applicationDetails.countryOfOrigin || "",
              dateOfEntry: applicationDetails.dateOfEntryTanzania ? new Date(applicationDetails.dateOfEntryTanzania) : undefined,
              fatherName: applicationDetails.fatherFullName || "",
              fatherDateOfBirth: applicationDetails.fatherDateOfBirth ? new Date(applicationDetails.fatherDateOfBirth) : undefined,
              fatherCountryOfBirth: applicationDetails.fatherCountryOfBirth || "",
              fatherRegionOfBirth: applicationDetails.fatherRegionOfBirth || "",
              fatherNationality: applicationDetails.fatherNationality || "",
              motherName: applicationDetails.motherFullName || "",
              motherDateOfBirth: applicationDetails.motherDateOfBirth ? new Date(applicationDetails.motherDateOfBirth) : undefined,
              motherCountryOfBirth: applicationDetails.motherCountryOfBirth || "",
              motherRegionOfBirth: applicationDetails.motherRegionOfBirth || "",
              motherNationality: applicationDetails.motherNationality || "",
              // Add dependants if available - based on the API response sample
              dependants: data.jsonResult.applicationdependants ? 
                data.jsonResult.applicationdependants.filter((dep: DependantData) => dep.dependantFullName).map((dep: DependantData) => ({
                  name: dep.dependantFullName || "",
                  relationship: dep.dependantRelationType?.toString() || "",
                  gender: dep.dependantGender || "",
                  nationality: dep.dependantNationality?.toString() || "",
                  passportNumber: dep.documentNumber || "",
                  passportIssuedDate: dep.issueDate ? new Date(dep.issueDate) : undefined,
                  passportExpiryDate: dep.expireDate ? new Date(dep.expireDate) : undefined,
                  dateOfBirth: dep.issueDate ? new Date(dep.issueDate) : undefined
                })) : []
            });
          }
          if (Array.isArray(data.jsonResult.applicantPhoto) && data.jsonResult.applicantPhoto.length > 0) {
            const rawPhotoItem = data.jsonResult.applicantPhoto[0];
            const photoSrc = getBase64ImageSrc(rawPhotoItem);
           
            debugBase64Image(photoSrc, 'Applicant Photo from API');
          
            if (photoSrc) {
              setApplicantPhoto(photoSrc);
             } else {
              setPhotoError("Imeshindwa kusindika picha");
            }
          } else {
            setPhotoError("Picha ya muombaji haikupatikana");
          }
          
          
          // Process attachments - applicationAttachment contains attachment data
          if (data.jsonResult.applicationAttachment && Array.isArray(data.jsonResult.applicationAttachment)) {
            const attachmentMap: Record<string, string> = {};
            
            // Process each attachment synchronously first, then fetch if needed
            const processAttachments = async () => {
              const attachmentMap: Record<string, string> = {};
              
              for (const attachment of data.jsonResult.applicationAttachment) {
                try {
                  // Use attachment type ID directly as key
                  const attachmentKey = `attachment_${attachment.attachmentType}`;
                  
                  if (attachmentKey) {
                    // Check if attachment has base64 data directly in attachmentType field (like applicantPhoto)
                    if (attachment.attachmentData && typeof attachment.attachmentData === 'string') {
                      // Direct base64 data
                      attachmentMap[attachmentKey] = attachment.attachmentData;
                    } 
                    // else if (attachment.attachmentID) {
                    //   // Fetch the attachment data using the attachment ID
                    //   const attachmentResponse = await fetch(`/applications/documents/${attachment.attachmentID}`);
                      
                    //   if (attachmentResponse.ok) {
                    //     const attachmentData = await attachmentResponse.json();
                        
                    //     if (attachmentData.ackCode === 1 && attachmentData.jsonResult) {
                    //       attachmentMap[attachmentKey] = attachmentData.jsonResult;
                    //     }
                    //   }
                    // }
                  }
                } catch (error) {
                 }
              }
              
              setAttachments(attachmentMap);
            };
            
            // Start processing attachments
            processAttachments();
          } else {
            // Initialize with empty map if no attachments
            initializeAttachments();
          }
        } else {
          setPhotoError("Picha ya muombaji haikupatikana");
          initializeAttachments();
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            setPhotoError("Muda wa kusubiri umekwisha"); // Timeout in Swahili
          } else if (error.message.includes('503')) {
            // Service Unavailable error
            setPhotoError("Huduma hazipatikani kwa sasa. Tafadhali jaribu tena baadaye."); // Service unavailable in Swahili
            
            // Show toast notification for better visibility
            toast({
              title: "Server Error",
              description: "Huduma hazipatikani kwa sasa (503). Tafadhali jaribu tena baadaye.",
              variant: "destructive"
            });
          } else {
            setPhotoError("Imeshindikana kupakua picha"); // Failed to load photo in Swahili
          }
        } else {
          setPhotoError("Imeshindikana kupakua picha"); // Failed to load photo in Swahili
        }
        
        initializeAttachments();
      } finally {
        clearTimeout(timeoutId); // Clear timeout in finally block
        setIsLoadingPhoto(false);
        setIsLoadingAttachments(false);
        setIsLoadingApplicationData(false);
      }
    };
    
    // Call fetchData with initial retry count of 0
    fetchData(0);
  }, [applicationId, updateFormData]);
  
  // Document mapping with only real API data
  const documents: Record<DocumentType, DocumentInfo> = {
    barua_ya_mtendaji: {
      title: 'Barua ya Mtendaji',
      imagePath: attachments['barua_ya_mtendaji'] || '',
      description: 'Barua rasmi kutoka kwa mtendaji wa mtaa/kijiji inayothibitisha makazi ya muombaji.'
    },
    picha_ya_muombaji: {
      title: 'Picha ya Muombaji',
      imagePath: applicantPhoto || '',
      description: 'Picha ya hivi karibuni ya muombaji inayotumika kwenye maombi.'
    },
    ushahidi_wa_kuingia_nchini: {
      title: 'Ushahidi wa Kuingia Nchini',
      imagePath: attachments['ushahidi_wa_kuingia_nchini'] || '',
      description: 'Nakala ya muhuri wa pasipoti au stakabadhi nyingine inayothibitisha tarehe ya kuingia nchini.'
    },
    ushahidi_wa_wazazi: {
      title: 'Ushahidi wa Wazazi',
      imagePath: attachments['ushahidi_wa_wazazi'] || '',
      description: 'Cheti cha kuzaliwa au stakabadhi nyingine inayothibitisha uhusiano na wazazi.'
    }
  };
  
  // Function to open image viewer
  const openImageViewer = (documentType: DocumentType) => {
    setCurrentDocument(documents[documentType]);
    setIsImageViewerOpen(true);
  };
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<DeclarationFormValues>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      agreeTerms: formData.agreeTerms,
    },
  });
  
  // Navigation functions for edit buttons
  const navigateToBasicInfo = () => {
    // Open the personal info edit dialog instead of navigating
    setIsPersonalInfoDialogOpen(true);
  };

  const navigateToResidenceInfo = () => {
    setIsResidenceInfoDialogOpen(true);
  };

  const navigateToParentsInfo = () => {
    // Open the parents info edit dialog instead of navigating
    setIsParentsInfoDialogOpen(true);
  };

  const navigateToDependantInfo = () => {
    // Open the dependants info edit dialog instead of navigating
    setIsDependantsInfoDialogOpen(true);
  };

  const navigateToDocuments = () => {
    router.push('/application/documents');
  };

  // Use the shared utility function for processing API image data
  const getBase64ImageSrc = (photoItem: any) => {
    return processApiImageData(photoItem);
  };
  
  // Handle save and exit
  const handleSaveAndExit = () => {
    setIsExiting(true);
    try {
      // Save current form state
      updateFormData({
        agreeTerms: form.getValues().agreeTerms
      });
      
      // Show success toast
      toast({
        title: "Taarifa zimehifadhiwa",
        description: "Taarifa zako zimehifadhiwa kikamilifu",
        variant: "default"
      });
      
      // Navigate back to application start
      router.push('/');
    } catch (error) {
      toast({
        title: "Hitilafu",
        description: "Imeshindwa kuhifadhi taarifa",
        variant: "destructive"
      });
    } finally {
      setIsExiting(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (values: DeclarationFormValues) => {
    setIsLoading(true);
    
    try {
      // Check if all required information is present - do this check in parallel with navigation
      const requiredFields = [
        { field: formData.firstName, name: 'First Name' },
        { field: formData.lastName, name: 'Last Name' },
        { field: formData.dateOfBirth, name: 'Date of Birth' },
        { field: formData.gender, name: 'Gender' },
        { field: formData.mobileNumber, name: 'Mobile Number' },
        { field: formData.countryOfResidence, name: 'Country of Residence' },
        { field: formData.region, name: 'Region' },
        { field: formData.district, name: 'District' },
        { field: formData.dateOfEntry, name: 'Date of Entry' },
        { field: formData.fatherName, name: 'Father\'s Name' },
        { field: formData.motherName, name: 'Mother\'s Name' }
      ];
      
      const missingFields = requiredFields
        .filter(item => !item.field)
        .map(item => item.name);
      
      if (missingFields.length > 0) {
        // If there are missing fields, we'll handle this on the complete page
        // Store the error in context to display on the complete page
        updateFormData({
          submissionError: `Missing information: ${missingFields.join(', ')}`
        });
        // Navigate to complete page even with missing fields
        router.push('/application/complete');
        return;
      }
      
      // Submit the declaration - using async/await for better control of loading state
      try {
        const response = await fetch(`/applications/${applicationId}/declaration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Imeshindikana kuwasilisha tamko: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.ackCode === 1) {
          // Store success status in context
          updateFormData({
            submissionStatus: 'success',
            currentStep: 80, // Update to complete step
            submissionMessage: "Ombi limewasilishwa kwa mafanikio"
          });
          
          // Show success toast
          toast({
            title: "Success",
            description: "Ombi limewasilishwa kwa mafanikio",
            variant: "default"
          });
          
          // Set autoNavigateToNext to true to trigger navigation
          setAutoNavigateToNext(true);
          
          // Force navigation to complete page immediately
          router.push('/application/complete');
        } else {
          // Store error in context
          updateFormData({
            submissionStatus: 'error',
            submissionError: result.ackMessage || "Imeshindikana kuwasilisha tamko"
          });
          
          // Show error toast
          toast({
            title: "Error",
            description: result.ackMessage || "Imeshindikana kuwasilisha tamko",
            variant: "destructive"
          });
          
          // Reset loading state
          setIsLoading(false);
        }
      } catch (error) {
        updateFormData({
          submissionStatus: 'error',
          submissionError: error instanceof Error ? error.message : "Imeshindikana kuwasilisha tamko"
        });
        
        // Show error toast
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Imeshindikana kuwasilisha tamko",
          variant: "destructive"
        });
        
        // Reset loading state
        setIsLoading(false);
      }
    } catch (error) {
      updateFormData({
        submissionStatus: 'error',
        submissionError: error instanceof Error ? error.message : "Imeshindikana kuwasilisha tamko"
      });
      
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Imeshindikana kuwasilisha tamko",
        variant: "destructive"
      });
      
      // Reset loading state
      setIsLoading(false);
    }
    
    // Add a safety timeout to reset loading state and force navigation if nothing happens
    const safetyTimer = setTimeout(() => {
      // Force navigation to complete page as a last resort
      if (isLoading) {
        setIsLoading(false);
        router.push('/application/complete');
      }
    }, 2000); // Reduced to 2 seconds for faster fallback
    
    return () => clearTimeout(safetyTimer);
  };

// Helper to normalize photo string
const getPhotoSrc = (photo?: string) => {
  if (!photo) return null;

  // Already prefixed
  if (photo.startsWith("data:image")) {
    return photo;
  }

  // Clean the base64 string (remove whitespace)
  const cleanPhoto = photo.replace(/\s/g, '');

  // Detect by signature
  if (cleanPhoto.startsWith("/9j/")) return `data:image/jpeg;base64,${cleanPhoto}`;
  if (cleanPhoto.startsWith("iVBORw0KGgo")) return `data:image/png;base64,${cleanPhoto}`;

  // Fallback to jpeg
  return `data:image/jpeg;base64,${cleanPhoto}`;
};

// Simple component to test base64 image display
const SimpleBase64Image = ({ base64, alt, className }: { base64: string; alt: string; className?: string }) => {
  const src = getPhotoSrc(base64);
  
  if (!src) {
    return (
      <div className="flex items-center justify-center bg-gray-100 text-gray-500 text-xs p-2">
        No Image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
      onLoad={() => {
      }}
    />
  );
};

// Debug the current applicant photo state
if (applicantPhoto) {
  debugBase64Image(applicantPhoto, 'Current Applicant Photo State');
}


return (
      <ApplicationLayout 
        title="Tamko Rasmi" 
        // title="Declaration" 
        subtitle="Review and submit your application"
        applicationId={applicationId}
        currentStep="tamko-rasmi"
        autoNavigateToNext={autoNavigateToNext}
      >
      {/* Personal Info Edit Dialog */}
      <PersonalInfoEditDialog 
        isOpen={isPersonalInfoDialogOpen}
        onClose={() => setIsPersonalInfoDialogOpen(false)}
        applicationId={applicationId}
      />
      
      {/* Residence Info Edit Dialog */}
      <ResidenceInfoEditDialog 
        open={isResidenceInfoDialogOpen}
        onOpenChange={setIsResidenceInfoDialogOpen}
        onSuccess={() => {
          // Refresh the application data when the dialog is closed successfully
          fetchApplicationData();
        }}
      />
      
      {/* Parents Info Edit Dialog */}
      <ParentsInfoEditDialog 
        open={isParentsInfoDialogOpen}
        onOpenChange={setIsParentsInfoDialogOpen}
        onSuccess={() => {
          // Refresh the application data when the dialog is closed successfully
          fetchApplicationData();
        }}
      />
      
      {/* Dependants Info Edit Dialog */}
      <DependantsInfoEditDialog 
        open={isDependantsInfoDialogOpen}
        onOpenChange={setIsDependantsInfoDialogOpen}
        onSuccess={() => {
          // Refresh the application data when the dialog is closed successfully
          fetchApplicationData();
        }}
      />
      
      <div className="bg-slate-50 p-6 rounded mb-6 shadow-sm border border-slate-200">
        {/* <h3 className="text-lg font-medium text-slate-500 mb-4">Application Summary</h3> */}
        
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-800">Taarifa Binafsi</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToBasicInfo}
                className="border border-green-300 rounded-md px-3 py-1 flex items-center text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
              >
                <UserPen className="h-4 w-4 mr-1" />
                Hariri
              </Button>
            </div>
            
            <div className="flex">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pr-4">
                {/* First column */}
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Jina la Kwanza</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.firstName || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Jina la Kati</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.middleName || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Jina la Ukoo</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.lastName || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Jina Lingine</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.otherName || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Tarehe ya Kuzaliwa</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.dateOfBirth instanceof Date ? format(formData.dateOfBirth, "PPP") : "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Jinsia</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.gender || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Hali ya Ndoa</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.maritalStatus || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Nchi ya Kuzaliwa</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.countryOfBirth || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Mkoa wa Kuzaliwa</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.birthRegionName || formData.region || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Aina ya Kazi</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.occupationType || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Kazi</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.occupation || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Maelezo ya Kazi</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.occupationDetail || formData.employmentStatus || "—"}</p>
                </div>
                
                <div className="space-y-1 bg-slate-50 p-2 rounded">
                  <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Namba ya Simu</h4>
                  <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.mobileNumber || "—"}</p>
                </div>
              </div>
              
              {/* Applicant Photo on the right */}
              <div className="w-40 flex flex-col items-center">
                <div className="border border-blue-200 rounded-md overflow-hidden w-32 h-40 bg-slate-50 flex items-center justify-center mb-2 shadow-sm">
                  {applicantPhoto ? (
                    <div className="relative flex items-center justify-center w-full h-full">
                      <Base64Image
                        base64={applicantPhoto}
                        alt="Picha ya Muombaji"
                        width={128}
                        height={160}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <User className="h-10 w-10 text-slate-400" />
                      <span className="text-xs text-slate-400 mt-1">Hakuna picha</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600 text-center bg-gray-100 px-2 py-1 rounded-md">Picha ya Muombaji</span>
              </div>
            </div>
          </div>
          
          {/* Residence Information Section */}
          <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center">
                <Home className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-800">Taarifa za Makazi</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToResidenceInfo}
                className="border border-green-300 rounded-md px-3 py-1 flex items-center text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
              >
                <UserPen className="h-4 w-4 mr-1" />
                Hariri
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Nchi ya Makazi</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.countryOfResidence || "—"}</p>
              </div>
              
              {/* <div className="space-y-1 bg-slate-50 p-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Mkoa</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.region || "—"}</p>
              </div> */}
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Wilaya</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.district || "—"}</p>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Kata</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.ward || "—"}</p>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Mtaa</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.street || "—"}</p>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Uraia</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.nationality || "—"}</p>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Namba ya Simu</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.mobileNumber || "—"}</p>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Namba ya Nyumba</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.houseNumber || "—"}</p>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Namba ya Kiwanja</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.plotNumber || "—"}</p>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Nchi ya Asili</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.countryOfOrigin || formData.birthCountry || "—"}</p>
              </div>
              
              <div className="space-y-1 bg-slate-50 p-2 rounded">
                <h4 className="text-sm font-medium text-gray-500 font-times-new-roman">Tarehe ya Kuingia Nchini</h4>
                <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.dateOfEntry instanceof Date ? format(formData.dateOfEntry, "PPP") : "—"}</p>
              </div>
            </div>
          </div>
          
          {/* Parents Information Section */}
          <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-md font-semibold text-gray-800">Taarifa za Wazazi</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToParentsInfo}
                className="border border-green-300 rounded-md px-3 py-1 flex items-center text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
              >
                <UserPen className="h-4 w-4 mr-1" />
                Hariri
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Father's Information */}
              <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                <h4 className="text-sm font-semibold text-gray-600 border-b border-gray-200 pb-2 mb-3">Taarifa za Baba</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Jina la Baba</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.fatherName || "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Tarehe ya Kuzaliwa</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.fatherDateOfBirth instanceof Date ? format(formData.fatherDateOfBirth, "PPP") : "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Nchi ya Kuzaliwa</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.fatherCountryOfBirth || "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Mkoa wa Kuzaliwa</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.fatherRegionOfBirth || "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Uraia</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.fatherNationality || "—"}</p>
                  </div>
                </div>
              </div>
              
              {/* Mother's Information */}
              <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                <h4 className="text-sm font-semibold text-gray-600 border-b border-gray-200 pb-2 mb-3">Taarifa za Mama</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Jina la Mama</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.motherName || "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Tarehe ya Kuzaliwa</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.motherDateOfBirth instanceof Date ? format(formData.motherDateOfBirth, "PPP") : "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Nchi ya Kuzaliwa</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.motherCountryOfBirth || "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Mkoa wa Kuzaliwa</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.motherRegionOfBirth || "—"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-gray-500 font-times-new-roman">Uraia</h5>
                    <p className="text-slate-600 font-medium font-times-new-roman uppercase">{formData.motherNationality || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
            {/* Dependants Section */}
          {formData.dependants && formData.dependants.length > 0 && (
            <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-md font-semibold text-gray-800">Taarifa za Wategemezi</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={navigateToDependantInfo}
                  className="border border-green-300 rounded-md px-3 py-1 flex items-center text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                >
                  <UserPen className="h-4 w-4 mr-1" />
                  Hariri
                </Button>
              </div>
              
              <div className="overflow-x-auto bg-slate-50 p-3 rounded-md border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-xs font-medium text-gray-600 border-b border-gray-200">Jina</th>
                      <th className="text-left p-2 text-xs font-medium text-gray-600 border-b border-gray-200">Mahusiano</th>
                      <th className="text-left p-2 text-xs font-medium text-gray-600 border-b border-gray-200">Namba ya Hati</th>
                      <th className="text-left p-2 text-xs font-medium text-gray-600 border-b border-gray-200">Tarehe ya Kutolewa</th>
                      <th className="text-left p-2 text-xs font-medium text-gray-600 border-b border-gray-200">Tarehe Kuisha</th>
                      <th className="text-left p-2 text-xs font-medium text-gray-600 border-b border-gray-200">Taifa</th>
                    </tr>
                  </thead> 
                  <tbody>
                    {formData.dependants.map((dependant, index) => (
                      <tr key={`dependant-${index}-${dependant.name || dependant.passportNumber || index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="p-2 text-sm font-medium text-slate-500 border-b border-slate-100 font-times-new-roman uppercase">{dependant.name || "—"}</td>
                        <td className="p-2 text-sm font-medium text-slate-500 border-b border-slate-100 font-times-new-roman uppercase">{dependant.relationship || "—"}</td>
                        <td className="p-2 text-sm font-medium text-slate-500 border-b border-slate-100 font-times-new-roman uppercase">{dependant.passportNumber || "—"}</td>
                        <td className="p-2 text-sm font-medium text-slate-500 border-b border-slate-100 font-times-new-roman uppercase">
                          {dependant.passportIssuedDate ? format(new Date(dependant.passportIssuedDate), "PPP") : "—"}
                        </td>
                        <td className="p-2 text-sm font-medium text-slate-500 border-b border-slate-100 font-times-new-roman uppercase">
                          {dependant.passportExpiryDate ? format(new Date(dependant.passportExpiryDate), "PPP") : "—"}
                        </td>
                        <td className="p-2 text-sm font-medium text-slate-500 border-b border-slate-100 font-times-new-roman uppercase">{dependant.nationality || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6 shadow-sm hover:shadow transition-shadow duration-200">
        <h3 className="text-amber-800 font-medium mb-2">Tangazo Muhimu</h3>
        <p className="text-amber-700 text-sm">
        Kwa kuwasilisha ombi hili, unathibitisha kuwa taarifa zote ulizotoa ni za kweli na sahihi kwa kadri unavyofahamu.
        Kutoa taarifa za uongo kunaweza kusababisha ombi lako kukataliwa na pia matokeo ya kisheria.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-3">
              <FormField
                control={form.control}
                name="agreeTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InteractiveCheckbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        label="Tamko na Idhini"
                        description="Ninathibitisha hapa kuwa taarifa zote zilizotolewa katika ombi hili ni za kweli na sahihi kadri ninavyofahamu. Ninaelewa kuwa taarifa za uongo au kutokutoa baadhi ya taarifa kwa makusudi kunaweza kusababisha ombi langu kukataliwa au kufutwa baadaye kwa pasipoti yangu."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {form.formState.errors.agreeTerms && (
              <p className="text-sm font-medium text-red-500 mt-2 bg-red-50 p-2 rounded-md border border-red-100">
                {form.formState.errors.agreeTerms.message}
              </p>
            )}
          </div>
          
    <div className="flex justify-between">
      <LoadingButton 
        type="button" 
        onClick={handleSaveAndExit}
        isLoading={isExiting}
        loadingText="Inahifadhi..."
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-2 rounded flex items-center"
      >
        <Save className="mr-2 h-4 w-4" />
        Hifadhi na Toka
      </LoadingButton>
      
      <LoadingButton 
        type="submit" 
        isLoading={isLoading}
        loadingText="Inawasilisha Maombi..."
        className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded flex items-center min-w-[180px] justify-center"
        disabled={!form.formState.isValid || isLoading}
        extendedSpinTime={false} // Disable extended spin time to allow faster navigation
        title="Click to submit your application"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Wasilisha Ombi
      </LoadingButton> 
    </div>
  </form>
</Form>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentDocument?.title || 'Picha'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {currentDocument?.imagePath ? (
              <Base64Image
                base64={currentDocument.imagePath}
                alt={currentDocument.title}
                width={400}
                height={500}
                className="max-w-full max-h-[70vh] object-contain rounded-md"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 w-full bg-slate-100 rounded-md">
                <span className="text-slate-400">Hakuna picha</span>
              </div>
            )}
            {currentDocument?.description && (
              <p className="mt-4 text-sm text-gray-600">{currentDocument.description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ApplicationLayout>
);
}
