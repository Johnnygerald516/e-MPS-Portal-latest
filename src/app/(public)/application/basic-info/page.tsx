"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CustomDateInput } from "@/components/ui/custom-date-input";
import { ArrowRight, Save } from "lucide-react";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { personalInfoEndpoints } from "@/lib/api";
import { verificationEndpoints } from "@/lib/api/endpoints/verification";
import { useCustomToast } from "@/hooks/use-custom-toast";

// Application type options with icons
const applicationTypes = [
  { value: "new", label: "New Application", icon: <ArrowRight className="h-5 w-5 text-blue-600" /> },
  { value: "renew", label: "Renew Application", icon: <Save className="h-5 w-5 text-green-600" /> },
];


// Interface for marital status options
interface MaritalStatusOption {
  value: string;
  label: string;
  id: number;
}

// Interface for occupation type options
interface OccupationTypeOption {
  value: string;
  label: string;
  id: number;
}

// Interface for occupation options
interface OccupationOption {
  value: string;
  label: string;
  id: number;
}


// Form validation schema
const basicInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  surname: z.string().min(1, "Surname is required"),
  otherName: z.string().optional(),
  gender: z.string().min(1, "Gender is required"), // Added gender field
  dateOfBirth: z.union([z.string(), z.date()]).refine(val => val !== undefined && val !== null && val !== "", {
    message: "Date of birth is required",
  }),  // Will handle both string (MM/DD/YYYY) and Date objects
  birthCountry: z.number().optional(),
  birthCountryName: z.string().optional(),
  birthRegion: z.number().optional(),
  birthRegionName: z.string().optional(),
  maritalStatus: z.string().min(1, "Marital status is required"),
  maritalStatusId: z.number().optional(),
  occupationType: z.string().min(1, "Occupation type is required"),
  occupationTypeId: z.number().optional(),
  occupation: z.string().optional(),
  occupationId: z.number().optional(),
  occupationDescription: z.string().optional(),
  mobileNumber: z.string().min(1, "Mobile number is required"),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export default function BasicInfoPage() {
  const router = useRouter();
  const { formData, updateFormData, isLoading, setIsLoading, showError, showSuccess } = useApplication();
  const [autoNavigateToNext, setAutoNavigateToNext] = useState(false);
  
  // Get applicationId from context only
  const applicationId = formData.applicationId || '';
  
  
  // Gender options
  const genderOptions = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
  ];

  // Define Gender type to match the expected type in ApplicationFormData
  type Gender = 'M' | 'F';
  
  // Helper function to ensure gender value is of the correct type
  const ensureValidGender = (value: string | undefined): Gender => {
    if (value === "M" || value === "F") {
      return value as Gender;
    } else if (value === "male") {
      return "M" as Gender;
    } else if (value === "female") {
      return "F" as Gender;
    }
    return "M" as Gender; // Default to M if invalid
  };

  
  // State for marital status options - initialize empty, load from API only
  const [maritalStatusOptions, setMaritalStatusOptions] = useState<MaritalStatusOption[]>([]);
  const [isLoadingMaritalStatus, setIsLoadingMaritalStatus] = useState(true);
  
  // State for occupation type options - initialize empty, load from API only
  const [occupationTypeOptions, setOccupationTypeOptions] = useState<OccupationTypeOption[]>([]);
  const [isLoadingOccupationTypes, setIsLoadingOccupationTypes] = useState(true);
  
  // State for occupation options
  const [occupationOptions, setOccupationOptions] = useState<OccupationOption[]>([]);
  const [isLoadingOccupations, setIsLoadingOccupations] = useState(false);
  const [selectedOccupationId, setSelectedOccupationId] = useState<number>(0);
  
  // State for country options
  interface CountryOption {
    value: string;
    label: string;
    id: number;
  }
  
  interface RegionOption {
    value: string;
    label: string;
    id: number;
  }
  
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  
  // State for region options
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  
  // Fetch marital status options on component mount - API data only
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchMaritalStatus = async () => {
      try {
        setIsLoadingMaritalStatus(true);
        
        const response = await verificationEndpoints.fetchMaritalStatus();
        
        if (!signal.aborted) {
          if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
            const options = response.jsonResult.map(status => ({
              value: status.HaliYaNdoa,
              label: status.HaliYaNdoa,
              id: status.MaritalStatusID
            }));
            
            setMaritalStatusOptions(options);
          } else {
            console.error("Failed to fetch marital status options:", response.ackMessage);
            setMaritalStatusOptions([]);
          }
          setIsLoadingMaritalStatus(false);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Error fetching marital status options:", error);
          setMaritalStatusOptions([]);
          setIsLoadingMaritalStatus(false);
        }
      }
    };
    
    fetchMaritalStatus();
    
    return () => controller.abort();
  }, []);
  
  // Fetch occupation types on component mount - API data only
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchOccupationTypes = async () => {
      try {
        setIsLoadingOccupationTypes(true);
        
        const response = await verificationEndpoints.fetchOccupationTypes();
        
        if (!signal.aborted) {
          if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
            const options = response.jsonResult.map(type => ({
              value: type.OccupationName || type.OccupationType || '',
              label: type.OccupationName || type.OccupationType || '',
              id: type.OccupationTypeID || type.EntryId || 0
            }));
            
            setOccupationTypeOptions(options);
          } else {
            console.error("Failed to fetch occupation types:", response.ackMessage);
            setOccupationTypeOptions([]);
          }
          setIsLoadingOccupationTypes(false);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Error fetching occupation types:", error);
          setOccupationTypeOptions([]);
          setIsLoadingOccupationTypes(false);
        }
      }
    };
    
    fetchOccupationTypes();
    
    return () => controller.abort();
  }, []);
  
  // Fetch specific occupations when occupation type is selected
  const fetchOccupationsForType = async (occupationTypeId: number) => {
    if (!occupationTypeId) return;
    
    setIsLoadingOccupations(true);
    try {
      // Use fetchOccupationsByID instead of fetchOccupations to get occupations based on occupation type ID
      const response = await verificationEndpoints.fetchOccupationsByID(occupationTypeId);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(occupation => ({
          value: occupation.OccupationName,
          label: occupation.OccupationName,
          id: occupation.OccupationID
        }));
        
        setOccupationOptions(options);
        console.log(`Loaded ${options.length} occupations for type ID ${occupationTypeId}`);
      } else {
        setOccupationOptions([]);
      }
    } catch (error) {
      console.error("Error fetching occupations:", error);
      setOccupationOptions([]);
    } finally {
      setIsLoadingOccupations(false);
    }
  };
  
  // Fetch occupations based on selected OccupationID
  const fetchOccupationsByID = async (occupationId: number) => {
    if (!occupationId) return;
    
    setIsLoadingOccupations(true);
    try {
      const response = await verificationEndpoints.fetchOccupationsByID(occupationId);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(occupation => ({
          value: occupation.OccupationName,
          label: occupation.OccupationName,
          id: occupation.OccupationID
        }));
        
        // Set the occupation options
        setOccupationOptions(options);
        
        // If we have options, select the first one by default
        if (options.length > 0) {
          form.setValue('occupation', options[0].value);
          form.setValue('occupationId', options[0].id);
        }
        
        console.log(`Loaded ${options.length} occupations for occupation ID ${occupationId}`);
      } else {
        setOccupationOptions([]);
      }
    } catch (error) {
      console.error("Error fetching occupations by ID:", error);
      setOccupationOptions([]);
    } finally {
      setIsLoadingOccupations(false);
    }
  };
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: formData.firstName || '',
      middleName: formData.middleName || '',
      surname: formData.surname || '',
      otherName: formData.otherName || '',
      gender: formData.gender || 'M', // Default to Male
      // Don't set a default value for dateOfBirth
      dateOfBirth: formData.dateOfBirth || '',
      birthCountry: formData.birthCountry || 0,
      birthCountryName: formData.birthCountryName || '',
      birthRegion: formData.birthRegion || 0,
      birthRegionName: formData.birthRegionName || '',
      maritalStatus: formData.maritalStatus || '',
      maritalStatusId: formData.maritalStatusId || 0,
      occupationType: formData.occupationType || '',
      occupationTypeId: formData.occupationTypeId || 0,
      occupation: formData.occupation || '',
      occupationId: formData.occupationId || 0,
      occupationDescription: formData.occupationDescription || '',
      mobileNumber: formData.mobileNumber || '',
    },
  });
  
  // Effect to fetch occupations when occupationTypeId changes
  useEffect(() => {
    const occupationTypeId = form.getValues().occupationTypeId;
    if (occupationTypeId) {
      fetchOccupationsForType(occupationTypeId);
    }
    
    // Fetch countries on component mount
    fetchCountries();
    
    // If birthCountry is set, fetch regions for that country
    const birthCountry = form.getValues().birthCountry;
    if (birthCountry) {
      fetchRegionsForCountry(birthCountry);
    }
  }, []);  // Run only once on component mount
  
  // Fetch countries from API
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
        console.log(`Loaded ${options.length} countries`);
      } else {
        setCountryOptions([]);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountryOptions([]);
    } finally {
      setIsLoadingCountries(false);
    }
  };
  
  // Fetch regions for a country
  const fetchRegionsForCountry = async (countryId: number) => {
    console.log('fetchRegionsForCountry called with countryId:', countryId);
    if (!countryId) {
      console.log('No countryId provided, returning early');
      return;
    }
    
    setIsLoadingRegions(true);
    try {
      console.log('Calling verificationEndpoints.fetchRegions with countryId:', countryId);
      const response = await verificationEndpoints.fetchRegions(countryId);
      console.log('Raw API response for regions:', response);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        console.log('Region results from API:', response.jsonResult);
        console.log('First region object keys:', Object.keys(response.jsonResult[0]));
        
        // Check if the API is returning a different property name for the ID
        const firstRegion = response.jsonResult[0];
        console.log('First region EntryId:', firstRegion.EntryId);
        console.log('First region ID:', firstRegion.ID);
        console.log('First region Id:', firstRegion.Id);
        console.log('First region id:', firstRegion.id);
        console.log('First region RegionID:', firstRegion.RegionID);
        console.log('First region RegionId:', firstRegion.RegionId);
        
        // Determine the correct ID property name
        let idPropertyName = 'EntryId';
        if (firstRegion.EntryId !== undefined) {
          idPropertyName = 'EntryId';
        } else if (firstRegion.ID !== undefined) {
          idPropertyName = 'ID';
        } else if (firstRegion.Id !== undefined) {
          idPropertyName = 'Id';
        } else if (firstRegion.id !== undefined) {
          idPropertyName = 'id';
        } else if (firstRegion.RegionID !== undefined) {
          idPropertyName = 'RegionID';
        } else if (firstRegion.RegionId !== undefined) {
          idPropertyName = 'RegionId';
        }
        
        console.log('Using ID property name:', idPropertyName);
        
        const options = response.jsonResult.map(region => {
          console.log('Processing region:', region);
          
          // Check for EntryID (uppercase ID) first, then fall back to other property names
          const regionId = region.EntryID !== undefined ? region.EntryID : 
                          region.EntryId !== undefined ? region.EntryId :
                          region.ID !== undefined ? region.ID :
                          region.Id !== undefined ? region.Id :
                          region.id !== undefined ? region.id :
                          region.RegionID !== undefined ? region.RegionID :
                          region.RegionId !== undefined ? region.RegionId : 0;
          
          console.log(`Region ${region.RegionName} ID:`, regionId);
          
          return {
            value: region.RegionName,
            label: region.RegionName,
            id: regionId
          };
        });
        
        console.log('Mapped region options:', options);
        setRegionOptions(options);
        console.log(`Loaded ${options.length} regions for country ID ${countryId}`);
      } else {
        console.log('No regions found or invalid response:', response);
        setRegionOptions([]);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      setRegionOptions([]);
    } finally {
      setIsLoadingRegions(false);
    }
  };
  
  // Handle save and exit
  const handleSaveAndExit = () => {
    const formValues = form.getValues();
    console.log('Save and exit - form values:', formValues);
    
    // Find the selected marital status option to ensure we have the correct ID
    const selectedMaritalStatus = maritalStatusOptions.find(opt => opt.value === formValues.maritalStatus);
    console.log('Selected marital status option for save:', selectedMaritalStatus);
    
    // Find the selected occupation type option to ensure we have the correct ID
    const selectedOccupationType = occupationTypeOptions.find(opt => opt.value === formValues.occupationType);
    console.log('Selected occupation type option for save:', selectedOccupationType);
    
    // Find the selected occupation option to ensure we have the correct ID
    const selectedOccupation = occupationOptions.find(opt => opt.value === formValues.occupation);
    console.log('Selected occupation option for save:', selectedOccupation);
    
    // Convert date string to Date object
    const data = {
      ...formValues,
      // Keep the date as is - our custom component will handle the formatting
      dateOfBirth: formValues.dateOfBirth || undefined,
      // Map surname to lastName for compatibility with existing code
      lastName: formValues.surname,
      // Explicitly include gender field with proper validation
      gender: ensureValidGender(formValues.gender),
      // Include the country and region fields
      birthCountry: formValues.birthCountry || 0,
      birthCountryName: formValues.birthCountryName || '',
      birthRegion: formValues.birthRegion || 0,
      birthRegionName: formValues.birthRegionName || '',
      // Include the marital status fields
      maritalStatusId: selectedMaritalStatus ? selectedMaritalStatus.id : (formValues.maritalStatusId || 0),
      // Include the occupation fields
      occupationTypeId: selectedOccupationType ? selectedOccupationType.id : (formValues.occupationTypeId || 0),
      occupationId: selectedOccupation ? selectedOccupation.id : (formValues.occupationId || 0),
      occupationDescription: formValues.occupationDescription || '',
      occupationDetail: formValues.occupationDescription || ''
    } as const;
    
    console.log('Save and exit - final data with maritalStatusId:', data.maritalStatusId);
    updateFormData(data);
    router.push('/application');
  };
  
  // Handle form submission
  const onSubmit = async (formValues: BasicInfoFormValues) => {
    setIsLoading(true);
    try {
      console.log('Raw form values before submission:', formValues);
      
      // Find the selected marital status option to ensure we have the correct ID
      const selectedMaritalStatus = maritalStatusOptions.find(opt => opt.value === formValues.maritalStatus);
      console.log('Selected marital status option:', selectedMaritalStatus);
      
      // Find the selected occupation type option to ensure we have the correct ID
      const selectedOccupationType = occupationTypeOptions.find(opt => opt.value === formValues.occupationType);
      console.log('Selected occupation type option:', selectedOccupationType);
      
      // Find the selected occupation option to ensure we have the correct ID
      const selectedOccupation = occupationOptions.find(opt => opt.value === formValues.occupation);
      console.log('Selected occupation option:', selectedOccupation);
      
      // Convert date string to Date object
      const data = {
        ...formValues,
        // Keep the date as is - our custom component will handle the formatting
        dateOfBirth: formValues.dateOfBirth || undefined,
        // Map surname to lastName for compatibility with existing code
        lastName: formValues.surname,
        // Explicitly include gender field with proper validation
        gender: ensureValidGender(formValues.gender),
        // Include the country and region fields
        birthCountry: formValues.birthCountry || 0,
        birthCountryName: formValues.birthCountryName || '',
        birthRegion: formValues.birthRegion || 0,
        birthRegionName: formValues.birthRegionName || '',
        // Include the marital status fields
        maritalStatusId: selectedMaritalStatus ? selectedMaritalStatus.id : (formValues.maritalStatusId || 0),
        // Include the occupation fields
        occupationTypeId: selectedOccupationType ? selectedOccupationType.id : (formValues.occupationTypeId || 0),
        occupationId: selectedOccupation ? selectedOccupation.id : (formValues.occupationId || 0),
        occupationDescription: formValues.occupationDescription || '',
        occupationDetail: formValues.occupationDescription || ''
      } as const;
      
      console.log('Submitting form data:', data);
      console.log('Final maritalStatusId being sent:', data.maritalStatusId);
      updateFormData(data);
      
      // Call the API to submit personal info
      const response = await personalInfoEndpoints.submitPersonalInfo(applicationId, data);
      
      if (response.ackCode === 1) {
        // Success - show success message
        showSuccess("Taarifa zako zimehifadhiwa kikamilifu");
        // The ApplicationLayout will handle the navigation automatically
        setIsLoading(false);
        // Set autoNavigateToNext state to true
        setAutoNavigateToNext(true);
      } else {
        // Handle error
        showError(response.ackMessage || "Kuna hitilafu imetokea wakati wa kuhifadhi taarifa zako");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error submitting personal info:", error);
      showError(error.message || "Kuna hitilafu imetokea wakati wa kuhifadhi taarifa zako");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ApplicationLayout 
      title="Taarifa Binafsi" 
      subtitle="Taarifa zako binafsi"
      applicationId={applicationId}
      currentStep="habari-binafsi"
      autoNavigateToNext={autoNavigateToNext}
    >
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Taarifa Binafsi Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jina la Kwanza <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Jina la Kwanza" 
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jina la Kati</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Jina la Kati" 
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jina la Ukoo <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Jina la Ukoo" 
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Utambulisho Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium border-b pb-2 mb-4">Utambulisho</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="otherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jina Lingine</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Jina Lingine (kama lipo)" 
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jinsia <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <SelectValue placeholder="Chagua Jinsia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <CustomDateInput
                    field={field}
                    label="Tarehe ya Kuzaliwa"
                    required={true}
                    id="dateOfBirth"
                  />
                )}
              />
              
              <FormField
                control={form.control}
                name="birthCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        console.log('Country options:', countryOptions);
                        console.log('Selected country value:', value);
                        
                        // Case-insensitive search for the country option
                        const selectedOption = countryOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        console.log('Selected country option:', selectedOption);
                        
                        if (selectedOption) {
                          // Update both the country name and ID fields
                          field.onChange(selectedOption.id);
                          form.setValue('birthCountryName', selectedOption.value);
                          
                         form.setValue('birthRegion', 0);
                          form.setValue('birthRegionName', '');
                          
                          console.log('Fetching regions for country ID:', selectedOption.id);
                          fetchRegionsForCountry(selectedOption.id);
                          
                          console.log(`Selected country: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          console.log('No matching country option found for:', value);
                          field.onChange(0);
                          form.setValue('birthCountryName', '');
                        }
                      }} 
                      value={form.getValues().birthCountryName || ""}
                      disabled={isLoadingCountries}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <SelectValue placeholder="Chagua Nchi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="birthRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Mkoa wa Kuzaliwa</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                         const selectedOption = regionOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        console.log('Selected region option:', selectedOption);
                        
                        if (selectedOption) {
                          // Get the ID, with fallback to a generated ID if undefined
                          const regionId = selectedOption.id !== undefined ? 
                            selectedOption.id : 
                            // Generate a numeric ID based on the region name as fallback
                            value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          
                          // Update both the region name and ID fields
                          field.onChange(regionId);
                          form.setValue('birthRegionName', selectedOption.value);
                          console.log(`Selected region: ${value}, ID: ${regionId} (${selectedOption.id === undefined ? 'generated fallback' : 'from API'})`);
                        } else {
                          console.log('No matching region option found for:', value);
                          field.onChange(0);
                          form.setValue('birthRegionName', '');
                        }
                      }} 
                      value={form.getValues().birthRegionName || ""}
                      disabled={isLoadingRegions || form.getValues().birthCountry === 0 || regionOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <SelectValue placeholder="Chagua Mkoa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Hali ya Ndoa <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = maritalStatusOptions.find(opt => opt.value === value);
                        if (selectedOption) {
                          // Update both the maritalStatus and maritalStatusId fields
                          field.onChange(value);
                          // Ensure maritalStatusId is set as a number
                          const maritalStatusId = Number(selectedOption.id);
                          form.setValue('maritalStatusId', maritalStatusId);
                          console.log(`Selected marital status: ${value}, ID: ${maritalStatusId}`);
                          
                          // Force the form to recognize the maritalStatusId change
                          setTimeout(() => {
                            const currentValues = form.getValues();
                            console.log('Current form values after selection:', currentValues);
                            console.log('Current maritalStatusId:', currentValues.maritalStatusId);
                          }, 100);
                        } else {
                          field.onChange(value);
                        }
                      }} 
                      value={field.value || ""}
                      disabled={isLoadingMaritalStatus}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <SelectValue placeholder="Chagua Hali ya Ndoa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Tarehe na Mahali pa Kuzaliwa Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium border-b pb-2 mb-4">Taarifa za kazi na mawasiliano</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="occupationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Aina ya Kazi <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = occupationTypeOptions.find(opt => opt.value === value);
                        if (selectedOption) {
                          // Update both the occupationType and occupationTypeId fields
                          field.onChange(value);
                          form.setValue('occupationTypeId', selectedOption.id);
                          
                          // Clear the occupation field
                          form.setValue('occupation', '');
                          form.setValue('occupationId', 0);
                          
                          // Fetch occupations for this type using the selected occupation type ID
                          fetchOccupationsForType(selectedOption.id);
                          
                          console.log(`Selected occupation type: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                        }
                      }} 
                      value={field.value || ""}
                      disabled={isLoadingOccupationTypes}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <SelectValue placeholder="Chagua Aina ya Kazi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Kazi <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = occupationOptions.find(opt => opt.value === value);
                        if (selectedOption) {
                          // Update both the occupation and occupationId fields
                          field.onChange(value);
                          form.setValue('occupationId', selectedOption.id);
                          setSelectedOccupationId(selectedOption.id);
                          console.log(`Selected occupation: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                        }
                      }} 
                      value={field.value || ""}
                      disabled={isLoadingOccupations}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <SelectValue placeholder="Chagua Kazi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingOccupations ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : occupationOptions.length > 0 ? (
                          occupationOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>Hakuna kazi zilizopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="occupationDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Maelezo ya Kazi</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Andika maelezo ya kazi yako" 
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Namba ya Simu <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Mfano: 0712345678" 
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div> 
          {/* Buttons Section */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex justify-between">
            <Button 
              type="button" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-2 rounded flex items-center"
              onClick={handleSaveAndExit}
            >
              <Save className="mr-2 h-4 w-4" />
              Hifadhi na Toka
            </Button>
            <LoadingButton 
              type="submit" 
              isLoading={isLoading}
              loadingText="Inaendelea..."
              spinnerVariant="primary"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Hifadhi na Endelea
            </LoadingButton>
          </div>
        </form>
      </Form>
    </ApplicationLayout>
  );
}
