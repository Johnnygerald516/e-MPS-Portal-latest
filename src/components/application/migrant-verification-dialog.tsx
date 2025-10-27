import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Loader2, CheckCircle, User, ArrowRight } from "lucide-react";
import { verificationEndpoints } from "@/lib/api";
import { useApplication } from "@/contexts/application-context";
import { formatDateForApi, formatDateForDisplay, parseDateString } from "@/lib/utils/date-utils";
// Session management removed
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface MigrantVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (applicationId: string) => void;
  applicationTypeId: number;
}

export default function MigrantVerificationDialog({
  isOpen,
  onClose,
  onVerificationComplete,
  applicationTypeId
}: MigrantVerificationDialogProps) {
  const { updateFormData } = useApplication();
  const [subjectId, setSubjectId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{subjectId?: string; dateOfBirth?: string; phoneNumber?: string}>({});
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  
  // Using the imported formatDateForApi function from date-utils.ts

  const handleSearch = async () => {
    // Reset errors
    setError("");
    setFieldErrors({});
    
    // Validate inputs
    let hasErrors = false;
    const errors: {subjectId?: string; dateOfBirth?: string; phoneNumber?: string} = {};
    
    // Phone number is always required
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Namba ya simu inahitajika";
      hasErrors = true;
    }
    
    // At least one of subjectId or dateOfBirth must be provided
    if (!subjectId.trim() && !dateOfBirth.trim()) {
      setError("Tafadhali ingiza angalau moja kati ya namba ya kitambulisho au tarehe ya kuzaliwa");
      return;
    }
    
    if (subjectId.trim() && subjectId.length < 4) {
      errors.subjectId = "Nambari ya mhusika inapaswa kuwa na angalau herufi 4";
      hasErrors = true;
    }
    
    if (dateOfBirth.trim()) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        errors.dateOfBirth = "Tarehe ya kuzaliwa haiwezi kuwa ya baadaye";
        hasErrors = true;
      }
    }
    
    // Validate phone number format if it's not empty
    if (phoneNumber.trim() && !/^0[0-9]{9}$/.test(phoneNumber)) {
      errors.phoneNumber = "Namba ya simu inapaswa kuanza na 0 na iwe na tarakimu 10";
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }
    
    setIsSearching(true);
    setError("");

    try {
      // Disable inputs during search
      document.getElementById("subjectId")?.setAttribute("disabled", "true");
      document.getElementById("dateOfBirth")?.setAttribute("disabled", "true");
      document.getElementById("phoneNumber")?.setAttribute("disabled", "true");
      
      // Show first loading stage
      setError("Inathibitisha taarifa...");
      
      // Format the date of birth for API
      const formattedDateOfBirth = dateOfBirth.trim() ? formatDateForApi(dateOfBirth.trim()) : "";
      
      // Prepare payload for API
      const payload = {
        subjectId: subjectId.trim(),
        dateOfBirth: formattedDateOfBirth,
        phoneNumber: phoneNumber.trim(),
        applicationTypeId: applicationTypeId
      };
      
      const response = await verificationEndpoints.verifyRegistration(payload);
      if (response && response.ackCode === 1) {
        setVerificationSuccess(true);
        // Use the correct property name (applicationID instead of applicationId)
        const appId = response.jsonResult?.applicationID || response.applicationId || '';
        setApplicationId(appId);
        
        // Session management removed
        
        // Format the date of birth for API and storage using our utility function
        const formattedDateOfBirth = dateOfBirth ? formatDateForApi(dateOfBirth) : "";
        const displayDateOfBirth = dateOfBirth ? formatDateForDisplay(dateOfBirth) : "";
        
        // Create a Date object from the formatted date for proper handling
        let dateOfBirthObject = undefined;
        try {
          if (formattedDateOfBirth) {
            dateOfBirthObject = parseDateString(formattedDateOfBirth);
          }
        } catch (e) {
        }
        
      updateFormData({
          applicationId: appId,
          // Save application type
          applicationType: applicationTypeId === 1 ? "new" : "renew",
          // Store phone number from verification
          mobileNumber: response.jsonResult?.phoneNo || phoneNumber || "",
          phoneNumber: response.jsonResult?.phoneNo || phoneNumber || "",
          // Store date of birth in multiple formats to ensure compatibility
          dateOfBirth: dateOfBirthObject || formattedDateOfBirth,
          formattedDateOfBirth: formattedDateOfBirth,
          displayDateOfBirth: displayDateOfBirth,
          currentStep: 20 // Set to basic-info step
        });
        
        // Also store these values in localStorage for backup
        try {
          if (phoneNumber) {
            localStorage.setItem('verification_phone', phoneNumber);
          }
          if (dateOfBirth) {
            // Store date in multiple formats to ensure compatibility across components
            localStorage.setItem('verification_dob_raw', dateOfBirth);
            localStorage.setItem('verification_dob', formattedDateOfBirth);
            localStorage.setItem('verification_dob_formatted', formattedDateOfBirth);
            localStorage.setItem('verification_dob_display', displayDateOfBirth);
            
            // Store as JSON string with all formats for easier retrieval
            const dateFormats = JSON.stringify({
              raw: dateOfBirth,
              formatted: formattedDateOfBirth,
              display: displayDateOfBirth
            });
            localStorage.setItem('verification_dob_all', dateFormats);
          }
        } catch (e) {
        }
      } else {
        setError(`Uthibitisho umeshindikana: ${response.ackMessage}`);
      }
    } catch (error: any) {
       if (error.response) {
      setError(`Uthibitisho umeshindikana: ${error.response.data?.ackMessage || 'Imeshindikana kuthibitisha taarifa zako'} (${error.response.status})`);
      } else if (error.request) {
        setError('Imeshindikana kuwasiliana na seva. Tafadhali jaribu tena baadaye.');
      } else {
        setError(`Uthibitisho umeshindikana: ${error.message || 'Kuna tatizo limetokea'}`);
      }
    } finally {
      setIsSearching(false);
      document.getElementById("subjectId")?.removeAttribute("disabled");
      document.getElementById("dateOfBirth")?.removeAttribute("disabled");
      document.getElementById("phoneNumber")?.removeAttribute("disabled");
    }
  };

  const handleContinue = () => {
    onVerificationComplete(applicationId);
    onClose();
  };

  const handleReset = () => {
    setSubjectId("");
    setDateOfBirth("");
    setPhoneNumber("");
    setError("");
    setFieldErrors({});
    setVerificationSuccess(false);
    setApplicationId("");
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          // Reset form when dialog is closed
          handleReset();
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => {
          // Prevent closing when pressing escape key
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          // Prevent any interaction outside the dialog
          e.preventDefault();
        }}
        showCloseButton={false}
      >
        <DialogHeader className="border-b pb-2">
         <DialogTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-blue-800">
  <User className="w-5 h-5" />
  Uthibitisho wa Usajili
