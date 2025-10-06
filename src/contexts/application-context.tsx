"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

// Define application types
export type ApplicationType = "new" | "renew" | "lost" | "damage";
export type IdentificationType = "national_id" | "passport" | "voter_id" | "driving_license";
export type ServiceOffice = "dar_es_salaam" | "arusha" | "mwanza" | "dodoma" | "zanzibar";
export type Gender = "male" | "female" | "M" | "F";
export type RenewalReason = "expired" | "lost" | "damaged";

// Define application steps
export type ApplicationStep = 
  | 10  // uthibitisho wa usajili
  | 20  // basic-info
  | 30  // residence-info
  | 40  // parents-info
  | 50  // dependants-info
  | 60  // documents
  | 70  // declaration
  | 80; // complete

// Define application form data structure
export interface ApplicationFormData {
  // Application ID
  applicationId?: string;
  
  // Application Progress
  currentStep?: ApplicationStep;
  
  // Submission Status
  submissionStatus?: 'loading' | 'success' | 'error';
  submissionMessage?: string;
  submissionError?: string;
  
  // Basic Information
  applicationType: ApplicationType;
  renewalReason?: RenewalReason;
  serviceOffice: ServiceOffice;
  
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  surname: string; // Added for the new form
  otherName?: string; // Added for the new form
  dateOfBirth: Date | string;
  formattedDateOfBirth?: string; // Added for formatted date display
  gender: Gender;
  nationality: string;
  countryOfBirth?: string; // Country of birth name (string format)
  birthCountry?: number; // Country of birth ID
  birthCountryName?: string; // Country of birth name
  birthRegion?: number; // Region of birth ID
  birthRegionName?: string; // Region of birth name
  maritalStatus: string; // Added for the new form
  maritalStatusId?: number; // Added for the marital status ID from API
  occupationType: string; // Added for the new form
  occupationTypeId?: number; // Added for the occupation type ID from API
  occupation?: string; // Added for specific occupation
  occupationId?: number; // Added for the occupation ID from API
  occupationDescription?: string; // Added for occupation description
  occupationDetail?: string; // Added for occupation detail parameter in API
  employmentStatus?: string; // Added for employment status
  
  // Residence Information
  countryOfResidence: string;
  countryId?: number;
  countryName?: string;
  region: string;
  regionId?: number;
  regionName?: string;
  district: string;
  districtId?: number;
  districtName?: string;
  ward?: string;
  wardId?: number;
  wardName?: string;
  street: string;
  phoneNumber?: string;
  plotNumber?: string;
  houseNumber?: string;
  residenceNationality?: string;
  residenceNationalityId?: number;
  residenceNationalityName?: string;
  countryOfOrigin?: string;
  countryOfOriginId?: number;
  countryOfOriginName?: string;
  permanentAddressOrigin: string;
  dateOfEntry: Date | string;
  mobileNumber: string;
  email: string;
  address: string;
  
  // Parents Information
  fatherName: string;
  fatherDateOfBirth: Date | string;
  fatherCountryOfBirth: string;
  fatherCountryId?: number;
  fatherCountryName?: string;
  fatherRegionOfBirth: string;
  fatherRegionId?: number;
  fatherRegionName?: string;
  fatherNationality: string;
  motherName: string;
  motherDateOfBirth: Date | string;
  motherCountryOfBirth: string;
  motherCountryId?: number;
  motherCountryName?: string;
  motherRegionOfBirth: string;
  motherRegionId?: number;
  motherRegionName?: string;
  motherNationality: string;
  
  // Dependant Information
  hasDependants: boolean;
  dependants?: {
    name: string;
    relationship: string;
    dateOfBirth: Date | string;
    passportNumber?: string;
    passportIssuedDate?: Date | string;
    passportExpiryDate?: Date | string;
    nationality?: string;
  }[];
  
  // Document Information
  identificationType: IdentificationType;
  identificationNumber: string;
  previousPassNumber?: string;
  
  // Declaration
  agreeTerms: boolean;
}

// Default values for the form
export const defaultApplicationValues: ApplicationFormData = {
  // Reset all values to empty or default values
  applicationId: "",
  currentStep: 10,
  
  // Reset submission status
  submissionStatus: undefined,
  submissionMessage: "",
  submissionError: "",
  
  // Basic Information
  applicationType: "new",
  renewalReason: undefined,
  serviceOffice: "dar_es_salaam",
  firstName: "",
  middleName: "",
  lastName: "",
  surname: "", 
  otherName: "", 
  dateOfBirth: new Date(),
  gender: "male",
  nationality: "Tanzanian",
  countryOfBirth: "",
  birthCountry: 0,
  birthCountryName: "",
  birthRegion: 0,
  birthRegionName: "",
  maritalStatus: "",
  maritalStatusId: 0,
  occupationType: "",
  occupationTypeId: 0,
  occupation: "",
  occupationId: 0,
  occupationDescription: "",
  occupationDetail: "",
  employmentStatus: "",
  
  // Residence Information
  countryOfResidence: "tanzania",
  countryId: 0,
  countryName: "",
  region: "",
  regionId: 0,
  regionName: "",
  district: "",
  districtId: 0,
  districtName: "",
  street: "",
  permanentAddressOrigin: "",
  dateOfEntry: new Date(),
  mobileNumber: "",
  email: "",
  address: "",
  
  // Parents Information
  fatherName: "",
  fatherDateOfBirth: new Date(),
  fatherCountryOfBirth: "",
  fatherCountryId: 0,
  fatherCountryName: "",
  fatherRegionOfBirth: "",
  fatherRegionId: 0,
  fatherRegionName: "",
  fatherNationality: "",
  motherName: "",
  motherDateOfBirth: new Date(),
  motherCountryOfBirth: "",
  motherCountryId: 0,
  motherCountryName: "",
  motherRegionOfBirth: "",
  motherRegionId: 0,
  motherRegionName: "",
  motherNationality: "",
  
  // Dependants Information
  hasDependants: false,
  dependants: [],
  
  // Document Information
  identificationType: "national_id",
  identificationNumber: "",
  previousPassNumber: "",
  
  // Declaration
  agreeTerms: false,
};

