"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
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
  gender: Gender;
  nationality: string;
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
  applicationId: "",
  currentStep: 10,
  applicationType: "new",
  renewalReason: "expired",
  serviceOffice: "dar_es_salaam",
  firstName: "",
  middleName: "",
  lastName: "",
  surname: "", // Added for the new form
  otherName: "", // Added for the new form
  dateOfBirth: new Date(),
  gender: "male",
  nationality: "Tanzanian",
  birthCountry: 0, // Country of birth ID
  birthCountryName: "", // Country of birth name
  birthRegion: 0, // Region of birth ID
  birthRegionName: "", // Region of birth name
  maritalStatus: "", // Added for the new form
  maritalStatusId: 0, // Added for the marital status ID from API
  occupationType: "", // Added for the new form
  occupationTypeId: 0, // Added for the occupation type ID from API
  occupation: "", // Added for specific occupation
  occupationId: 0, // Added for the occupation ID from API
  occupationDescription: "", // Added for occupation description
  occupationDetail: "", // Added for occupation detail parameter in API
  employmentStatus: "", // Added for employment status
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
  hasDependants: false,
  dependants: [],
  identificationType: "national_id",
  identificationNumber: "",
  previousPassNumber: "",
  agreeTerms: false,
};

// Define context type
interface ApplicationContextType {
  formData: ApplicationFormData;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  handleApiError: (error: any) => void;
}

// Create context
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Context provider component
export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ApplicationFormData>(defaultApplicationValues);
  const [isLoading, setIsLoading] = useState(false);

  // Update form data
  const updateFormData = (data: Partial<ApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };
  
  // Show error toast notification
  const showError = useCallback((message: string, title: string = "Error") => {
    toast({
      title: title,
      description: message,
      variant: "thin-error"
    });
  }, []);
  
  // Show success toast notification
  const showSuccess = useCallback((message: string, title: string = "Success") => {
    toast({
      title: title,
      description: message,
      variant: "outline-green"
    });
  }, []);
  
  // Show info toast notification
  const showInfo = useCallback((message: string, title: string = "Information") => {
    toast({
      title: title,
      description: message,
      variant: "outline-blue"
    });
  }, []);
  
  // Handle API errors consistently
  const handleApiError = useCallback((error: any) => {
    console.error('API Error:', error);
    const errorMessage = error?.message || 'An unexpected error occurred';
    showError(errorMessage);
  }, [showError]);

  return (
    <ApplicationContext.Provider
      value={{
        formData,
        updateFormData,
        isLoading,
        setIsLoading,
        showError,
        showSuccess,
        showInfo,
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
