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

  // Fetch dropdown options when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchMaritalStatus();
      fetchOccupationTypes();
      fetchCountries();
    }
  }, [isOpen]);

  // Fetch personal info when dialog opens
  useEffect(() => {
    if (isOpen && applicationId) {
      fetchPersonalInfo();
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
        
        setMaritalStatusOptions(options);
      } else {
        setMaritalStatusOptions([]);
      }
    } catch (error) {
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
        
        setOccupationTypeOptions(options);
      } else {
        setOccupationTypeOptions([]);
      }
    } catch (error) {
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
        
        setOccupationOptions(options);
      } else {
        setOccupationOptions([]);
      }
    } catch (error) {
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
      // Call the real API endpoint to get personal info
      const response = await personalInfoEndpoints.getPersonalInfo(applicationId);
      
      if (response && response.ackCode === 1) {
        const data = response.jsonResult;
        
        // Format date from API (YYYY-MM-DD) to input format
        const formattedDate = data.dateOfBirth ? data.dateOfBirth : "";
        
        // Set form values
        setValue("firstName", data.firstName || "");
        setValue("middleName", data.middleName || "");
        setValue("lastName", data.lastName || "");
        setValue("otherName", data.otherName || "");
        setValue("gender", data.gender?.toLowerCase() || "");
        setValue("dateOfBirth", formattedDate);
        setValue("birthCountry", data.birthCountry || "");
        setValue("birthRegion", data.birthRegion || "");
        setValue("maritalStatus", data.maritalStatus || "");
        setValue("occupationType", data.occupationType || "");
        setValue("occupationDetail", data.occupationDetail || "");
        setValue("occupation", data.occupation || "");
        
        // Find the corresponding country ID based on name
        if (data.birthCountry && countryOptions.length > 0) {
          const country = countryOptions.find(c => 
            c.value.toLowerCase() === data.birthCountry.toLowerCase());
          if (country) {
            // If we found a matching country, fetch its regions
            fetchRegionsForCountry(country.id);
          }
        }
        
        // Find the corresponding occupation type ID based on name
        if (data.occupationType && occupationTypeOptions.length > 0) {
          const occupationType = occupationTypeOptions.find(ot => 
            ot.value.toLowerCase() === data.occupationType.toLowerCase());
          if (occupationType) {
            // If we found a matching occupation type, fetch its occupations
            fetchOccupationsForType(occupationType.id);
          }
        }
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
    
    return {
      applicationId: applicationId,
      firstName: data.firstName || '',
      middleName: data.middleName || '',
      lastName: data.lastName || '',
      otherName: data.otherName || '',
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || 'male',
      maritalStatusId: maritalStatusId,
      nationality: 'Tanzania',
      occupationId: occupationId,
      occupationTypeId: occupationTypeId,
      email: '',
      phoneNumber: '',
      birthCountry: data.birthCountry || '',
      birthRegion: data.birthRegion || '',
      maritalStatus: data.maritalStatus || '',
      occupationType: data.occupationType || '',
      occupationDetail: data.occupationDetail || '',
      occupation: data.occupation || ''
    };
  };
  
  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsSaving(true);
    setError("");
    
    try {
      // Prepare payload for API using the helper function
      const payload = preparePersonalInfoPayload(data);
      
      // Use the PUT method to update personal info
      const response = await personalInfoEndpoints.savePersonalInfo(payload);
      
      if (response && response.ackCode === 1) {
        showSuccess("Taarifa zimehifadhiwa kikamilifu");
        onClose();
        // Navigate back to declaration page
        router.push(`/application/declaration`);
      } else {
        setError(`Imeshindikana kuhifadhi taarifa: ${response?.ackMessage || "Kuna hitilafu imetokea"}`);
      }
    } catch (error: any) {
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
        className="sm:max-w-md md:max-w-4xl"
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
          <DialogTitle className="text-center text-xl font-semibold text-blue-700">Hariri Taarifa za Msingi</DialogTitle>
          <DialogDescription className="text-center">
            Tafadhali hariri taarifa zako za msingi
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-blue-600">Inapakia taarifa...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Jina la Kwanza <span className="text-red-500">*</span></Label>
                <Input
                  id="firstName"
                  {...register("firstName", { required: "Jina la kwanza linahitajika" })}
                  className={errors.firstName ? "border-red-500" : ""}
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Jina la Mwisho <span className="text-red-500">*</span></Label>
                <Input
                  id="lastName"
                  {...register("lastName", { required: "Jina la mwisho linahitajika" })}
                  className={errors.lastName ? "border-red-500" : ""}
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Jinsia <span className="text-red-500">*</span></Label>
                <Select 
                  onValueChange={(value) => setValue("gender", value)} 
                  defaultValue={""} 
                  {...register("gender", { required: "Jinsia inahitajika" })}
                >
                  <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chagua Jinsia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Mwanaume</SelectItem>
                    <SelectItem value="F">Mwanamke</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-red-500">{errors.gender.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Tarehe ya Kuzaliwa <span className="text-red-500">*</span></Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth", { required: "Tarehe ya kuzaliwa inahitajika" })}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthCountry">Nchi ya Kuzaliwa <span className="text-red-500">*</span></Label>
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
                  {...register("birthCountry", { required: "Nchi ya kuzaliwa inahitajika" })}
                >
                  <SelectTrigger className={errors.birthCountry ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chagua Nchi" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCountries ? (
                      <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                    ) : countryOptions.length > 0 ? (
                      countryOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Hakuna nchi zilizopatikana</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.birthCountry && (
                  <p className="text-xs text-red-500">{errors.birthCountry.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthRegion">Mkoa wa Kuzaliwa <span className="text-red-500">*</span></Label>
                <Select 
                  onValueChange={(value) => setValue("birthRegion", value)} 
                  value={getValues("birthRegion") || ""} 
                  disabled={isLoadingRegions || getValues("birthCountry") === "" || regionOptions.length === 0}
                  {...register("birthRegion", { required: "Mkoa wa kuzaliwa unahitajika" })}
                >
                  <SelectTrigger className={errors.birthRegion ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chagua Mkoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRegions ? (
                      <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                    ) : regionOptions.length > 0 ? (
                      regionOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Chagua nchi kwanza</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.birthRegion && (
                  <p className="text-xs text-red-500">{errors.birthRegion.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Hali ya Ndoa <span className="text-red-500">*</span></Label>
                <Select 
                  onValueChange={(value) => setValue("maritalStatus", value)} 
                  value={getValues("maritalStatus") || ""} 
                  disabled={isLoadingMaritalStatus}
                  {...register("maritalStatus", { required: "Hali ya ndoa inahitajika" })}
                >
                  <SelectTrigger className={errors.maritalStatus ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chagua Hali ya Ndoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingMaritalStatus ? (
                      <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                    ) : maritalStatusOptions.length > 0 ? (
                      maritalStatusOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Hakuna data ilipatikana</SelectItem>
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
                  {...register("occupationType", { required: "Aina ya kazi inahitajika" })}
                >
                  <SelectTrigger className={errors.occupationType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chagua Aina ya Kazi" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingOccupationTypes ? (
                      <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                    ) : occupationTypeOptions.length > 0 ? (
                      occupationTypeOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Hakuna data ilipatikana</SelectItem>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Chagua Kazi" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingOccupations ? (
                      <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                    ) : occupationOptions.length > 0 ? (
                      occupationOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Chagua aina ya kazi kwanza</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupationDetail">Maelezo ya Kazi</Label>
                <Input
                  id="occupationDetail"
                  {...register("occupationDetail")}
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter className="sm:justify-between mt-6">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleClose}
                disabled={isSaving}
                className="rounded"
              >
                Ghairi
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-blue-800 hover:bg-blue-900 min-w-[100px] rounded"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Inahifadhi...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Hifadhi
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