// Define context type
interface ApplicationContextType {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  clearApplicationData: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  handleApiError: (error: any) => void;
}

// Create context
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Context provider component
export function ApplicationProvider({ children }: { children: ReactNode }) {
  // Helper function to restore date objects from localStorage
  const restoreDatesFromJSON = (data: any): ApplicationFormData => {
    const result = { ...data };
    
    // Convert date strings back to Date objects
    if (typeof result.dateOfBirth === 'string' && result.dateOfBirth) {
      try { result.dateOfBirth = new Date(result.dateOfBirth); } catch (e) {}
    }
    
    if (typeof result.dateOfEntry === 'string' && result.dateOfEntry) {
      try { result.dateOfEntry = new Date(result.dateOfEntry); } catch (e) {}
    }
    
    if (typeof result.fatherDateOfBirth === 'string' && result.fatherDateOfBirth) {
      try { result.fatherDateOfBirth = new Date(result.fatherDateOfBirth); } catch (e) {}
    }
    
    if (typeof result.motherDateOfBirth === 'string' && result.motherDateOfBirth) {
      try { result.motherDateOfBirth = new Date(result.motherDateOfBirth); } catch (e) {}
    }
    
    // Handle dependants array if it exists
    if (Array.isArray(result.dependants)) {
      result.dependants = result.dependants.map((dep: any) => {
        const newDep = { ...dep };
        if (typeof newDep.dateOfBirth === 'string' && newDep.dateOfBirth) {
          try { newDep.dateOfBirth = new Date(newDep.dateOfBirth); } catch (e) {}
        }
        if (typeof newDep.passportExpiryDate === 'string' && newDep.passportExpiryDate) {
          try { newDep.passportExpiryDate = new Date(newDep.passportExpiryDate); } catch (e) {}
        }
        if (typeof newDep.passportIssuedDate === 'string' && newDep.passportIssuedDate) {
          try { newDep.passportIssuedDate = new Date(newDep.passportIssuedDate); } catch (e) {}
        }
        return newDep;
      });
    }
    
    return result as ApplicationFormData;
  };
  
  // Initialize with default values for server-side rendering
  const [formData, setFormData] = useState<ApplicationFormData>(defaultApplicationValues);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load only applicationId from localStorage on client-side after initial render
  useEffect(() => {
    try {
      // Try to get applicationId from dedicated storage
      const storedApplicationId = localStorage.getItem('applicationId');
      
      if (storedApplicationId) {
        // Only update the applicationId in the form data
        setFormData(prev => ({
          ...prev,
          applicationId: storedApplicationId
        }));
      }
    } catch (error) {
    }
  }, []);

  // Update form data, handling applicationId separately
  const updateFormData = (data: Partial<ApplicationFormData>) => {
    // Check if applicationId is being updated
    if (data.applicationId) {
      try {
        // Store applicationId separately in localStorage
        localStorage.setItem('applicationId', data.applicationId);
      } catch (error) {
    }
    }
    
    // Process date fields before updating state
    const processedData = { ...data };
    
    // Handle dateOfBirth specially
    if (processedData.dateOfBirth) {
     if (typeof processedData.dateOfBirth === 'string') {
        try {
          processedData.dateOfBirth = new Date(processedData.dateOfBirth);
        } catch (e) {
        }
      }
    }
    
    // Update the form data state
    setFormData((prev) => {
      return { ...prev, ...processedData };
    });
  };
  
  // Clear application data but preserve applicationId
  const clearApplicationData = () => {
    // Get current applicationId before reset
    const currentApplicationId = formData.applicationId;
    
    // Reset to default values but keep applicationId
    setFormData({
      ...defaultApplicationValues,
      applicationId: currentApplicationId // Preserve applicationId
    });
    
    // Update localStorage with just the applicationId
    try {
      if (currentApplicationId) {
        localStorage.setItem('applicationId', currentApplicationId);
      }
      localStorage.removeItem('applicationFormData');
   } catch (error) {
   }
  };
  
 const showError = useCallback((message: string, title?: string) => {
    toast({
      title: title,
      description: message,
      variant: "error"
    });
  }, []);
  
  // Show success toast notification
  const showSuccess = useCallback((message: string, title?: string) => {
    toast({
      title: title,
      description: message,
      variant: "success"
    });
  }, []);
  
  // Show info toast notification
  const showInfo = useCallback((message: string, title?: string) => {
    toast({
      title: title,
      description: message,
      variant: "info"
    });
  }, []);
  
  // Show warning toast notification
  const showWarning = useCallback((message: string, title?: string) => {
    toast({
      title: title,
      description: message,
      variant: "warning"
    });
  }, []);
  
  // Handle API errors consistently
  const handleApiError = useCallback((error: any) => {
   const errorMessage = error?.message || 'An unexpected error occurred';
    showError(errorMessage);
  }, [showError]);

  return (
    <ApplicationContext.Provider
      value={{
        formData,
        updateFormData,
        clearApplicationData,
        isLoading,
        setIsLoading,
        showError,
        showSuccess,
        showInfo,
        showWarning,
        handleApiError
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

// Custom hook to use the application context
export function useApplication() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error("useApplication must be used within an ApplicationProvider");
  }
  return context;
}
