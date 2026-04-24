"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { format, parse } from "date-fns";
import { Loader2, Save } from "lucide-react";
import { useApplication } from "@/contexts/application-context";
import { personalInfoEndpoints } from "@/lib/api";
import { verificationEndpoints } from "@/lib/api/endpoints/verification";
import { DialogProps } from "@radix-ui/react-dialog";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PersonalInfoEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

interface PersonalInfoFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  otherName: string;
  gender: string;
  dateOfBirth: string;
  birthCountry: string;
  birthRegion: string;
  maritalStatus: string;
  occupationType: string;
  occupationDetail: string;
  occupation: string;
  applicationID?: string;
}

// Define interfaces for dropdown options
interface Option {
  value: string;
  label: string;
  id: number;
}

export default function PersonalInfoEditDialog({
  isOpen,
  onClose,
  applicationId,
}: PersonalInfoEditDialogProps) {
  const router = useRouter();
  const { showSuccess, showError } = useApplication();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  // State for dropdown options
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [regionOptions, setRegionOptions] = useState<Option[]>([]);
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<Option[]>([]);
  const [occupationTypeOptions, setOccupationTypeOptions] = useState<Option[]>([]);
  const [occupationOptions, setOccupationOptions] = useState<Option[]>([]);
  
 

  // Loading states for dropdowns
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingMaritalStatus, setIsLoadingMaritalStatus] = useState(false);
  const [isLoadingOccupationTypes, setIsLoadingOccupationTypes] = useState(false);
  const [isLoadingOccupations, setIsLoadingOccupations] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset
  } = useForm<PersonalInfoFormData>();

  
  // Fetch personal info when dialog opens
  useEffect(() => {
    if (isOpen && applicationId) {
      // Reset form and fetch personal info
      reset();
      
      // First fetch all dropdown options
      const loadOptions = async () => {
        try {
          await Promise.all([
            fetchMaritalStatus(),
            fetchOccupationTypes(),
            fetchCountries()
          ]);
          
          // Then fetch personal info after options are loaded
          fetchPersonalInfo();
        } catch (error) {
          console.error('Error loading options:', error);
          fetchPersonalInfo(); // Still try to fetch personal info even if options fail
        }
      };
      
      loadOptions();
    }
  }, [isOpen, applicationId]);



  
  // Fetch marital status options
  const fetchMaritalStatus = async () => {
    setIsLoadingMaritalStatus(true);
    try {
      const response = await verificationEndpoints.fetchMaritalStatus();
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(status => ({
          value: status.HaliYaNdoa,
          label: status.HaliYaNdoa,
          id: status.MaritalStatusID
        }));
        
        console.log('Marital status options:', options);
        setMaritalStatusOptions(options);
      } else {
        console.log('No marital status options found');
        setMaritalStatusOptions([]);
      }
    } catch (error) {
      console.error('Error fetching marital status:', error);
      setMaritalStatusOptions([]);
    } finally {
      setIsLoadingMaritalStatus(false);
    }
  };
  
  // Fetch occupation types
  const fetchOccupationTypes = async () => {
    setIsLoadingOccupationTypes(true);
    try {
      const response = await verificationEndpoints.fetchOccupationTypes();
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(type => ({
          value: type.AinaYaKazi || type.OccupationType || '',
          label: type.AinaYaKazi || type.OccupationType || '',
          id: type.OccupationTypeID || type.EntryId || 0
        }));
        
        console.log('Occupation type options:', options);
        setOccupationTypeOptions(options);
      } else {
        console.log('No occupation type options found');
        setOccupationTypeOptions([]);
      }
    } catch (error) {
      console.error('Error fetching occupation types:', error);
      setOccupationTypeOptions([]);
    } finally {
      setIsLoadingOccupationTypes(false);
    }
  };
  
  // Fetch occupations for a specific type
  const fetchOccupationsForType = async (occupationTypeId: number) => {
    if (!occupationTypeId) return;
    
    setIsLoadingOccupations(true);
    try {
      const response = await verificationEndpoints.fetchOccupationsByID(occupationTypeId);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(occupation => ({
          value: occupation.OccupationName,
          label: occupation.OccupationName,
          id: occupation.OccupationID
        }));
        
        console.log('Occupations for type', occupationTypeId, ':', options);
        setOccupationOptions(options);
      } else {
        console.log('No occupations found for type', occupationTypeId);
        setOccupationOptions([]);
      }
    } catch (error) {
      console.error('Error fetching occupations for type', occupationTypeId, ':', error);
      setOccupationOptions([]);
    } finally {
      setIsLoadingOccupations(false);
    }
  };
  
  // Fetch countries
  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await verificationEndpoints.fetchCountries();
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(country => ({
          value: country.CountryName,
          label: country.CountryName,
          id: country.EntryId
        }));
        
        setCountryOptions(options);
      } else {
        setCountryOptions([]);
      }
    } catch (error) {
      setCountryOptions([]);
    } finally {
      setIsLoadingCountries(false);
    }
  };
  
  // Fetch regions for a country
  const fetchRegionsForCountry = async (countryId: number) => {
    if (!countryId) return;
    
    setIsLoadingRegions(true);
    try {
      const response = await verificationEndpoints.fetchRegions(countryId);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(region => {
          const regionId = region.EntryID !== undefined ? region.EntryID : 
                          region.EntryId !== undefined ? region.EntryId :
                          region.ID !== undefined ? region.ID :
                          region.Id !== undefined ? region.Id :
                          region.id !== undefined ? region.id :
                          region.RegionID !== undefined ? region.RegionID :
                          region.RegionId !== undefined ? region.RegionId : 0;
          return {
            value: region.RegionName,
            label: region.RegionName,
            id: regionId
          };
        });
        
        setRegionOptions(options);
      } else {
        setRegionOptions([]);
      }
    } catch (error) {
      setRegionOptions([]);
    } finally {
      setIsLoadingRegions(false);
    }
  };

  const fetchPersonalInfo = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Call the API endpoint to get personal info
      const response = await personalInfoEndpoints.getPersonalInfo(applicationId);
      
      if (response && response.ackCode === 1) {
        // Use type assertion to access jsonResult property
        const responseAny = response as any;
        const data = responseAny.jsonResult || {};
        console.log('API Response data:', data); // Debug log
        
        // Set basic form values first
        setValue("applicationID", data.applicationID || "");
        setValue("firstName", data.firstName || "");
        setValue("middleName", data.middleName || "");
        setValue("lastName", data.lastName || "");
        setValue("otherName", data.otherName || "");
        setValue("occupationDetail", data.occupationDetail || "");
        
        // Format date from API (YYYY-MM-DD) to input format
        const formattedDate = data.dateOfBirth ? data.dateOfBirth : "";
        setValue("dateOfBirth", formattedDate);
        
        // Handle gender field - convert to uppercase if needed
        if (data.gender) {
          // API might return 'f' or 'F' or 'female' - normalize to 'F'
          const normalizedGender = data.gender.toUpperCase().charAt(0);
          setValue("gender", normalizedGender === 'F' ? 'F' : 'M');
          console.log('Setting gender to:', normalizedGender === 'F' ? 'F' : 'M');
        }
        
        setValue("maritalStatus", data.maritalStatus || "");
        setValue("occupationType", data.occupationType || "");
        
        // If we have occupation type, fetch the occupations for it
        if (data.occupationType && occupationTypeOptions.length > 0) {
          const occupationTypeMatch = occupationTypeOptions.find(ot => 
            ot.value.toLowerCase() === data.occupationType.toLowerCase());
          
          if (occupationTypeMatch) {
            console.log('Found occupation type match, fetching occupations for ID:', occupationTypeMatch.id);
            await fetchOccupationsForType(occupationTypeMatch.id);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        setValue("occupation", data.occupation || "");
        
        // Handle birth country dropdown and fetch regions
        if (data.birthCountry && countryOptions.length > 0) {
          
          // Try to find the country in options
          const country = countryOptions.find(c => 
            c.value.toLowerCase() === data.birthCountry.toLowerCase());
          
          if (country) {
            setValue("birthCountry", country.value);
            console.log('Match found for birth country:', country.value);
            
            // Fetch regions for this country
            await fetchRegionsForCountry(country.id);
            
            // Now set the birth region if available
            if (data.birthRegion && regionOptions.length > 0) {
              setValue("birthRegion", data.birthRegion);
            }
          } else {
            setValue("birthCountry", data.birthCountry);
          }
        } else {
          setValue("birthCountry", data.birthCountry || "");
          setValue("birthRegion", data.birthRegion || "");
        }
        
        // Log final form values for debugging
        setTimeout(() => {
          const formValues = getValues();
        }, 200);
        
      } else {
        setError(`Imeshindikana kupata taarifa: ${response?.ackMessage || "Kuna hitilafu imetokea"}`);
      }
    } catch (error: any) {
      setError(`Imeshindikana kupata taarifa: ${error.message || "Kuna hitilafu imetokea"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to prepare data for PersonalInfoPayload
  const preparePersonalInfoPayload = (data: any) => {
    // Find the selected marital status ID
    const selectedMaritalStatus = maritalStatusOptions.find(opt => opt.value === data.maritalStatus);
    const maritalStatusId = selectedMaritalStatus ? selectedMaritalStatus.id : 1;
    
    // Find the selected occupation type ID
    const selectedOccupationType = occupationTypeOptions.find(opt => opt.value === data.occupationType);
    const occupationTypeId = selectedOccupationType ? selectedOccupationType.id : 1;
    
    // Find the selected occupation ID
    const selectedOccupation = occupationOptions.find(opt => opt.value === data.occupation);
    const occupationId = selectedOccupation ? selectedOccupation.id : 1;
    
    // Find the selected country ID
    const selectedCountry = countryOptions.find(opt => opt.value === data.birthCountry);
    const birthCountryId = selectedCountry ? selectedCountry.id : 0;
    
    // Find the selected region ID
    const selectedRegion = regionOptions.find(opt => opt.value === data.birthRegion);
    const birthRegionId = selectedRegion ? selectedRegion.id : 0;
    
    // Convert the data to match the PersonalInfoPayload interface
    return {
      applicationId: applicationId,
      firstName: data.firstName || '',
      middleName: data.middleName || '',
      lastName: data.lastName || '',
      otherName: data.otherName || '',
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || '',
      maritalStatusId: maritalStatusId,
      nationality: data.nationality || '',
      occupationId: occupationId,
      occupationTypeId: occupationTypeId, // Add occupationTypeId as required by the API
      email: '',
      phoneNumber: '',
      // Use integer IDs instead of string values for fields that require integers
      birthCountryId: birthCountryId, // Use ID instead of string value
      birthRegionId: birthRegionId,   // Use ID instead of string value
      // Keep other string fields that don't cause validation errors
      maritalStatus: data.maritalStatus || '',
      occupationType: data.occupationType || '',
      occupationDetail: data.occupationDetail || '',
      occupation: data.occupation || ''
      // Removed birthCountry and birthRegion string fields to avoid validation errors
    };
  };
  
  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsSaving(true);
    setError("");
    
    try {
      // Log form values before submission
      console.log('Form values before submission:', {
        gender: getValues("gender"),
        maritalStatus: getValues("maritalStatus"),
        occupationType: getValues("occupationType"),
        occupation: getValues("occupation"),
        birthCountry: getValues("birthCountry"),
        birthRegion: getValues("birthRegion")
      });
      
      // Prepare payload for API using the helper function
      const rawPayload = preparePersonalInfoPayload(data);
      
      // Create a clean payload with only the non-empty fields the API expects
      // Note: birthCountry and birthRegion should be integers (IDs), not strings
      const initialPayload: Record<string, any> = {
        applicationId: rawPayload.applicationId,
        firstName: rawPayload.firstName,
        middleName: rawPayload.middleName,
        lastName: rawPayload.lastName,
        otherName: rawPayload.otherName,
        dateOfBirth: rawPayload.dateOfBirth,
        gender: rawPayload.gender,
        maritalStatusId: rawPayload.maritalStatusId,
        occupationId: rawPayload.occupationId,
        occupationTypeId: rawPayload.occupationTypeId,
        // Use integer IDs for birthCountry and birthRegion (not strings)
        birthCountry: rawPayload.birthCountryId,
        birthRegion: rawPayload.birthRegionId,
        occupationDetail: rawPayload.occupationDetail,
        email: rawPayload.email || '',
        phoneNumber: rawPayload.phoneNumber || ''
      };
      
      // Define required fields that must be included in the payload
      const requiredFields = ['applicationId', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'birthCountry', 'birthRegion'];
      
      // Remove empty, null, or undefined values to prevent validation errors
      const payload = Object.entries(initialPayload).reduce((acc, [key, value]) => {
        // Special handling for numeric fields - keep 0 values as they are valid
        const isNumericField = [
          'maritalStatusId', 'occupationId', 'occupationTypeId', 
          'birthCountry', 'birthRegion'
        ].includes(key);
        
        // Always include required fields, even if empty
        const isRequiredField = requiredFields.includes(key);
        
        // Include the field if it's required or has a valid value
        // For numeric fields, 0 is considered valid
        // For string fields, empty strings are excluded unless required
        if (isRequiredField || 
            (isNumericField && (value === 0 || value)) || 
            (!isNumericField && value !== '' && value !== null && value !== undefined)) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      // Check if required fields are included in the final payload
      const missingFields = requiredFields.filter(field => !(field in payload));
      if (missingFields.length > 0) {
        console.warn('Warning: Some required fields are missing from the payload:', missingFields);
      }
      
      // Make sure birthCountry and birthRegion are explicitly included as integers
      if (!('birthCountry' in payload)) {
        console.log('Adding missing birthCountry field with ID:', rawPayload.birthCountryId);
        payload.birthCountry = rawPayload.birthCountryId;
      }
      
      if (!('birthRegion' in payload)) {
        console.log('Adding missing birthRegion field with ID:', rawPayload.birthRegionId);
        payload.birthRegion = rawPayload.birthRegionId;
      }
      
      console.log('Submitting clean payload:', payload); // Debug log
      console.log('Checking for required fields:', {
        'birthCountry in payload': 'birthCountry' in payload,
        'birthCountry value': payload.birthCountry,
        'birthCountry type': typeof payload.birthCountry,
        'birthRegion in payload': 'birthRegion' in payload,
        'birthRegion value': payload.birthRegion,
        'birthRegion type': typeof payload.birthRegion
      });
      
      // Use direct fetch with PUT method to update personal info
      const res = await fetch(`/applications/${payload.applicationId}/personal-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Handle potential validation errors
      if (!res.ok) {
        // Try to parse error response for validation errors
        const errorData = await res.json();
        console.error('API error response:', errorData);
        console.error('Submitted payload that caused error:', payload);
        
        if (errorData.detail && Array.isArray(errorData.detail)) {
          let errorMessage = 'Kuna hitilafu katika fomu:';
          
          // Log specific details about each validation error
          errorData.detail.forEach((err: any, index: number) => {
            console.error(`Validation error ${index + 1}:`, err);
            
            // For int_parsing errors, show the field name and expected type
            if (err.type === 'int_parsing') {
              const fieldName = err.loc[1];
              errorMessage += `\n${index + 1}. Field '${fieldName}' should be an integer, not '${err.input}'`;
              
              // Log the corresponding ID field that should be used instead
              console.error(`Should be using ${fieldName}Id instead of ${fieldName}`);
            } else {
              errorMessage += `\n${index + 1}. ${err.msg || 'Hitilafu'} (${err.loc?.join('.') || 'field'}: ${err.input || ''})`;
            }
          });
          
          setError(errorMessage);
          setIsSaving(false);
          return; // Exit early
        }
        
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      
      const response = await res.json();
      
      if (response && response.ackCode === 1) {
        showSuccess("Taarifa zimehifadhiwa kikamilifu");
        onClose();
        // Navigate back to declaration page
        router.push(`/application/declaration`);
      } else {
        // Check if response has any additional error information
        const responseAny = response as any; // Use type assertion to access potential properties
        
        if (responseAny.validationErrors) {
          console.error('Validation errors:', responseAny.validationErrors);
          let errorMessage = 'Kuna hitilafu katika fomu:';
          
          // Format validation errors for display
          if (Array.isArray(responseAny.validationErrors)) {
            responseAny.validationErrors.forEach((err: any, index: number) => {
              errorMessage += `\n${index + 1}. ${err.msg || 'Hitilafu'} (${err.loc?.join('.') || 'field'}: ${err.input || ''})`;
            });
          } else if (typeof responseAny.validationErrors === 'object') {
            Object.keys(responseAny.validationErrors).forEach(key => {
              errorMessage += `\n- ${key}: ${responseAny.validationErrors[key]}`;
            });
          }
          
          setError(errorMessage);
        } else {
          setError(`Imeshindikana kuhifadhi taarifa: ${response?.ackMessage || "Kuna hitilafu imetokea"}`);
        }
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Try to parse error response if it's a validation error
      if (error.response && error.response.data) {
        try {
          const errorData = error.response.data;
          if (errorData.detail && Array.isArray(errorData.detail)) {
            let errorMessage = 'Kuna hitilafu katika fomu:';
            errorData.detail.forEach((err: any, index: number) => {
              errorMessage += `\n${index + 1}. ${err.msg || 'Hitilafu'} (${err.loc?.join('.') || 'field'}: ${err.input || ''})`;
            });
            setError(errorMessage);
            return;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      }
      
      setError(`Imeshindikana kuhifadhi taarifa: ${error.message || "Kuna hitilafu imetokea"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-md md:max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] p-4 sm:p-6"
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
        <DialogHeader>
          <DialogTitle className="text-slate-600 border-b pb-2 border-slate-200">Hariri Taarifa Binafsi</DialogTitle>
          {/* <DialogDescription className="text-center">
            Tafadhali hariri taarifa zako za msingi
          </DialogDescription> */}
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
            <span className="ml-2 text-slate-200">Inapakia taarifa...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Jina la Kwanza </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className={errors.firstName ? "border-red-500 rounded" : "rounded"}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="middleName">Jina la Kati</Label>
                <Input
                  id="middleName"
                  {...register("middleName")}
                  className="rounded"
                  />
                {errors.middleName && (
                  <p className="text-xs text-red-500">{errors.middleName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Jina la Mwisho </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className={errors.lastName ? "border-red-500 rounded" : "rounded"}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otherName">Jina Lingine</Label>
                <Input
                  id="otherName"
                  {...register("otherName")}
                  className="rounded"
                />
                {errors.otherName && (
                  <p className="text-xs text-red-500">{errors.otherName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Jinsia </Label>
                <Select 
                  onValueChange={(value) => setValue("gender", value)} 
                  value={getValues("gender") || ""}
                  {...register("gender")}
                  
                >
                  <SelectTrigger className={errors.gender ? "border-red-500 rounded" : "rounded"}>
                    <SelectValue placeholder="Chagua Jinsia" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="M">Mume</SelectItem>
                    <SelectItem value="F">Mke</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-red-500">{errors.gender.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Tarehe ya Kuzaliwa </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className={errors.dateOfBirth ? "border-red-500 rounded" : "rounded"}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthCountry">
                  Nchi ya Kuzaliwa 
                  </Label>  
                <Select 
                  onValueChange={(value) => {
                    setValue("birthCountry", value);
                    
                    // Find the selected country to get its ID
                    const selectedCountry = countryOptions.find(c => c.value === value);
                    if (selectedCountry) {
                      // Clear region and fetch regions for this country
                      setValue("birthRegion", "");
                      fetchRegionsForCountry(selectedCountry.id);
                    }
                  }} 
                  value={getValues("birthCountry") || ""} 
                  disabled={isLoadingCountries}
                  {...register("birthCountry")}
                >
                  <SelectTrigger className={errors.birthCountry ? "border-red-500 rounded" : "rounded"}>
                    <SelectValue placeholder="Chagua Nchi" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {isLoadingCountries ? (
                      <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                    ) : countryOptions.length > 0 ? (
                      countryOptions
                        .filter((option) => option.value && option.value.trim() !== '')
                        .map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-gray-500">Hakuna nchi zilizopatikana</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.birthCountry && (
                  <p className="text-xs text-red-500">{errors.birthCountry.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthRegion">
                  Mkoa wa Kuzaliwa 
                  </Label>
                <Select 
                  onValueChange={(value) => setValue("birthRegion", value)} 
                  value={getValues("birthRegion") || ""} 
                  disabled={isLoadingRegions || getValues("birthCountry") === "" || regionOptions.length === 0}
                  {...register("birthRegion")}
                >
                  <SelectTrigger className={errors.birthRegion ? "border-red-500 rounded" : "rounded"}>
                    <SelectValue placeholder="Chagua Mkoa" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {isLoadingRegions ? (
                      <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                    ) : regionOptions.length > 0 ? (
                      regionOptions
                        .filter((option) => option.value && option.value.trim() !== '')
                        .map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-gray-500">Chagua nchi kwanza</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.birthRegion && (
                  <p className="text-xs text-red-500">{errors.birthRegion.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Hali ya Ndoa </Label>
                <Select 
                  onValueChange={(value) => setValue("maritalStatus", value)} 
                  value={getValues("maritalStatus") || ""} 
                  disabled={isLoadingMaritalStatus}
                  {...register("maritalStatus")}
                >
                  <SelectTrigger className={errors.maritalStatus ? "border-red-500 rounded" : "rounded"}>
                    <SelectValue placeholder="Chagua Hali ya Ndoa" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {isLoadingMaritalStatus ? (
                      <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                    ) : maritalStatusOptions.length > 0 ? (
                      maritalStatusOptions
                        .filter((option) => option.value && option.value.trim() !== '')
                        .map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-gray-500">Hakuna data ilipatikana</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.maritalStatus && (
                  <p className="text-xs text-red-500">{errors.maritalStatus.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupationType">Aina ya Kazi <span className="text-red-500">*</span></Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("occupationType", value);
                    
                    // Find the selected occupation type to get its ID
                    const selectedOccupationType = occupationTypeOptions.find(ot => ot.value === value);
                    if (selectedOccupationType) {
                      // Clear occupation and fetch occupations for this type
                      setValue("occupation", "");
                      fetchOccupationsForType(selectedOccupationType.id);
                    }
                  }} 
                  value={getValues("occupationType") || ""} 
                  disabled={isLoadingOccupationTypes}
                  {...register("occupationType")}
                >
                  <SelectTrigger className={errors.occupationType ? "border-red-500 rounded" : "rounded"}>
                    <SelectValue placeholder="Chagua Aina ya Kazi" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {isLoadingOccupationTypes ? (
                      <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                    ) : occupationTypeOptions.length > 0 ? (
                      occupationTypeOptions
                        .filter((option) => option.value && option.value.trim() !== '')
                        .map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-gray-500">Hakuna data ilipatikana</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.occupationType && (
                  <p className="text-xs text-red-500">{errors.occupationType.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation">Kazi</Label>
                <Select 
                  onValueChange={(value) => setValue("occupation", value)} 
                  value={getValues("occupation") || ""} 
                  disabled={isLoadingOccupations || getValues("occupationType") === "" || occupationOptions.length === 0}
                  {...register("occupation")}
                >
                  <SelectTrigger className="rounded">
                    <SelectValue placeholder="Chagua Kazi" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {isLoadingOccupations ? (
                      <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                    ) : occupationOptions.length > 0 ? (
                      occupationOptions
                        .filter((option) => option.value && option.value.trim() !== '')
                        .map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-gray-500">Chagua aina ya kazi kwanza</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupationDetail">Maelezo ya Kazi</Label>
                <Input
                  id="occupationDetail"
                  {...register("occupationDetail")}
                  className="rounded"
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4 whitespace-pre-line">
                <AlertDescription className="break-words">{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between mt-6 border-t pt-4 border-slate-200 gap-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleClose}
                disabled={isSaving}
                className="rounded w-full sm:w-auto"
              >
                Ghairi
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-blue-800 hover:bg-blue-900 min-w-[100px] rounded w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Inahifadhi...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Hifadhi Mabadiliko
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
