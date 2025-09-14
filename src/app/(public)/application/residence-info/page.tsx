"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Phone, MapPin, ArrowRight, Calendar, Globe, Save } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomDateInput } from "@/components/ui/custom-date-input";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { residenceInfoEndpoints } from "@/lib/api";
import { verificationEndpoints } from "@/lib/api/endpoints/verification";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { findOptionByValue, handleDropdownChange } from "@/lib/utils/safe-dropdown";
import { processNationalityOptions } from "./nationality-helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types for country, region, and district options
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

interface DistrictOption {
  value: string;
  label: string;
  id: number;
}

interface WardOption {
  value: string;
  label: string;
  id: number;
}

interface NationalityOption {
  value: string;
  label: string;
  id: number;
}

// Form validation schema
const residenceInfoSchema = z.object({
  // Current residence location
  countryOfResidence: z.string().min(1, "Country of residence is required"),
  countryId: z.number().optional(),
  countryName: z.string().optional(),
  region: z.string().min(1, "Region is required"),
  regionId: z.number().optional(),
  regionName: z.string().optional(),
  district: z.string().min(1, "District is required"),
  districtId: z.number().optional(),
  districtName: z.string().optional(),
  ward: z.string().min(1, "Ward is required"),
  wardId: z.number().optional(),
  wardName: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  plotNumber: z.string().optional(),
  houseNumber: z.string().optional(),
  
  // Origin country and nationality
  residenceNationality: z.string().min(1, "Nationality is required"),
  residenceNationalityId: z.number().optional(),
  residenceNationalityName: z.string().optional(),
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  countryOfOriginId: z.number().optional(),
  countryOfOriginName: z.string().optional(),
  
  // Date of entry
  dateOfEntry: z.string().min(1, "Date of entry is required"),
});

type ResidenceInfoFormValues = z.infer<typeof residenceInfoSchema>;

