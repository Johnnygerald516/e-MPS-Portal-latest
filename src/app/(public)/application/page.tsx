"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useApplication } from "@/contexts/application-context";
import MigrantVerificationDialog from "@/components/application/migrant-verification-dialog";
import PassportRenewalDialog from "@/components/application/passport-renewal-dialog";
import { verificationEndpoints } from "@/lib/api/endpoints/verification";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApplicationType {
  ApplicationTypeID: number;
  ApplicationTypeNameSwahili: string;
}

export default function ApplicationPage() {
  const router = useRouter();
  const { showError, showSuccess, clearApplicationData } = useApplication();
  
  // Use a ref to track if initialization has been done
  const initializedRef = useRef(false);
  
  // Clear application data only once when the page loads
  useEffect(() => {
    // Only run once on mount
    if (!initializedRef.current) {
      clearApplicationData();
      initializedRef.current = true;
    }
  }, []);
  const [formData, setFormData] = useState({
    applicationType: "",
    applicationTypeId: 0,
    renewalReason: "",
    phoneNumber: "",
    officeLocation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  
  // State for application types and renewal reasons
  const [applicationTypes, setApplicationTypes] = useState<ApplicationType[]>([]);
  const [renewalReasons, setRenewalReasons] = useState<ApplicationType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(false);
  
  // Fetch application types on component mount
  useEffect(() => {
    const fetchApplicationTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const response = await verificationEndpoints.fetchApplicationTypes(1); // Default parent type ID is 1
        if (response.ackCode === 1 && response.jsonResult) {
          setApplicationTypes(response.jsonResult);
        } else {
          showError("Failed to load application types");
        }
      } catch (error) {
        console.error("Error fetching application types:", error);
        showError("Failed to load application types. Please try again later.");
      } finally {
        setIsLoadingTypes(false);
      }
    };
    
    fetchApplicationTypes();
  }, [showError]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleApplicationTypeChange = async (value: string) => {
    // Find the selected application type
    const selectedType = applicationTypes.find(type => type.ApplicationTypeNameSwahili === value);
    const typeId = selectedType ? selectedType.ApplicationTypeID : 0;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      applicationType: value,
      applicationTypeId: typeId,
      // Reset renewal reason when application type changes
      renewalReason: ""
    }));
    
    // If Kuhuisha (ID 2) is selected, fetch renewal reasons
    if (typeId === 2) {
      setIsLoadingReasons(true);
      try {
        const response = await verificationEndpoints.fetchApplicationTypes(2);
        if (response.ackCode === 1 && response.jsonResult) {
          setRenewalReasons(response.jsonResult);
        } else {
          showError("Failed to load renewal reasons");
        }
      } catch (error) {
        console.error("Error fetching renewal reasons:", error);
        showError("Failed to load renewal reasons. Please try again later.");
      } finally {
        setIsLoadingReasons(false);
      }
    }
  };
  
  const handleRenewalReasonChange = (value: string) => {
    // Find the selected renewal reason
    const selectedReason = renewalReasons.find(reason => reason.ApplicationTypeNameSwahili === value);
    const reasonId = selectedReason ? selectedReason.ApplicationTypeID : 0;
    
    setFormData(prev => ({
      ...prev,
      renewalReason: value,
      applicationTypeId: reasonId
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      if (!formData.applicationType || formData.applicationTypeId === 0) {
        throw new Error("Tafadhali chagua aina ya ombi");
      }
      
      if (formData.applicationTypeId === 2 && !formData.renewalReason) {
        throw new Error("Tafadhali chagua sababu ya kuhuisha");
      }
      
      // Simulate API call
      setTimeout(() => {
        console.log('Form data being submitted:', formData);
        
        // Open appropriate dialog based on application type ID
        if (formData.applicationTypeId === 1) {
          // For new applications (ID 1), open migrant verification dialog
          setIsVerificationDialogOpen(true);
          showSuccess("Tafadhali thibitisha utambulisho wako ili kuendelea");
        } else if (formData.applicationTypeId === 2) {
          // This should never happen as we now use the renewal reason's ID directly
          showError("Tafadhali chagua sababu ya kuhuisha");
          setIsSubmitting(false);
        } else if ([3, 4, 5].includes(formData.applicationTypeId)) {
          // For renewal applications (IDs 3, 4, 5), open passport renewal dialog
          setIsRenewalDialogOpen(true);
          showSuccess("Tafadhali toa maelezo ya kibali chako");
        } else {
          showError("Aina ya ombi haijulikani");
          setIsSubmitting(false);
        }
        
        setIsSubmitting(false);
      }, 1000);
    } catch (error: any) {
      showError(error.message);
      setIsSubmitting(false);
    }
  };

  const handleVerificationComplete = (verifiedApplicationId: string) => {
    console.log('Verification complete with application ID:', verifiedApplicationId);
    setApplicationId(verifiedApplicationId);
    // Navigate to basic info page without including applicationId in URL
    showSuccess("Uthibitisho umefanikiwa! Inaendelea na hatua inayofuata.");
    
    // Ensure we have a valid application ID before navigating
    if (verifiedApplicationId) {
      // Store the applicationId in context via the MigrantVerificationDialog
      // and navigate without including it in the URL
      router.push('/application/basic-info');
    } else {
      showError("Kuna tatizo katika kupata namba ya utambulisho. Tafadhali jaribu tena.");
    }
  };
  
  const handleRenewalComplete = (verifiedApplicationId: string) => {
    console.log('Renewal verification complete with application ID:', verifiedApplicationId);
    setApplicationId(verifiedApplicationId);
    // Navigate to declaration page without including applicationId in URL
    showSuccess("Uthibitisho wa kibali umefanikiwa! Inaendelea na hatua inayofuata.");
    
    // Ensure we have a valid application ID before navigating
    if (verifiedApplicationId) {
      // Store the applicationId in context via the PassportRenewalDialog
      // and navigate without including it in the URL
      router.push('/application/declaration');
    } else {
      showError("Kuna tatizo katika kupata namba ya utambulisho. Tafadhali jaribu tena.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 border border-slate-200 rounded mt-2 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="md:pr-6">
          <h1 className="text-xl font-bold text-slate-500 mb-4 border-b border-slate-200 pb-2">Kibali cha walowezi</h1>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Wakati wa ujazaji wa fomu ya maombi ya kibali cha walowezi, Mwombaji anatakiwa kujaza taarifa zake kwa usahihi na ukamilifu, na mara atakapomilisha atapatiwa Namba ya Utambulisho (Application ID) pamoja na kupakua fomu yenye taarifa za ombi lake.
          </p>
        </div>

        {/* Right column - Form */}
        <div>
          <h2 className="text-lg font-bold text-slate-500 mb-6 border-b border-slate-200 pb-1">Taarifa za Msingi</h2>
           
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Aina ya Ombi <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.applicationType}
                onValueChange={handleApplicationTypeChange}
                disabled={isLoadingTypes}
              >
                <SelectTrigger className="w-full border border-gray-300 rounded p-2.5 text-sm">
                  <SelectValue placeholder="Chagua Aina ya Ombi" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTypes ? (
                    <SelectItem value="loading" disabled>
                      Inapakia...
                    </SelectItem>
                  ) : (
                    applicationTypes.map((type) => (
                      <SelectItem key={type.ApplicationTypeID} value={type.ApplicationTypeNameSwahili}>
                        {type.ApplicationTypeNameSwahili}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Renewal Reason - Only shown when applicationType is renewal */}
            {formData.applicationTypeId === 2 && (
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Sababu ya Kuhuisha <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.renewalReason}
                  onValueChange={handleRenewalReasonChange}
                  disabled={isLoadingReasons}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-md p-2.5 text-sm">
                    <SelectValue placeholder="Chagua Sababu ya Kuhuisha" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingReasons ? (
                      <SelectItem value="loading" disabled>
                        Inapakia...
                      </SelectItem>
                    ) : (
                      renewalReasons.map((reason) => (
                        <SelectItem key={reason.ApplicationTypeID} value={reason.ApplicationTypeNameSwahili}>
                          {reason.ApplicationTypeNameSwahili}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
           <div className="flex justify-end border-t border-slate-200">
  <LoadingButton
    type="submit"
    isLoading={isSubmitting}
    loadingText="Inawasilisha..."
    spinnerVariant="primary"
    className="w-fit bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-5 rounded mt-6 flex items-center"
  >
    Anza Ombi
    <ArrowRight className="ml-2 h-4 w-4" />
  </LoadingButton>
</div>

          </form>
        </div>
      </div>

      {/* Migrant Verification Dialog */}
      <MigrantVerificationDialog
        isOpen={isVerificationDialogOpen}
        onClose={() => setIsVerificationDialogOpen(false)}
        onVerificationComplete={handleVerificationComplete}
        applicationTypeId={formData.applicationTypeId}
      />

      {/* Passport Renewal Dialog */}
      <PassportRenewalDialog
        isOpen={isRenewalDialogOpen}
        onClose={() => setIsRenewalDialogOpen(false)}
        onVerificationComplete={handleRenewalComplete}
        renewalReason={formData.renewalReason}
        applicationTypeId={formData.applicationTypeId}
      />
    </div>
  );
}
