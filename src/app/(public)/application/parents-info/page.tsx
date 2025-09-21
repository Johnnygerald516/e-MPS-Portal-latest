"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Users, ArrowRight, Calendar, Globe, Save } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from "@/components/application/ApplicationLayout";
import { parentsInfoEndpoints } from "@/lib/api";
import { verificationEndpoints } from "@/lib/api/endpoints/verification";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { format } from "date-fns";
import { DatePickerFormField } from "@/components/ui/date-picker-form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types for country and region options
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

// Form validation schema
const parentsInfoSchema = z.object({
  // Father's information
  fatherName: z.string().min(1, "Father's name is required"),
  fatherDateOfBirth: z.string().min(1, "Father's date of birth is required"),
  
  // Father's birth information
  fatherCountryOfBirth: z.string().min(1, "Father's country of birth is required"),
  fatherCountryId: z.number().optional(),
  fatherCountryName: z.string().optional(),
  fatherRegionOfBirth: z.string().min(1, "Father's region of birth is required"),
  fatherRegionId: z.number().optional(),
  fatherRegionName: z.string().optional(),
  
  // Father's residence information
  fatherCountryOfResidence: z.string().min(1, "Father's country of residence is required"),
  fatherCountryOfResidenceId: z.number().optional(),
  fatherCountryOfResidenceName: z.string().optional(),
  
  // Father's nationality
  fatherNationality: z.string().min(1, "Father's nationality is required"),
  fatherNationalityId: z.number().optional(),
  fatherNationalityName: z.string().optional(),
  
  // Mother's information
  motherName: z.string().min(1, "Mother's name is required"),
  motherDateOfBirth: z.string().min(1, "Mother's date of birth is required"),
  
  // Mother's birth information
  motherCountryOfBirth: z.string().min(1, "Mother's country of birth is required"),
  motherCountryId: z.number().optional(),
  motherCountryName: z.string().optional(),
  motherRegionOfBirth: z.string().min(1, "Mother's region of birth is required"),
  motherRegionId: z.number().optional(),
  motherRegionName: z.string().optional(),
  
  // Mother's residence information
  motherCountryOfResidence: z.string().min(1, "Mother's country of residence is required"),
  motherCountryOfResidenceId: z.number().optional(),
  motherCountryOfResidenceName: z.string().optional(),
  
  // Mother's nationality
  motherNationality: z.string().min(1, "Mother's nationality is required"),
  motherNationalityId: z.number().optional(),
  motherNationalityName: z.string().optional(),
});

type ParentsInfoFormValues = z.infer<typeof parentsInfoSchema>;

