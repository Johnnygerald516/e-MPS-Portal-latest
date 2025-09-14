"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle, Loader2, Edit2, User, Home, Users, FileText, Upload, Calendar, Globe, Save, Eye, X } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InteractiveCheckbox } from "@/components/ui/interactive-checkbox";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useApplication } from "@/contexts/application-context";
import { useRouter, useSearchParams } from "next/navigation";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

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
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId') || '';
  const [autoNavigateToNext, setAutoNavigateToNext] = useState(false);
  
  // State for image viewer dialog
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<DocumentInfo | null>(null);
  
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
        console.warn("No application ID provided, cannot fetch application data");
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
        
        console.log(`Fetching application data (attempt ${retry + 1}/${MAX_RETRIES + 1})`);
        const response = await fetch(`/api/applications/${applicationId}`, {
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
            // Service unavailable - retry after a delay
            console.log(`Service unavailable (503), retrying in ${(retry + 1) * 2000}ms...`);
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
          
          // Debug logging to verify API response structure
          console.log("API Response structure:", {
            hasApplicationDetails: !!data.jsonResult.ApplicationDetails,
            hasApplicantPhoto: !!data.jsonResult.applicantPhoto,
            hasApplicationAttachment: !!data.jsonResult.applicationAttachment,
            hasApplicationDependants: !!data.jsonResult.applicationdependants,
            applicationDetailsCount: data.jsonResult.ApplicationDetails?.length || 0,
            applicantPhotoCount: data.jsonResult.applicantPhoto?.length || 0,
            attachmentCount: data.jsonResult.applicationAttachment?.length || 0,
            dependantsCount: data.jsonResult.applicationdependants?.length || 0
          });
          
          // Extract application details from the response
          const applicationDetails = data.jsonResult.ApplicationDetails && 
            data.jsonResult.ApplicationDetails.length > 0 ? 
            data.jsonResult.ApplicationDetails[0] : null;
          
          if (applicationDetails) {
            console.log("Updating form data with application details:", applicationDetails);
            
            // Update formData with the application details
            updateFormData({
              firstName: applicationDetails.firstName || "",
              middleName: applicationDetails.middleName || "",
              lastName: applicationDetails.lastName || "",
              otherName: applicationDetails.otherName || "",
              dateOfBirth: applicationDetails.dateOfBirth ? new Date(applicationDetails.dateOfBirth) : undefined,
              gender: applicationDetails.gender || "",
              maritalStatus: applicationDetails.maritalStatus || "",
              occupationType: applicationDetails.occupationType || "",
              employmentStatus: applicationDetails.occupationDetail || "",
              mobileNumber: applicationDetails.mobileNumber || "",
              countryOfResidence: applicationDetails.countryOfResidence || "",
              region: applicationDetails.regionOfBirth || "",
              district: applicationDetails.districtOfResidence || "",
              street: applicationDetails.streetOfResidence || "",
              dateOfEntry: applicationDetails.dateOfEntryTanzania ? new Date(applicationDetails.dateOfEntryTanzania) : undefined,
              fatherName: applicationDetails.fatherFullName || "",
              fatherDateOfBirth: applicationDetails.fatherDateOfBirth ? new Date(applicationDetails.fatherDateOfBirth) : undefined,
              fatherCountryOfBirth: applicationDetails.fatherCountryOfBirth || "",
              fatherRegionOfBirth: applicationDetails.fatherRegionOfBirth || "",
              motherName: applicationDetails.motherFullName || "",
              motherDateOfBirth: applicationDetails.motherDateOfBirth ? new Date(applicationDetails.motherDateOfBirth) : undefined,
              motherCountryOfBirth: applicationDetails.motherCountryOfBirth || "",
              motherRegionOfBirth: applicationDetails.motherRegionOfBirth || "",
              // Add dependants if available - based on the API response sample
              dependants: data.jsonResult.applicationdependants ? 
                data.jsonResult.applicationdependants.filter((dep: DependantData) => dep.dependantFullName).map((dep: DependantData) => ({
                  name: dep.dependantFullName || "",
                  relationship: dep.dependantRelationType?.toString() || "",
                  gender: dep.dependantGender || "",
                  nationality: dep.dependantNationality?.toString() || "",
                  passportNumber: dep.documentNumber || "",
                  passportExpiryDate: dep.expireDate ? new Date(dep.expireDate) : undefined,
                  dateOfBirth: dep.issueDate ? new Date(dep.issueDate) : undefined
                })) : []
            });
          }
          
          // Handle applicant photo - attachmentType contains base64 data for 'picha ya muombaji'
          if (Array.isArray(data.jsonResult.applicantPhoto) && data.jsonResult.applicantPhoto.length > 0) {
            const rawPhotoItem = data.jsonResult.applicantPhoto[0]; // ✅ get the first item
            const photoSrc = getBase64ImageSrc(rawPhotoItem);       // ✅ pass single object
            console.log("Applicant photo src:", photoSrc);
          
            if (photoSrc) {
              setApplicantPhoto(photoSrc);
              setPhotoError(null);
            } else {
              setPhotoError("Picha ya muombaji haikupatikana");
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
                    } else if (attachment.attachmentID) {
                      // Fetch the attachment data using the attachment ID
                      const attachmentResponse = await fetch(`/api/applications/documents/${attachment.attachmentID}`);
                      
                      if (attachmentResponse.ok) {
                        const attachmentData = await attachmentResponse.json();
                        
                        if (attachmentData.ackCode === 1 && attachmentData.jsonResult) {
                          attachmentMap[attachmentKey] = attachmentData.jsonResult;
                        }
                      }
                    }
                  }
                } catch (error) {
                  console.error(`Error processing attachment ${attachment.attachmentID}:`, error);
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
          console.warn("No application data found in the response");
          setPhotoError("Picha ya muombaji haikupatikana");
          initializeAttachments();
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
        
        // Handle specific error messages
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
    router.push(`/application/basic-info?applicationId=${applicationId}`);
  };

  const navigateToResidenceInfo = () => {
    router.push(`/application/residence-info?applicationId=${applicationId}`);
  };

  const navigateToParentsInfo = () => {
    router.push(`/application/parents-info?applicationId=${applicationId}`);
  };

  const navigateToDependantInfo = () => {
    router.push(`/application/dependant-info?applicationId=${applicationId}`);
  };

  const navigateToDocuments = () => {
    router.push(`/application/documents?applicationId=${applicationId}`);
  };

  const getBase64ImageSrc = (photoItem: any) => {
    if (!photoItem) return null;
  
    const base64 = photoItem.attachmentType;
    if (!base64) return null;
  
    if (base64.startsWith("data:")) return base64;
  
    if (base64.startsWith("/9j/")) return `data:image/jpeg;base64,${base64}`;
    if (base64.startsWith("iVBORw0KGgo")) return `data:image/png;base64,${base64}`;
  
    return `data:image/jpeg;base64,${base64}`;
  };
  


  // Handle save and exit
  const handleSaveAndExit = () => {
    // Save current form state
    updateFormData({
      agreeTerms: form.getValues().agreeTerms
    });
    
    // Navigate back to application start
    router.push('/application');
  };
  
  // Handle form submission
  const onSubmit = async (data: DeclarationFormValues) => {
    setIsLoading(true);
    
    // Update form data
    updateFormData(data);
    
    try {
      // Check if all required information is present
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
        toast({
          title: "Missing Information",
          description: `Please complete the following information: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Submit the declaration - only passing applicationId in the URL, no payload
      const response = await fetch(`/api/applications/${applicationId}/declaration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit declaration: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.ackCode === 1) {
        // Show success toast
        toast({
          title: "Success",
          description: "Application submitted successfully",
          variant: "default"
        });
        
        // Set autoNavigateToNext to true to trigger automatic navigation
        setIsLoading(false);
        setAutoNavigateToNext(true);
      } else {
        toast({
          title: "Error",
          description: result.ackMessage || "Failed to submit declaration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit declaration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

   useEffect(() => {
setTimeout(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) throw new Error(`${response.status}`);
      const data = await response.json();
      
      // Handle applicantPhoto array structure from real API
      if (data.ackCode === 1 && data.jsonResult?.applicantPhoto && Array.isArray(data.jsonResult.applicantPhoto) && data.jsonResult.applicantPhoto.length > 0) {
        const photoItem = data.jsonResult.applicantPhoto[0];
        
        // Check if it has attachmentType with base64 data
        if (photoItem.attachmentType && typeof photoItem.attachmentType === "string") {
          setApplicantPhoto(getPhotoSrc(photoItem.attachmentType)); // normalize once
        } else {
          setPhotoError("Picha ya muombaji haikupatikana");
        }
      } else {
        setPhotoError("Picha ya muombaji haikupatikana");
      }
    } catch (error) {
      setPhotoError("Imeshindikana kupakua picha");
    } finally {
      setIsLoadingPhoto(false);
    }
  };
  fetchData();
}, 500);
}, []);




// Helper to normalize photo string
const getPhotoSrc = (photo?: string) => {
  if (!photo) return null;

  // Already prefixed
  if (photo.startsWith("data:image")) {
    return photo;
  }

  // Detect by signature
  if (photo.startsWith("/9j/")) return `data:image/jpeg;base64,${photo}`;
  if (photo.startsWith("iVBORw0KGgo")) return `data:image/png;base64,${photo}`;

  // Fallback to jpeg
  return `data:image/jpeg;base64,${photo}`;
};

console.log(applicantPhoto)
return (
    <ApplicationLayout 
      title="Declaration" 
      subtitle="Review and submit your application"
      applicationId={applicationId}
      currentStep="tamko-rasmi"
      autoNavigateToNext={autoNavigateToNext}
    >
      
      <div className="bg-slate-50 p-6 rounded mb-6 shadow-sm border border-slate-200">
        {/* <h3 className="text-lg font-medium text-slate-800 mb-4">Application Summary</h3> */}
        
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-md font-medium text-slate-800">Taarifa za Msingi</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToBasicInfo}
                className="border border-green-300 rounded px-3 py-1 flex items-center text-green-600 hover:text-green-800 hover:bg-green-50"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Hariri
              </Button>
            </div>
            
            <div className="flex">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Jina la Kwanza</h4>
                  <p className="text-slate-800 uppercase">{formData.firstName}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Jina la Kati</h4>
                  <p className="text-slate-800 uppercase">{formData.middleName}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Jina la Ukoo</h4>
                  <p className="text-slate-800 uppercase">{formData.lastName}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Jina Lingine</h4>
                  <p className="text-slate-800 uppercase">{formData.otherName}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Tarehe ya Kuzaliwa</h4>
                  <p className="text-slate-800 uppercase">{formData.dateOfBirth instanceof Date ? format(formData.dateOfBirth, "PPP") : "Haijajazwa"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Hali ya Ndoa</h4>
                  <p className="text-slate-800 uppercase">{formData.maritalStatus}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Aina ya Kazi</h4>
                  <p className="text-slate-800 uppercase">{formData.occupationType}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Hali ya Kazi</h4>
                  <p className="text-slate-800 uppercase">{formData.employmentStatus}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-600">Namba ya Simu</h4>
                  <p className="text-slate-800 uppercase">{formData.mobileNumber}</p>
                </div>
              </div>
              
              {/* Applicant Photo on the right */}
              <div className="w-40 flex flex-col items-center">
                <div className="border border-slate-300 rounded-md overflow-hidden w-32 h-40 bg-slate-50 flex items-center justify-center mb-2">
                 
                  {
                  // isLoadingPhoto ? (
                  //   <div className="flex items-center justify-center h-full w-full">
                  //     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  //   </div>
                  // ) : 
                  applicantPhoto ? (
                    <img
                    // src={getPhotoSrc(applicantPhoto) || ""}
                    src={applicantPhoto}
                    alt="Picha ya Muombaji"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      setPhotoError("Imeshindikana kupakua picha");
                      if (e.currentTarget) e.currentTarget.style.display = "none";
                    }}
                  />
                  
                   ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <User className="h-10 w-10 text-slate-400" />
                      <span className="text-xs text-slate-400 mt-1">Hakuna picha</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500 text-center">Picha ya Muombaji</span>
              
              </div>
            </div>
          </div>
          
          {/* Residence Information Section */}
          <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center">
                <Home className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-md font-medium text-slate-800">Taarifa za Makazi</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToResidenceInfo}
                className="border border-green-300 rounded px-3 py-1 flex items-center text-green-600 hover:text-green-800 hover:bg-green-50"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Hariri
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-slate-600">Nchi ya Makazi</h4>
                <p className="text-slate-800 uppercase">{formData.countryOfResidence}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-600">Mkoa</h4>
                <p className="text-slate-800 uppercase">{formData.region}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-600">Wilaya</h4>
                <p className="text-slate-800 uppercase">{formData.district}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-600">Mtaa</h4>
                <p className="text-slate-800 uppercase">{formData.street}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-600">Anwani ya Kudumu</h4>
                <p className="text-slate-800 uppercase">{formData.permanentAddressOrigin || "Sawa na anwani ya sasa"}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-600">Tarehe ya Kuingia Nchini</h4>
                <p className="text-slate-800 uppercase">{formData.dateOfEntry instanceof Date ? format(formData.dateOfEntry, "PPP") : "Haijajazwa"}</p>
              </div>
            </div>
          </div>
          
          {/* Parents Information Section */}
          <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-md font-medium text-slate-800">Taarifa za Wazazi</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToParentsInfo}
                className="border border-green-300 rounded px-3 py-1 flex items-center text-green-600 hover:text-green-800 hover:bg-green-50"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Hariri
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father's Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700 border-b pb-1">Taarifa za Baba</h4>
                
                <div>
                  <h5 className="text-xs font-medium text-slate-600 uppercase">Jina la Baba</h5>
                  <p className="text-slate-800 uppercase">{formData.fatherName}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-slate-600">Tarehe ya Kuzaliwa</h5>
                  <p className="text-slate-800 uppercase">{formData.fatherDateOfBirth instanceof Date ? format(formData.fatherDateOfBirth, "PPP") : "Haijajazwa"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-slate-600">Nchi ya Kuzaliwa</h5>
                  <p className="text-slate-800 uppercase">{formData.fatherCountryOfBirth}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-slate-600">Mkoa wa Kuzaliwa</h5>
                  <p className="text-slate-800 uppercase">{formData.fatherRegionOfBirth}</p>
                </div>
              </div>
              
              {/* Mother's Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-700 border-b pb-1">Taarifa za Mama</h4>
                
                <div>
                  <h5 className="text-xs font-medium text-slate-600">Jina la Mama</h5>
                  <p className="text-slate-800 uppercase">{formData.motherName}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-slate-600">Tarehe ya Kuzaliwa</h5>
                  <p className="text-slate-800 uppercase">{formData.motherDateOfBirth instanceof Date ? format(formData.motherDateOfBirth, "PPP") : "Haijajazwa"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-slate-600">Nchi ya Kuzaliwa</h5>
                  <p className="text-slate-800 uppercase">{formData.motherCountryOfBirth}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-slate-600">Mkoa wa Kuzaliwa</h5>
                  <p className="text-slate-800 uppercase">{formData.motherRegionOfBirth}</p>
                </div>
              </div>
            </div>
          </div>
            {/* Dependants Section */}
          {formData.dependants && formData.dependants.length > 0 && (
            <div className="border border-slate-200 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-md font-medium text-slate-800">Taarifa za Wategemezi</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={navigateToDependantInfo}
                  className="border border-green-300 rounded px-3 py-1 flex items-center text-green-600 hover:text-green-800 hover:bg-green-50"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Hariri
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-2 text-xs font-medium text-slate-600 border-b border-slate-200">Jina</th>
                      <th className="text-left p-2 text-xs font-medium text-slate-600 border-b border-slate-200">Mahusiano</th>
                      <th className="text-left p-2 text-xs font-medium text-slate-600 border-b border-slate-200">Tarehe ya Kuzaliwa</th>
                      <th className="text-left p-2 text-xs font-medium text-slate-600 border-b border-slate-200">Namba ya Hati</th>
                      <th className="text-left p-2 text-xs font-medium text-slate-600 border-b border-slate-200">Tarehe Kuisha</th>
                      <th className="text-left p-2 text-xs font-medium text-slate-600 border-b border-slate-200">Taifa</th>
                    </tr>
                  </thead> 
                  <tbody>
                    {formData.dependants.map((dependant, index) => (
                      <tr key={`dependant-${index}-${dependant.name || dependant.passportNumber || index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="p-2 text-sm text-slate-800 border-b border-slate-100 uppercase">{dependant.name}</td>
                        <td className="p-2 text-sm text-slate-800 border-b border-slate-100 uppercase">{dependant.relationship}</td>
                        <td className="p-2 text-sm text-slate-800 border-b border-slate-100 uppercase">
                          {dependant.dateOfBirth instanceof Date ? format(dependant.dateOfBirth, "PPP") : "Haijajazwa"}
                        </td>
                        <td className="p-2 text-sm text-slate-800 border-b border-slate-100 uppercase">{dependant.passportNumber}</td>
                        <td className="p-2 text-sm text-slate-800 border-b border-slate-100 uppercase">
                          {dependant.passportExpiryDate instanceof Date ? format(dependant.passportExpiryDate, "PPP") : "Haijajazwa"}
                        </td>
                        <td className="p-2 text-sm text-slate-800 border-b border-slate-100 uppercase">{dependant.nationality}</td>
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
        <h3 className="text-amber-800 font-medium mb-2">Important Notice</h3>
        <p className="text-amber-700 text-sm">
          By submitting this application, you declare that all information provided is true and accurate to the best of your knowledge.
          Providing false information may result in the rejection of your application and possible legal consequences.
        </p>
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
                        label="Declaration and Consent"
                        description="I hereby declare that the information provided in this application is true and correct to the best of my knowledge. I understand that any false statements or deliberate omissions may result in the rejection of my application or subsequent cancellation of my passport."
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
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleSaveAndExit}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-2 rounded flex items-center"
      >
        <Save className="h-4 w-4 mr-2" />
        Save and Exit
      </Button>
            
      <LoadingButton 
        type="submit" 
        isLoading={isLoading}
        loadingText="Inaendelea..."
        disabled={!form.formState.isValid}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Submit Application
      </LoadingButton>
    </div>
  </form>
</Form>

</ApplicationLayout>
);
}