export default function ResidenceInfoPage() {
  const router = useRouter();
  const { formData, updateFormData, isLoading, setIsLoading } = useApplication();
  const { showError, showSuccess } = useCustomToast();
  const [autoNavigateToNext, setAutoNavigateToNext] = useState(false);
  
  // Get applicationId from context instead of URL parameters
  const applicationId = formData.applicationId || '';
  
  // State for country, region, district, and ward options
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<DistrictOption[]>([]);
  const [wardOptions, setWardOptions] = useState<WardOption[]>([]);
  
  // State for nationality and country of origin options
  const [nationalityOptions, setNationalityOptions] = useState<NationalityOption[]>([]);
  const [countryOfOriginOptions, setCountryOfOriginOptions] = useState<CountryOption[]>([]);
  
  // Loading states
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isLoadingNationalities, setIsLoadingNationalities] = useState(false);
  const [isLoadingCountriesOfOrigin, setIsLoadingCountriesOfOrigin] = useState(false);
  
  // Fetch countries from API
  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await verificationEndpoints.fetchCountries();
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult
          .filter(country => country && country.CountryName) // Filter out entries without CountryName
          .map(country => {
            // Ensure value and label are always strings
            const countryName = country.CountryName ? String(country.CountryName) : '';
            const countryId = country.EntryId !== undefined ? Number(country.EntryId) : 0;
            
            return {
              value: countryName,
              label: countryName,
              id: countryId
            };
          });
        
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
    if (!countryId) return;
    
    setIsLoadingRegions(true);
    try {
      const response = await verificationEndpoints.fetchRegions(countryId);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult
          .filter(region => region && region.RegionName) // Filter out entries without RegionName
          .map(region => {
            // Check for EntryID (uppercase ID) first, then fall back to other property names
            const regionId = region.EntryID !== undefined ? region.EntryID : 
                            region.EntryId !== undefined ? region.EntryId :
                            region.ID !== undefined ? region.ID :
                            region.Id !== undefined ? region.Id :
                            region.id !== undefined ? region.id :
                            region.RegionID !== undefined ? region.RegionID :
                            region.RegionId !== undefined ? region.RegionId : 0;
            
            // Ensure value and label are always strings
            const regionName = region.RegionName ? String(region.RegionName) : '';
            
            return {
              value: regionName,
              label: regionName,
              id: Number(regionId)
            };
          });
        
        setRegionOptions(options);
        console.log(`Loaded ${options.length} regions for country ID ${countryId}`);
      } else {
        setRegionOptions([]);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      setRegionOptions([]);
    } finally {
      setIsLoadingRegions(false);
    }
  };
  
  // Fetch districts for a region
  const fetchDistrictsForRegion = async (regionId: number) => {
    if (!regionId) return;
    
    setIsLoadingDistricts(true);
    try {
      const response = await verificationEndpoints.fetchDistricts(regionId);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult.map(district => {
          // Check for EntryID (uppercase ID) first, then fall back to other property names
          const districtId = district.EntryID !== undefined ? district.EntryID : 
                            district.EntryId !== undefined ? district.EntryId :
                            district.ID !== undefined ? district.ID :
                            district.Id !== undefined ? district.Id :
                            district.id !== undefined ? district.id :
                            district.DistrictID !== undefined ? district.DistrictID :
                            district.DistrictId !== undefined ? district.DistrictId : 0;
          
          return {
            value: district.DistrictName,
            label: district.DistrictName,
            id: districtId
          };
        });
        
        setDistrictOptions(options);
        console.log(`Loaded ${options.length} districts for region ID ${regionId}`);
      } else {
        setDistrictOptions([]);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistrictOptions([]);
    } finally {
      setIsLoadingDistricts(false);
    }
  };
  
  // Fetch wards for a district
  const fetchWardsForDistrict = async (districtId: number) => {
    if (!districtId) return;
    
    setIsLoadingWards(true);
    try {
      const response = await verificationEndpoints.fetchWards(districtId);
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult
          .filter(ward => ward && ward.WardName) // Filter out entries without WardName
          .map(ward => {
            // Check for EntryID (uppercase ID) first, then fall back to other property names
            const wardId = ward.EntryID !== undefined ? ward.EntryID : 
                          ward.EntryId !== undefined ? ward.EntryId :
                          ward.ID !== undefined ? ward.ID :
                          ward.Id !== undefined ? ward.Id :
                          ward.id !== undefined ? ward.id :
                          ward.WardID !== undefined ? ward.WardID :
                          ward.WardId !== undefined ? ward.WardId : 0;
            
            // Ensure value and label are always strings
            const wardName = ward.WardName ? String(ward.WardName) : '';
            
            return {
              value: wardName,
              label: wardName,
              id: Number(wardId)
            };
          });
        
        setWardOptions(options);
        console.log(`Loaded ${options.length} wards for district ID ${districtId}`);
      } else {
        setWardOptions([]);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWardOptions([]);
    } finally {
      setIsLoadingWards(false);
    }
  };
  
  // Fetch nationalities
  const fetchNationalities = async () => {
    setIsLoadingNationalities(true);
    try {
      const response = await verificationEndpoints.fetchNationalities();
      
      // Debug: Log the first few nationality objects to see their structure
      if (response.jsonResult && response.jsonResult.length > 0) {
        console.log('First nationality object:', JSON.stringify(response.jsonResult[0]));
        console.log('Second nationality object:', JSON.stringify(response.jsonResult[1]));
        console.log('Available keys:', Object.keys(response.jsonResult[0]));
      }
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        // Create a map to track seen nationality values to handle duplicates
        const seenValues = new Map();
        
        // Process the nationality data to ensure unique values
        const options: NationalityOption[] = [];
        
        response.jsonResult
          // Filter out entries with missing or empty Nationality field
          .filter(item => item && typeof item === 'object' && item.Nationality)
          .forEach(item => {
            // Get the ID (EntryId is the field name in the API response)
            const id = item.EntryId !== undefined ? Number(item.EntryId) : 0;
            
            // Get the nationality name (Nationality is the field name in the API response)
            const name = String(item.Nationality || '');
            if (!name) return;
            
            // Create a unique value if this nationality name has been seen before
            if (seenValues.has(name)) {
              // Add the ID to make the value unique
              const uniqueValue = `${name}_${id}`;
              options.push({
                value: uniqueValue, // Unique value for selection
                label: name,       // Original name for display
                id: id
              });
            } else {
              // First time seeing this nationality name
              seenValues.set(name, id);
              options.push({
                value: name,
                label: name,
                id: id
              });
            }
          });
        
        setNationalityOptions(options);
        console.log(`Loaded ${options.length} nationalities (after processing)`);
      } else {
        setNationalityOptions([]);
      }
    } catch (error) {
      console.error("Error fetching nationalities:", error);
      setNationalityOptions([]);
    } finally {
      setIsLoadingNationalities(false);
    }
  };
  
  // Fetch countries for country of origin
  const fetchCountriesOfOrigin = async () => {
    setIsLoadingCountriesOfOrigin(true);
    try {
      const response = await verificationEndpoints.fetchCountries();
      
      if (response.ackCode === 1 && response.jsonResult && response.jsonResult.length > 0) {
        const options = response.jsonResult
          .filter(country => country && country.CountryName) // Filter out entries without CountryName
          .map(country => {
            // Ensure value and label are always strings
            const countryName = country.CountryName ? String(country.CountryName) : '';
            const countryId = country.EntryId !== undefined ? Number(country.EntryId) : 0;
            
            return {
              value: countryName,
              label: countryName,
              id: countryId
            };
          });
        
        setCountryOfOriginOptions(options);
        console.log(`Loaded ${options.length} countries for origin`);
      } else {
        setCountryOfOriginOptions([]);
      }
    } catch (error) {
      console.error("Error fetching countries of origin:", error);
      setCountryOfOriginOptions([]);
    } finally {
      setIsLoadingCountriesOfOrigin(false);
    }
  };

  // Fetch countries, nationalities, and countries of origin on component mount
  useEffect(() => {
    fetchCountries();
    fetchNationalities();
    fetchCountriesOfOrigin();
  }, []);
  
  // Helper function to ensure valid ID
  const ensureValidId = (value: any): number => {
    const numValue = Number(value);
    return isNaN(numValue) ? 0 : numValue;
  };
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<ResidenceInfoFormValues>({
    resolver: zodResolver(residenceInfoSchema),
    defaultValues: {
      // Current residence location
      countryOfResidence: formData.countryOfResidence || '',
      countryId: formData.countryId || 0,
      countryName: formData.countryName || '',
      region: formData.region || '',
      regionId: formData.regionId || 0,
      regionName: formData.regionName || '',
      district: formData.district || '',
      districtId: formData.districtId || 0,
      districtName: formData.districtName || '',
      ward: formData.ward || '',
      wardId: formData.wardId || 0,
      wardName: formData.wardName || '',
      street: formData.street || '',
      phoneNumber: formData.phoneNumber || '',
      plotNumber: formData.plotNumber || '',
      houseNumber: formData.houseNumber || '',
      
      // Origin country and nationality
      residenceNationality: formData.residenceNationality || '',
      residenceNationalityId: formData.residenceNationalityId || 0,
      residenceNationalityName: formData.residenceNationalityName || '',
      countryOfOrigin: formData.countryOfOrigin || '',
      countryOfOriginId: formData.countryOfOriginId || 0,
      countryOfOriginName: formData.countryOfOriginName || '',
      
      // Date of entry
      dateOfEntry: formData.dateOfEntry ? new Date(formData.dateOfEntry).toISOString().split('T')[0] : '',
    },
  });
  
  // Handle save and exit
  const handleSaveAndExit = () => {
    const formValues = form.getValues();
    
    // Convert date string to Date object
    const data = {
      ...formValues,
      dateOfEntry: formValues.dateOfEntry ? new Date(formValues.dateOfEntry) : new Date(),
      // Ensure IDs are numbers
      countryId: ensureValidId(formValues.countryId),
      regionId: ensureValidId(formValues.regionId),
      districtId: ensureValidId(formValues.districtId),
      wardId: ensureValidId(formValues.wardId),
      residenceNationalityId: ensureValidId(formValues.residenceNationalityId),
      countryOfOriginId: ensureValidId(formValues.countryOfOriginId),
    };
    
    console.log('Save and exit - data:', data);
    updateFormData(data);
    router.push('/application');
  };
  
  // Handle form submission
  const onSubmit = async (formValues: ResidenceInfoFormValues) => {
    console.log('onSubmit function called with values:', formValues);
    setIsLoading(true);
    
    try {
      // Validate required fields before proceeding
      const requiredFields: (keyof ResidenceInfoFormValues)[] = ['countryOfResidence', 'region', 'district', 'ward', 'street', 'phoneNumber', 'residenceNationality', 'countryOfOrigin', 'dateOfEntry'];
      const missingFields = requiredFields.filter(field => !formValues[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        showError({
          description: `Tafadhali jaza sehemu zote zinazohitajika: ${missingFields.join(', ')}`
        });
        return;
      }
      
      // Ensure date is properly formatted
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      // Process date of entry - handle both string and Date formats
      let dateOfEntry: string;
      if (formValues.dateOfEntry) {
        // If it's already a valid ISO string (YYYY-MM-DD), use it directly
        if (typeof formValues.dateOfEntry === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(formValues.dateOfEntry)) {
          dateOfEntry = formValues.dateOfEntry;
        } else {
          // Otherwise, try to parse it as a date
          try {
            const parsedDate = new Date(formValues.dateOfEntry);
            
            // If it's a valid date
            if (!isNaN(parsedDate.getTime())) {
              // Format it as YYYY-MM-DD
              dateOfEntry = parsedDate.toISOString().split('T')[0];
            } else {
              // Fallback to current date
              dateOfEntry = currentDate.toISOString().split('T')[0];
            }
          } catch (e) {
            // If parsing fails, use current date
            dateOfEntry = currentDate.toISOString().split('T')[0];
          }
        }
      } else {
        // If no date provided, use current date
        dateOfEntry = currentDate.toISOString().split('T')[0];
      }
      
      const data = {
        ...formValues,
        dateOfEntry: dateOfEntry,
        // Ensure IDs are numbers
        countryId: ensureValidId(formValues.countryId),
        regionId: ensureValidId(formValues.regionId),
        districtId: ensureValidId(formValues.districtId),
        wardId: ensureValidId(formValues.wardId),
        residenceNationalityId: ensureValidId(formValues.residenceNationalityId),
        countryOfOriginId: ensureValidId(formValues.countryOfOriginId),
      };
      
      // Prepare API payload according to the required format
      const apiPayload = {
        wardResidenceId: Number(data.wardId) || 0,
        streetName: String(data.street || ''),
        phoneNo: String(data.phoneNumber || ''),
        houseNo: String(data.houseNumber || ''),
        plotNo: String(data.plotNumber || ''),
        countryOfOriginId: Number(data.countryOfOriginId) || 0,
        nationalityId: Number(data.residenceNationalityId) || 0,
        // Use the dateOfEntry string directly - it's already in YYYY-MM-DD format
        dateOfEntry: dateOfEntry
      };
      
      console.log('Form submission data:', data);
      console.log('API payload:', apiPayload);
      updateFormData(data);
      
      // Call the API to submit residence info
      console.log('Calling API with applicationId:', applicationId);
      const response = await residenceInfoEndpoints.submitResidenceInfo(applicationId, apiPayload);
      console.log('API response received:', response);
      
      if (response.ackCode === 1) {
        // Success - show success message
        showSuccess({
          description: "Taarifa za makazi zimehifadhiwa"
        });
        console.log('Setting autoNavigateToNext to true');
        // Set autoNavigateToNext to true to trigger automatic navigation
        setIsLoading(false);
        setAutoNavigateToNext(true);
      } else {
        // Handle error
        console.error('API returned error:', response);
        showError({
          description: response.ackMessage || "An error occurred while submitting your information"
        });
      }
    } catch (error: any) {
      console.error("Error submitting residence info:", error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      showError({
        description: error.message || "An error occurred while submitting your information"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ApplicationLayout 
      title="Anuwani ya Makazi" 
      subtitle="Taarifa za makazi yako ya sasa"
      applicationId={applicationId}
      currentStep="anuwani-ya-makazi"
      autoNavigateToNext={autoNavigateToNext}
    >
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Anuwani ya Makazi Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="countryOfResidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500 block mb-1">Nchi ya Makazi <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = countryOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the country name and ID fields
                          field.onChange(value);
                          form.setValue('countryId', selectedOption.id);
                          form.setValue('countryName', selectedOption.value);
                          
                          // Clear the region and district fields
                          form.setValue('region', '');
                          form.setValue('regionId', 0);
                          form.setValue('regionName', '');
                          form.setValue('district', '');
                          form.setValue('districtId', 0);
                          form.setValue('districtName', '');
                          
                          // Fetch regions for this country
                          fetchRegionsForCountry(selectedOption.id);
                          
                          console.log(`Selected country: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                          form.setValue('countryId', 0);
                          form.setValue('countryName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingCountries}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Nchi ya Makazi" />
                          </div>
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
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Mkoa <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = regionOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the region name and ID fields
                          field.onChange(value);
                          form.setValue('regionId', selectedOption.id);
                          form.setValue('regionName', selectedOption.value);
                          
                          // Clear the district fields
                          form.setValue('district', '');
                          form.setValue('districtId', 0);
                          form.setValue('districtName', '');
                          
                          // Fetch districts for this region
                          fetchDistrictsForRegion(selectedOption.id);
                          
                          console.log(`Selected region: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                          form.setValue('regionId', 0);
                          form.setValue('regionName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingRegions || form.getValues().countryId === 0 || regionOptions.length === 0}
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
                          <SelectItem value="none" disabled>Hakuna mikoa iliyopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Wilaya <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        if (!value) {
                          field.onChange('');
                          form.setValue('districtId', 0);
                          form.setValue('districtName', '');
                          return;
                        }
                        
                        // Find the selected option using the safe comparison function
                        const selectedOption = findOptionByValue(districtOptions, value);
                        
                        if (selectedOption) {
                          // Update both the district name and ID fields
                          field.onChange(value);
                          form.setValue('districtId', selectedOption.id);
                          form.setValue('districtName', selectedOption.value);
                          
                          // Clear the ward fields
                          form.setValue('ward', '');
                          form.setValue('wardId', 0);
                          form.setValue('wardName', '');
                          
                          // Fetch wards for this district
                          fetchWardsForDistrict(selectedOption.id);
                          
                          console.log(`Selected district: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                          form.setValue('districtId', 0);
                          form.setValue('districtName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingDistricts || form.getValues().regionId === 0 || districtOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <SelectValue placeholder="Chagua Wilaya" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingDistricts ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : districtOptions.length > 0 ? (
                          districtOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>Hakuna wilaya zilizopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Kata <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = wardOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the ward name and ID fields
                          field.onChange(value);
                          form.setValue('wardId', selectedOption.id);
                          form.setValue('wardName', selectedOption.value);
                          
                          console.log(`Selected ward: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                          form.setValue('wardId', 0);
                          form.setValue('wardName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingWards || form.getValues().districtId === 0 || wardOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <SelectValue placeholder="Chagua Kata" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingWards ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : wardOptions.length > 0 ? (
                          wardOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>Hakuna kata zilizopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Anwani ya Kudumu Section */}
          {/* Additional Address Information */}
          <div className="mb-8">
            <h2 className="text-xl font-medium border-b pb-2 mb-4">Taarifa za Ziada</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="residenceNationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Uraia <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Find the selected option to get its ID
                        const selectedOption = nationalityOptions.find(
                          opt => opt.value.toLowerCase() === value.toLowerCase()
                        );
                        
                        if (selectedOption) {
                          // Update both the nationality name and ID fields
                          field.onChange(value);
                          form.setValue('residenceNationalityId', selectedOption.id);
                          form.setValue('residenceNationalityName', selectedOption.value);
                          
                          console.log(`Selected nationality: ${value}, ID: ${selectedOption.id}`);
                        } else {
                          field.onChange(value);
                          form.setValue('residenceNationalityId', 0);
                          form.setValue('residenceNationalityName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingNationalities}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Uraia" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingNationalities ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : nationalityOptions.length > 0 ? (
                          nationalityOptions.map((option) => (
                            <SelectItem key={option.id} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>Hakuna uraia uliopatikana</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Namba ya Simu <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input 
                          placeholder="Ingiza Namba ya Simu" 
                          className="border border-gray-300 rounded pl-10 py-2 w-full focus:border-blue-500 focus:outline-none" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="plotNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Namba ya Kiwanja</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input 
                          placeholder="Ingiza Namba ya Kiwanja" 
                          className="border border-gray-300 rounded pl-10 py-2 w-full focus:border-blue-500 focus:outline-none" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="houseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Namba ya Nyumba</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input 
                          placeholder="Ingiza Namba ya Nyumba" 
                          className="border border-gray-300 rounded pl-10 py-2 w-full focus:border-blue-500 focus:outline-none" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Anwani ya Kudumu Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium border-b pb-2 mb-4">Anwani ya Kudumu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Mtaa <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input 
                          placeholder="Ingiza Mtaa" 
                          className="border border-gray-300 rounded pl-10 py-2 w-full focus:border-blue-500 focus:outline-none" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Removed duplicate Uraia field */}
              
              <FormField
                control={form.control}
                name="countryOfOrigin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Asili <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        try {
                          if (!value) {
                            field.onChange('');
                            form.setValue('countryOfOriginId', 0);
                            form.setValue('countryOfOriginName', '');
                            return;
                          }
                          
                          // Find the selected option to get its ID
                          const selectedOption = countryOfOriginOptions.find(opt => {
                            if (!opt || !opt.value || !value) return false;
                            try {
                              return opt.value.toLowerCase() === value.toLowerCase();
                            } catch (e) {
                              console.error('Error comparing values:', e);
                              return false;
                            }
                          });
                          
                          if (selectedOption) {
                            // Update both the country name and ID fields
                            field.onChange(value);
                            form.setValue('countryOfOriginId', selectedOption.id);
                            form.setValue('countryOfOriginName', selectedOption.value);
                            
                            console.log(`Selected country of origin: ${value}, ID: ${selectedOption.id}`);
                          } else {
                            field.onChange(value);
                            form.setValue('countryOfOriginId', 0);
                            form.setValue('countryOfOriginName', '');
                          }
                        } catch (error) {
                          console.error('Error in country of origin selection:', error);
                          field.onChange(value || '');
                          form.setValue('countryOfOriginId', 0);
                          form.setValue('countryOfOriginName', '');
                        }
                      }}
                      value={field.value}
                      disabled={isLoadingCountriesOfOrigin}
                    >
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Nchi ya Asili" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingCountriesOfOrigin ? (
                          <SelectItem value="loading" disabled>Inapakia...</SelectItem>
                        ) : countryOfOriginOptions.length > 0 ? (
                          countryOfOriginOptions.map((option) => (
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
              
              {/* Removed duplicate Uraia field */}
              
              <FormField
                control={form.control}
                name="dateOfEntry"
                render={({ field }) => (
                  <CustomDateInput
                    field={field}
                    label="Tarehe ya Kuingia Tanzania"
                    required={true}
                    id="dateOfEntryTanzania"
                  />
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
              onClick={(e) => {
                console.log('Submit button clicked');
                // Check for form validation errors
                const formErrors = form.formState.errors;
                if (Object.keys(formErrors).length > 0) {
                  console.log('Form validation errors:', formErrors);
                  // Show validation errors to user in toast
                  const errorMessages = Object.keys(formErrors).map(field => {
                    const fieldKey = field as keyof ResidenceInfoFormValues;
                    const error = formErrors[fieldKey];
                    return error?.message || `${field} is required`;
                  });
                  
                  showError({
                    description: `Tafadhali sahihisha makosa yafuatayo: ${errorMessages.join(', ')}`
                  });
                  return;
                }
                // If no validation errors, proceed with form submission
                form.handleSubmit(onSubmit)(e);
              }}
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