function ParentsInfoContent() {
  const router = useRouter();
  const { formData, updateFormData, isLoading, setIsLoading } = useApplication();
  const { showError, showSuccess } = useCustomToast();
  const [autoNavigateToNext, setAutoNavigateToNext] = useState(false);
  
  // Get applicationId from context instead of URL parameters
  const applicationId = formData.applicationId || '';
  
  // State for father's country and region options
  const [fatherCountryOptions, setFatherCountryOptions] = useState<CountryOption[]>([]);
  const [fatherRegionOptions, setFatherRegionOptions] = useState<RegionOption[]>([]);
  const [fatherCountryOfResidenceOptions, setFatherCountryOfResidenceOptions] = useState<CountryOption[]>([]);
  const [fatherNationalityOptions, setFatherNationalityOptions] = useState<CountryOption[]>([]);
  
  // State for mother's country and region options
  const [motherCountryOptions, setMotherCountryOptions] = useState<CountryOption[]>([]);
  const [motherRegionOptions, setMotherRegionOptions] = useState<RegionOption[]>([]);
  const [motherCountryOfResidenceOptions, setMotherCountryOfResidenceOptions] = useState<CountryOption[]>([]);
  const [motherNationalityOptions, setMotherNationalityOptions] = useState<CountryOption[]>([]);
  
  // Loading states
  const [isLoadingFatherCountries, setIsLoadingFatherCountries] = useState(false);
  const [isLoadingFatherRegions, setIsLoadingFatherRegions] = useState(false);
  const [isLoadingFatherCountryOfResidence, setIsLoadingFatherCountryOfResidence] = useState(false);
  const [isLoadingFatherNationality, setIsLoadingFatherNationality] = useState(false);
  
  const [isLoadingMotherCountries, setIsLoadingMotherCountries] = useState(false);
  const [isLoadingMotherRegions, setIsLoadingMotherRegions] = useState(false);
  const [isLoadingMotherCountryOfResidence, setIsLoadingMotherCountryOfResidence] = useState(false);
  const [isLoadingMotherNationality, setIsLoadingMotherNationality] = useState(false);
  
  // Helper function to ensure valid ID
  const ensureValidId = (value: any): number => {
    const numValue = Number(value);
    return isNaN(numValue) ? 0 : numValue;
  };
  
  // Helper function to format and validate dates
  const formatValidDate = (date: any): string => {
    if (!date) return '';
    
    // If it's already a string, check if it's a valid date format
    if (typeof date === 'string') {
      // Check for invalid years like 0001, 0002
      if (date.startsWith('000')) {
        // Replace with current year
        const currentYear = new Date().getFullYear();
        return `${currentYear}${date.substring(4)}`;
      }
      return date;
    }
    
    // If it's a Date object
    if (date instanceof Date) {
      const year = date.getFullYear();
      // Check if year is too low (likely invalid)
      if (year < 1900) {
        const currentYear = new Date().getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${currentYear}-${month}-${day}`;
      }
      return date.toISOString().split('T')[0];
    }
    
    return '';
  };
  
  // Fetch countries from API
  const fetchCountries = async (setOptions: React.Dispatch<React.SetStateAction<CountryOption[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoading(true);
    try {
      const response = await verificationEndpoints.fetchCountries();
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(country => ({
          value: country.CountryName,
          label: country.CountryName,
          id: country.EntryId
        }));
        
        setOptions(options);
        console.log(`Loaded ${options.length} countries`);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch nationalities from API
  const fetchNationalities = async (setOptions: React.Dispatch<React.SetStateAction<CountryOption[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoading(true);
    try {
      // Use the lookup endpoint with nationality operation type
      const payload = {
        operationType: "nationality",
        argument1: 1,
        argument2: 0
      };
      
      const response = await verificationEndpoints.fetchLookup(payload);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        // Create a map to track duplicate nationalities
        const nationalityMap = new Map<string, number>();
        
        const options = response.jsonResult.map((nationality: any) => {
          const nationalityValue = nationality.Nationality || "";
          
          // Skip empty values
          if (!nationalityValue) return null;
          
          // Create a unique value for duplicates by appending the EntryId
          const uniqueValue = nationalityValue + `-${nationality.EntryId}`;
          
          return {
            value: uniqueValue,
            label: nationalityValue,
            id: nationality.EntryId || 0
          };
        }).filter(Boolean) as CountryOption[];
        
        setOptions(options);
        console.log(`Loaded ${options.length} nationalities`);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error fetching nationalities:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch countries of residence from API
  const fetchCountriesOfResidence = async (setOptions: React.Dispatch<React.SetStateAction<CountryOption[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    setLoading(true);
    try {
      // Use the lookup endpoint with country operation type
      const payload = {
        operationType: "country",
        argument1: 1,
        argument2: 0
      };
      
      const response = await verificationEndpoints.fetchLookup(payload);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map((country: any) => ({
          value: country.CountryName || "",
          label: country.CountryName || "",
          id: country.EntryId || 0
        }));
        
        setOptions(options);
        console.log(`Loaded ${options.length} countries of residence`);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error fetching countries of residence:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch regions for a country
  const fetchRegionsForCountry = async (
    countryId: number, 
    setOptions: React.Dispatch<React.SetStateAction<RegionOption[]>>, 
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!countryId) return;
    
    setLoading(true);
    try {
      const response = await verificationEndpoints.fetchRegions(countryId);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(region => {
          // Check for EntryID (uppercase ID) first, then fall back to other property names
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
        
        setOptions(options);
        console.log(`Loaded ${options.length} regions for country ID ${countryId}`);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch countries on component mount
  useEffect(() => {
    // Fetch countries of birth
    fetchCountries(setFatherCountryOptions, setIsLoadingFatherCountries);
    fetchCountries(setMotherCountryOptions, setIsLoadingMotherCountries);
    
    // Fetch countries of residence
    fetchCountriesOfResidence(setFatherCountryOfResidenceOptions, setIsLoadingFatherCountryOfResidence);
    fetchCountriesOfResidence(setMotherCountryOfResidenceOptions, setIsLoadingMotherCountryOfResidence);
    
    // Fetch nationalities
    fetchNationalities(setFatherNationalityOptions, setIsLoadingFatherNationality);
    fetchNationalities(setMotherNationalityOptions, setIsLoadingMotherNationality);
  }, []);
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<ParentsInfoFormValues>({
    resolver: zodResolver(parentsInfoSchema),
    defaultValues: {
      // Father's information
      fatherName: formData.fatherName || "",
      fatherDateOfBirth: formData.fatherDateOfBirth ? new Date(formData.fatherDateOfBirth).toISOString().split('T')[0] : "",
      
      // Father's birth information
      fatherCountryOfBirth: formData.fatherCountryOfBirth || "",
      fatherCountryId: formData.fatherCountryId || 0,
      fatherCountryName: formData.fatherCountryName || "",
      fatherRegionOfBirth: formData.fatherRegionOfBirth || "",
      fatherRegionId: formData.fatherRegionId || 0,
      fatherRegionName: formData.fatherRegionName || "",
      
      // Father's residence information
      fatherCountryOfResidence: "",
      fatherCountryOfResidenceId: 0,
      fatherCountryOfResidenceName: "",
      
      // Father's nationality
      fatherNationality: formData.fatherNationality || "",
      fatherNationalityId: 0,
      fatherNationalityName: "",
      
      // Mother's information
      motherName: formData.motherName || "",
      motherDateOfBirth: formData.motherDateOfBirth ? new Date(formData.motherDateOfBirth).toISOString().split('T')[0] : "",
      
      // Mother's birth information
      motherCountryOfBirth: formData.motherCountryOfBirth || "",
      motherCountryId: formData.motherCountryId || 0,
      motherCountryName: formData.motherCountryName || "",
      motherRegionOfBirth: formData.motherRegionOfBirth || "",
      motherRegionId: formData.motherRegionId || 0,
      motherRegionName: formData.motherRegionName || "",
      
      // Mother's residence information
      motherCountryOfResidence: "",
      motherCountryOfResidenceId: 0,
      motherCountryOfResidenceName: "",
      
      // Mother's nationality
      motherNationality: formData.motherNationality || "",
      motherNationalityId: 0,
      motherNationalityName: "",
    },
  });
  
  // Handle save and exit
  const handleSaveAndExit = () => {
    const formValues = form.getValues();
    // Convert date strings to Date objects
    const data = {
      ...formValues,
      fatherDateOfBirth: formValues.fatherDateOfBirth ? new Date(formValues.fatherDateOfBirth) : new Date(),
      motherDateOfBirth: formValues.motherDateOfBirth ? new Date(formValues.motherDateOfBirth) : new Date(),
      // Ensure IDs are numbers
      fatherCountryId: ensureValidId(formValues.fatherCountryId),
      fatherRegionId: ensureValidId(formValues.fatherRegionId),
      motherCountryId: ensureValidId(formValues.motherCountryId),
      motherRegionId: ensureValidId(formValues.motherRegionId),
    };
    
    console.log('Save and exit - data:', data);
    updateFormData(data);
    router.push('/application');
  };
  
  // Handle form submission
  const onSubmit = async (formValues: ParentsInfoFormValues) => {
    setIsLoading(true);
    try {
      // Validate required fields
      const requiredFields = [
        { name: 'fatherName', label: "Father's name" },
        { name: 'fatherDateOfBirth', label: "Father's date of birth" },
        { name: 'fatherCountryOfBirth', label: "Father's country of birth" },
        { name: 'fatherRegionOfBirth', label: "Father's region of birth" },
        { name: 'fatherCountryOfResidence', label: "Father's country of residence" },
        { name: 'fatherNationality', label: "Father's nationality" },
        { name: 'motherName', label: "Mother's name" },
        { name: 'motherDateOfBirth', label: "Mother's date of birth" },
        { name: 'motherCountryOfBirth', label: "Mother's country of birth" },
        { name: 'motherRegionOfBirth', label: "Mother's region of birth" },
        { name: 'motherCountryOfResidence', label: "Mother's country of residence" },
        { name: 'motherNationality', label: "Mother's nationality" },
      ];
      
      // Check for empty required fields
      const emptyFields = requiredFields.filter(field => !formValues[field.name as keyof ParentsInfoFormValues]);
      
      if (emptyFields.length > 0) {
        const missingFieldsMessage = emptyFields.map(f => f.label).join(', ');
        showError({
          description: `Please fill in all required fields: ${missingFieldsMessage}`
        });
        setIsLoading(false);
        return;
      }
      
      // Check for missing IDs
      if (!formValues.fatherCountryId || !formValues.fatherRegionId || 
          !formValues.fatherCountryOfResidenceId || !formValues.fatherNationalityId || 
          !formValues.motherCountryId || !formValues.motherRegionId || 
          !formValues.motherCountryOfResidenceId || !formValues.motherNationalityId) {
        showError({
          description: "Please select valid options for all dropdown fields"
        });
        setIsLoading(false);
        return;
      }
      
      // Convert date strings to Date objects
      const data = {
        ...formValues,
        fatherDateOfBirth: formValues.fatherDateOfBirth ? new Date(formValues.fatherDateOfBirth) : new Date(),
        motherDateOfBirth: formValues.motherDateOfBirth ? new Date(formValues.motherDateOfBirth) : new Date(),
        // Ensure IDs are numbers
        fatherCountryId: ensureValidId(formValues.fatherCountryId),
        fatherRegionId: ensureValidId(formValues.fatherRegionId),
        fatherCountryOfResidenceId: ensureValidId(formValues.fatherCountryOfResidenceId),
        fatherNationalityId: ensureValidId(formValues.fatherNationalityId),
        motherCountryId: ensureValidId(formValues.motherCountryId),
        motherRegionId: ensureValidId(formValues.motherRegionId),
        motherCountryOfResidenceId: ensureValidId(formValues.motherCountryOfResidenceId),
        motherNationalityId: ensureValidId(formValues.motherNationalityId),
        // Map field names to match API requirements
        fatherFullName: formValues.fatherName,
        motherFullName: formValues.motherName,
      };
      
      console.log('Form submission data:', data);
      updateFormData(data);
      
      // Log the form values to verify IDs
      console.log('Form values before API payload preparation:', {
        fatherCountryId: formValues.fatherCountryId,
        fatherRegionId: formValues.fatherRegionId,
        fatherCountryOfResidenceId: formValues.fatherCountryOfResidenceId,
        fatherNationalityId: formValues.fatherNationalityId,
        motherCountryId: formValues.motherCountryId,
        motherRegionId: formValues.motherRegionId,
        motherCountryOfResidenceId: formValues.motherCountryOfResidenceId,
        motherNationalityId: formValues.motherNationalityId
      });
      
      // Log the raw date values from the form to debug
      console.log('Raw father date of birth from form:', formValues.fatherDateOfBirth);
      console.log('Raw mother date of birth from form:', formValues.motherDateOfBirth);
      
      // Get the date values directly from the form values, not from the converted data object
      const fatherDOB = formValues.fatherDateOfBirth || '';
      const motherDOB = formValues.motherDateOfBirth || '';
      
      console.log('Father DOB to be used in API payload:', fatherDOB);
      console.log('Mother DOB to be used in API payload:', motherDOB);
      
      // Prepare API payload according to the required format
      const apiPayload = {
        fatherFullName: String(data.fatherName || ''),
        // Use the raw date string from the form values
        fatherDateOfBirth: fatherDOB,
        // Use the exact IDs from the form values
        fatherCountryOfBirthId: Number(formValues.fatherCountryId) || 0,
        fatherCountryOfResidentId: Number(formValues.fatherCountryOfResidenceId) || 0,
        fatherNationalityId: Number(formValues.fatherNationalityId) || 0,
        fatherRegionOfBirthId: Number(formValues.fatherRegionId) || 0,
        motherFullName: String(data.motherName || ''),
        // Use the raw date string from the form values
        motherDateOfBirth: motherDOB,
        motherRegionOfBirthId: Number(formValues.motherRegionId) || 0,
        motherCountryOfBirthId: Number(formValues.motherCountryId) || 0,
        motherCountryOfResidentId: Number(formValues.motherCountryOfResidenceId) || 0,
        motherNationalityId: Number(formValues.motherNationalityId) || 0
      };
      
      // Final validation to ensure no zero values in required ID fields
      const requiredIds = [
        { name: 'fatherCountryOfBirthId', label: "Father's country of birth" },
        { name: 'fatherCountryOfResidentId', label: "Father's country of residence" },
        { name: 'fatherNationalityId', label: "Father's nationality" },
        { name: 'fatherRegionOfBirthId', label: "Father's region of birth" },
        { name: 'motherCountryOfBirthId', label: "Mother's country of birth" },
        { name: 'motherRegionOfBirthId', label: "Mother's region of birth" },
        { name: 'motherCountryOfResidentId', label: "Mother's country of residence" },
        { name: 'motherNationalityId', label: "Mother's nationality" },
      ];
      
      const missingIds = requiredIds.filter(field => !apiPayload[field.name as keyof typeof apiPayload]);
      
      if (missingIds.length > 0) {
        const missingFieldsMessage = missingIds.map(f => f.label).join(', ');
        showError({
          description: `Please select valid options for: ${missingFieldsMessage}`
        });
        setIsLoading(false);
        return;
      }
      
      console.log('API payload:', apiPayload);
      
      // Call the API to submit parents info
      const response = await parentsInfoEndpoints.submitParentsInfo(applicationId, apiPayload);
      
      if (response.ackCode === 1) {
        // Success - show success message
        showSuccess({
          description: "Taarifa za wazazi zimehifadhiwa kikamilifu"
        });
        // Set autoNavigateToNext to true to trigger automatic navigation
        setIsLoading(false);
        setAutoNavigateToNext(true);
      } else {
        // Handle error
        showError({
          description: response.ackMessage || "An error occurred while submitting your information"
        });
      }
    } catch (error: any) {
      console.error("Error submitting parents info:", error);
      showError({
        description: error.message || "An error occurred while submitting your information"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ApplicationLayout 
      title="Parents Information" 
      subtitle="Enter your parents' details"
      applicationId={applicationId}
      currentStep="habari-za-wazazi"
      autoNavigateToNext={autoNavigateToNext}
    >
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Father's Information Section */}
          <div className="mb-8 p-4 rounded-md  border border-slate-100 shadow-sm">
            
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <Users className="h-5 w-5 text-violet-800" />
              <h3 className="text-lg font-medium text-slate-600">Taarifa za Baba</h3>
            </div>
               {/* Father's Name, Country of Residence, and Nationality in one row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jina Kamili la Baba <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ingiza jina kamili la baba" 
                        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fatherCountryOfResidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Makazi <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = fatherCountryOfResidenceOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the country name and ID fields
                          field.onChange(value);
                          // Store the numeric ID for API submission
                          const countryId = selectedOption.id;
                          form.setValue('fatherCountryOfResidenceId', countryId);
                          form.setValue('fatherCountryOfResidenceName', selectedOption.value);
                          
                          console.log(`Selected father's country of residence: ${value}, ID: ${countryId}`);
                        } else {
                          field.onChange(value);
                          form.setValue('fatherCountryOfResidenceId', 0);
                          form.setValue('fatherCountryOfResidenceName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingFatherCountryOfResidence}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Nchi ya Makazi" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingFatherCountryOfResidence ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : fatherCountryOfResidenceOptions.length > 0 ? (
                          fatherCountryOfResidenceOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value || `residence-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_residence_countries_found" disabled>Hakuna nchi zilizopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fatherNationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Uraia <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = fatherNationalityOptions.find(
                          opt => opt.value === value
                        );
                        
                        if (selectedOption) {
                          // Update both the nationality name and ID fields
                          field.onChange(value);
                          // Store the numeric ID for API submission
                          const nationalityId = selectedOption.id;
                          form.setValue('fatherNationalityId', nationalityId);
                          form.setValue('fatherNationalityName', selectedOption.label);
                          
                          console.log(`Selected father's nationality: ${selectedOption.label}, ID: ${nationalityId}`);
                        } else {
                          field.onChange(value);
                          form.setValue('fatherNationalityId', 0);
                          form.setValue('fatherNationalityName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingFatherNationality}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Uraia" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingFatherNationality ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : fatherNationalityOptions.length > 0 ? (
                          fatherNationalityOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value || `nationality-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_nationality_found" disabled>Hakuna uraia uliopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Father's Date of Birth, Country of Birth, Region of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name="fatherDateOfBirth"
                render={({ field }) => (
                  <DatePickerFormField
                    field={field}
                    label="Tarehe ya Kuzaliwa"
                    required={true}
                    placeholder="Chagua tarehe ya kuzaliwa"
                  />
                )}
              />
              
              <FormField
                control={form.control}
                name="fatherCountryOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nchi ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = fatherCountryOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the country name and ID fields
                          field.onChange(value);
                          // Store the numeric ID for API submission
                          form.setValue('fatherCountryId', selectedOption.id);
                          form.setValue('fatherCountryName', selectedOption.value);
                          
                          // Clear the region fields
                          form.setValue('fatherRegionOfBirth', '');
                          form.setValue('fatherRegionId', 0);
                          form.setValue('fatherRegionName', '');
                          
                          // Fetch regions for this country
                          fetchRegionsForCountry(selectedOption.id, setFatherRegionOptions, setIsLoadingFatherRegions);
                          
                          console.log(`Selected father's country: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                          form.setValue('fatherCountryId', 0);
                          form.setValue('fatherCountryName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingFatherCountries}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Nchi" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingFatherCountries ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : fatherCountryOptions.length > 0 ? (
                          fatherCountryOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value || `country-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_countries_found" disabled>Hakuna nchi zilizopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fatherRegionOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mkoa wa Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = fatherRegionOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the region name and ID fields
                          field.onChange(value);
                          form.setValue('fatherRegionId', selectedOption.id);
                          form.setValue('fatherRegionName', selectedOption.value);
                          
                          console.log(`Selected father's region: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                          form.setValue('fatherRegionId', 0);
                          form.setValue('fatherRegionName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingFatherRegions || form.getValues().fatherCountryId === 0 || fatherRegionOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <SelectValue placeholder="Chagua Mkoa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingFatherRegions ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : fatherRegionOptions.length > 0 ? (
                          fatherRegionOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value || `region-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_regions_found" disabled>Hakuna mikoa iliyopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            
            </div>
          
          {/* Mother's Information */}
          <div className="p-4 rounded-md  border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-2"> 
              <Users className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-slate-600">Taarifa za Mama</h3>
            </div>
            
            {/* Mother's Name, Country of Residence, and Nationality in one row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jina Kamili la Mama <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ingiza jina kamili la mama" 
                        className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="motherCountryOfResidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Makazi <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = motherCountryOfResidenceOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the country name and ID fields
                          field.onChange(value);
                          // Store the numeric ID for API submission
                          const countryId = selectedOption.id;
                          form.setValue('motherCountryOfResidenceId', countryId);
                          form.setValue('motherCountryOfResidenceName', selectedOption.value);
                          
                          console.log(`Selected mother's country of residence: ${value}, ID: ${countryId}`);
                        } else {
                          field.onChange(value);
                          form.setValue('motherCountryOfResidenceId', 0);
                          form.setValue('motherCountryOfResidenceName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingMotherCountryOfResidence}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Nchi ya Makazi" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingMotherCountryOfResidence ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : motherCountryOfResidenceOptions.length > 0 ? (
                          motherCountryOfResidenceOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value || `mother-residence-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_mother_residence_found" disabled>Hakuna nchi zilizopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="motherNationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Uraia <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = motherNationalityOptions.find(
                          opt => opt.value === value
                        );
                        
                        if (selectedOption) {
                          // Update both the nationality name and ID fields
                          field.onChange(value);
                          // Store the numeric ID for API submission
                          const nationalityId = selectedOption.id;
                          form.setValue('motherNationalityId', nationalityId);
                          form.setValue('motherNationalityName', selectedOption.label);
                          
                          console.log(`Selected mother's nationality: ${selectedOption.label}, ID: ${nationalityId}`);
                        } else {
                          field.onChange(value);
                          form.setValue('motherNationalityId', 0);
                          form.setValue('motherNationalityName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingMotherNationality}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Uraia" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingMotherNationality ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : motherNationalityOptions.length > 0 ? (
                          motherNationalityOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value || `mother-nationality-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_mother_nationality_found" disabled>Hakuna uraia uliopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Mother's Date of Birth, Country of Birth, Region of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name="motherDateOfBirth"
                render={({ field }) => (
                  <DatePickerFormField
                    field={field}
                    label="Tarehe ya Kuzaliwa"
                    required={true}
                    placeholder="Chagua tarehe ya kuzaliwa"
                  />
                )}
              />
              
              <FormField
                control={form.control}
                name="motherCountryOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nchi ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = motherCountryOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the country name and ID fields
                          field.onChange(value);
                          // Store the numeric ID for API submission
                          const countryId = selectedOption.id;
                          form.setValue('motherCountryId', countryId);
                          form.setValue('motherCountryName', selectedOption.value);
                          
                          // Clear the region fields
                          form.setValue('motherRegionOfBirth', '');
                          form.setValue('motherRegionId', 0);
                          form.setValue('motherRegionName', '');
                          
                          // Fetch regions for this country
                          fetchRegionsForCountry(countryId, setMotherRegionOptions, setIsLoadingMotherRegions);
                          
                          console.log(`Selected mother's country: ${value}, ID: ${countryId}`);
                        } else {
                          field.onChange(value);
                          form.setValue('motherCountryId', 0);
                          form.setValue('motherCountryName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingMotherCountries}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Nchi" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingMotherCountries ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : motherCountryOptions.length > 0 ? (
                          motherCountryOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value || `mother-country-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_mother_countries_found" disabled>Hakuna nchi zilizopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="motherRegionOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mkoa wa Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = motherRegionOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the region name and ID fields
                          field.onChange(value);
                          form.setValue('motherRegionId', selectedOption.id);
                          form.setValue('motherRegionName', selectedOption.value);
                          
                          console.log(`Selected mother's region: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                          form.setValue('motherRegionId', 0);
                          form.setValue('motherRegionName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingMotherRegions || form.getValues().motherCountryId === 0 || motherRegionOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <SelectValue placeholder="Chagua Mkoa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingMotherRegions ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : motherRegionOptions.length > 0 ? (
                          motherRegionOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value || `mother-region-${option.id}`}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_mother_regions_found" disabled>Hakuna mikoa iliyopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            
          </div>
          
          {/* Buttons */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between">
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

export default function ParentsInfoPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4 text-center">Loading...</div>}>
      <ParentsInfoContent />
    </Suspense>
  );
}