</DialogTitle>

          <DialogDescription className="text-center">
            Tafadhali ingiza taarifa zako za usajili wa mlowezi
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {!verificationSuccess ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectId">Nambari ya Mhusika(Subject ID) <span className="text-red-500">*</span></Label>
                <Input
                  id="subjectId"
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    if (fieldErrors.subjectId) {
                      setFieldErrors({...fieldErrors, subjectId: undefined});
                    }
                  }}
                  placeholder="ALN0000000000000"
                  className={fieldErrors.subjectId ? "border-red-500 focus:ring-red-500 rounded" : "rounded"}
                />
                {fieldErrors.subjectId && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.subjectId}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Tarehe ya Kuzaliwa <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                      if (fieldErrors.dateOfBirth) {
                        setFieldErrors({...fieldErrors, dateOfBirth: undefined});
                      }
                    }}
                    placeholder="Ingiza tarehe ya kuzaliwa"
                    className={`w-full ${fieldErrors.dateOfBirth ? "border-red-500 focus:ring-red-500 rounded" : "rounded"}`}
                  />
                </div>
                {fieldErrors.dateOfBirth && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.dateOfBirth}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Namba ya Simu Inayopatikana <span className="text-red-500">*</span></Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (fieldErrors.phoneNumber) {
                      setFieldErrors({...fieldErrors, phoneNumber: undefined});
                    }
                  }}
                  placeholder="Mfano: 0700000000"
                  className={fieldErrors.phoneNumber ? "border-red-500 focus:ring-red-500 rounded" : "rounded"}
                />
                {fieldErrors.phoneNumber && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phoneNumber}</p>
                )}
              </div>
              
              {error && (
                <Alert variant={isSearching ? "default" : "destructive"}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium text-lg mt-4">Uthibitisho Umefanikiwa!</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Taarifa zako zimethibitishwa
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">Namba ya Utambulisho</p>
                <p className="text-xl font-mono font-bold text-blue-700 mt-1">{applicationId}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500">
                    Tarehe: {format(new Date(), "dd/MM/yyyy")}
                  </p>
                  <p className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Imethibitishwa
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Namba ya Mhusika:</span>
                    <span className="font-medium">{subjectId}</span>
                  </div>
                  {phoneNumber && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-500">Namba ya Simu:</span>
                      <span className="font-medium">{phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="sm:justify-between border-t p-2">
          {!verificationSuccess ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isSearching}
                className="rounded"
              >
                Ghairi
              </Button>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="bg-blue-800 hover:bg-blue-900 min-w-[100px] rounded"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Inatafuta...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Tafuta
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleContinue}
              className="w-full bg-blue-800 hover:bg-blue-900"
            >
              Endelea na Ombi  <ArrowRight className="h-4 w-4 mr-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
