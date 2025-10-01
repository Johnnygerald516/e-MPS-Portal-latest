"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Plus, Trash2, Users, ArrowRight, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePickerFormField } from "@/components/ui/date-picker-form-field";
import { InteractiveCheckbox } from "@/components/ui/interactive-checkbox";
import { RelationshipTypeSelect } from "@/components/ui/relationship-type-select";
import { DocumentTypeSelect } from "@/components/ui/document-type-select";
import { LoadingButton } from "@/components/ui/loading-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { dependantInfoEndpoints, DependantInfoPayload } from "@/lib/api/endpoints/dependant-info";
import { verificationEndpoints } from "@/lib/api/endpoints/verification";
import { useToast } from "@/components/ui/use-toast";

// Form validation schema
const dependantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.string().optional(),
  relationship: z.string().min(2, "Relationship is required"),
  relationshipTypeId: z.number().optional(),
  dateOfBirth: z.union([z.string(), z.date()])
    .refine(val => !!val, {
      message: "Date of birth is required",
    })
    .refine(val => {
      if (!val) return false;
      
      // Calculate age based on the date of birth
      const dob = val instanceof Date ? val : new Date(val);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      // Ensure age is 18 or younger
      return age <= 18;
    }, {
      message: "Dependant must be 18 years old or younger",
    }),
  // Make hasDocument a required boolean to match the expected type
  hasDocument: z.boolean(),
  documentNumber: z.string().optional(),
  documentTypeId: z.number().optional(),
  documentIssuedDate: z.union([z.string(), z.date()]).optional(),
  documentExpiryDate: z.union([z.string(), z.date()]).optional(),
  nationality: z.string().optional(),
  nationalityId: z.number().optional(),
  issuedCountry: z.string().optional(),
  issuedCountryId: z.number().optional(),
});

const dependantInfoSchema = z.object({
  hasDependants: z.boolean(),
  dependants: z.array(dependantSchema).optional(),
});

type DependantInfoFormValues = z.infer<typeof dependantInfoSchema>;

interface Country {
  EntryId: number;
  CountryName: string;
}

interface Nationality {
  EntryId?: number;
  Nationality?: string;
  [key: string]: any;
}

export default function DependantInfoPage() {
  const router = useRouter();
  const { formData, updateFormData, isLoading, setIsLoading } = useApplication();
  const [autoNavigateToNext, setAutoNavigateToNext] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { toast } = useToast(); // Get toast function from hook
  
  // Get applicationId from context instead of URL parameters
  const applicationId = formData.applicationId || '';
  
  // State for countries and nationalities
  const [countries, setCountries] = useState<Country[]>([]);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<DependantInfoFormValues, any, DependantInfoFormValues>({
    resolver: zodResolver(dependantInfoSchema),
    defaultValues: {
      hasDependants: formData.hasDependants || false,
      dependants: formData.dependants ? formData.dependants.map((dep: any) => {
        // Convert dates to ISO string format (YYYY-MM-DD)
        const formatDateToString = (dateValue: any): string => {
          if (!dateValue) return '';
          
          // Check if it's a default date (current year)
          const currentYear = new Date().getFullYear();
          if (typeof dateValue === 'string' && dateValue.includes(currentYear.toString())) {
            return '';
          }
          
          // If already a string in ISO format
          if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
          }
          
          try {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Error formatting date:', e);
          }
          
          // Default to today if invalid
          return new Date().toISOString().split('T')[0];
        };
        
        return {
          ...dep,
          // Ensure hasDocument is always a boolean
          hasDocument: dep.hasDocument === undefined ? false : Boolean(dep.hasDocument),
          dateOfBirth: formatDateToString(dep.dateOfBirth),
          documentIssuedDate: formatDateToString(dep.documentIssuedDate),
          documentExpiryDate: formatDateToString(dep.documentExpiryDate)
        };
      }) : [],
    },
  });
  
  // Use field array for dynamic dependants
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dependants",
  });
  
  // Watch for hasDependants changes
  const hasDependants = form.watch("hasDependants");
  
  // Fetch countries and nationalities
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch countries
        const countriesPayload = {
          operationType: "country",
          argument1: 1,
          argument2: 0
        };
        const countriesResponse = await verificationEndpoints.fetchLookup(countriesPayload);
        if (countriesResponse.jsonResult) {
          setCountries(countriesResponse.jsonResult);
        }
        
        // Fetch nationalities
        const nationalitiesPayload = {
          operationType: "nationality",
          argument1: 1,
          argument2: 0
        };
        const nationalitiesResponse = await verificationEndpoints.fetchLookup(nationalitiesPayload);
        if (nationalitiesResponse.jsonResult) {
          setNationalities(nationalitiesResponse.jsonResult);
        }
      } catch (error) {
        console.error('Error fetching lookup data:', error);
        // Use the toast function from the hook
        toast({
          title: "Error",
          description: "Failed to load countries and nationalities",
          variant: "destructive"
        });
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update country and nationality display names when data is loaded
  useEffect(() => {
    if (!isLoadingData && countries.length > 0 && nationalities.length > 0) {
      // Get current form values
      const currentValues = form.getValues();
      
      // Only proceed if we have dependants
      if (currentValues.dependants && currentValues.dependants.length > 0) {
        console.log('Updating country and nationality display names for dependants');
        
        // Update each dependant's country and nationality display names
        currentValues.dependants.forEach((dep, index) => {
          // Update country name if ID is set
          if (dep.issuedCountryId) {
            const selectedCountry = countries.find(c => c.EntryId === dep.issuedCountryId);
            if (selectedCountry) {
              form.setValue(`dependants.${index}.issuedCountry`, selectedCountry.CountryName);
              console.log(`Updated country for dependant ${index + 1} to ${selectedCountry.CountryName}`);
            }
          }
          
          // Update nationality name if ID is set
          if (dep.nationalityId) {
            const selectedNationality = nationalities.find(n => n.EntryId === dep.nationalityId);
            if (selectedNationality) {
              form.setValue(`dependants.${index}.nationality`, selectedNationality.Nationality);
              console.log(`Updated nationality for dependant ${index + 1} to ${selectedNationality.Nationality}`);
            }
          }
        });
      }
    }
  }, [isLoadingData, countries, nationalities, form]);
  
  // Handle save and exit
  const handleSaveAndExit = async () => {
    setIsExiting(true);
    try {
      const data = form.getValues();
      
      // If hasDependants is false, clear the dependants array
      if (!data.hasDependants) {
        data.dependants = [];
      } else if (data.dependants && data.dependants.length > 0) {
        // Validate required fields for each dependant
        const invalidDependants = data.dependants.filter((dep, index) => {
          const missingFields = [];
          if (!dep.name || dep.name.trim() === '') missingFields.push('Name');
          if (!dep.gender) missingFields.push('Gender');
          if (!dep.relationship || dep.relationship.trim() === '') missingFields.push('Relationship');
          if (!dep.relationshipTypeId) missingFields.push('Relationship Type');
          if (!dep.dateOfBirth) missingFields.push('Date of Birth');
          
          // Validate age (must be 18 or younger)
          if (dep.dateOfBirth && !validateDependantAge(dep.dateOfBirth)) {
            toast({
              title: `Dependant ${index + 1} has invalid age`,
              description: `Dependant must be 18 years old or younger`,
              variant: "destructive",
            });
            return true;
          }
          
          // If document number is provided, validate related fields
          if (dep.documentNumber && dep.documentNumber.trim() !== '') {
            if (!dep.documentTypeId) missingFields.push('Document Type');
            if (!dep.documentIssuedDate) missingFields.push('Document Issued Date');
            if (!dep.documentExpiryDate) missingFields.push('Document Expiry Date');
            if (!dep.issuedCountry || !dep.issuedCountryId) missingFields.push('Issued Country');
          }
          
          if (missingFields.length > 0) {
            toast({
              title: `Dependant ${index + 1} has missing fields`,
              description: `Please fill in the following fields: ${missingFields.join(', ')}`,
              variant: "destructive",
            });
            return true;
          }
          
          return false;
        });
        
        // If there are any invalid dependants, stop the submission
        if (invalidDependants.length > 0) {
          setIsExiting(false);
          return;
        }
      }
      
      updateFormData(data);
      
      // Format the data for API submission
      const formatDate = (date: string | Date | undefined): string => {
        if (!date) return '';
        
        // If it's already a string in ISO format (YYYY-MM-DD), use it directly
        if (typeof date === 'string') {
          // Check if it's already in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
          
          // Try to parse the string to a Date
          try {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Error parsing date string:', e);
          }
          
          // If we can't parse it, return empty string
          return '';
        }
        
        // Handle Date object
        const year = date.getFullYear();
        // Check if year is too low (likely invalid)
        if (year < 1900) {
          const currentYear = new Date().getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${currentYear}-${month}-${day}`;
        }
        return date.toISOString().split('T')[0];
      };
      
      // Map dependants to API format
      const dependants = data.dependants?.map(dep => {
        // Base dependant data that's always included
        const dependantData: any = {
          dependantFullName: dep.name,
          dependantGender: dep.gender || 'M',
          dependantNationalityID: Number(dep.nationalityId) || 0,
          dependantRelationTypeID: Number(dep.relationshipTypeId) || 0,
          // Set hasDocument value based on the checkbox (1 for checked, 0 for unchecked)
          hasDocument: dep.hasDocument ? 1 : 0
        };
        
        // Include document fields with proper defaults
        dependantData.documentTypeID = Number(dep.documentTypeId) || 0;
        dependantData.documentNo = dep.documentNumber || '';
        
        dependantData.issuedDate = formatDate(dep.documentIssuedDate) || '';
        dependantData.expireDate = formatDate(dep.documentExpiryDate) || '';
        
        dependantData.issuedCountryID = Number(dep.issuedCountryId) || 0;
        
        return dependantData;
      }) || [];
      
      // Check if any dependant has documents
      const hasAnyDocuments = data.dependants?.some(dep => dep.hasDocument) || false;
      
      // Create the payload with the expected structure matching the API format
      const formattedPayload: DependantInfoPayload = {
        applicationId: applicationId,
        hasDocument: hasAnyDocuments ? 1 : 0,
        dependants: dependants
      };
      
      const response = await dependantInfoEndpoints.saveDependantInfo(formattedPayload);
      
      if (response.ackCode === 1) {
        // Success - show success message
        toast({
          title: "Success",
          description: "Dependant information saved successfully",
          variant: "default"
        });
        // Navigate to landing page
        router.push('/');
      } else {
        // Handle error
        console.error('API error:', response.ackMessage);
        toast({
          title: "Error",
          description: response.ackMessage || "Failed to save dependant information",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error saving dependant info:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save dependant information",
        variant: "destructive"
      });
    } finally {
      setIsExiting(false);
    }
  };

  // Helper function to validate age
  const validateDependantAge = (dateOfBirth: string | Date | undefined): boolean => {
    if (!dateOfBirth) {
      console.log('validateDependantAge: No date of birth provided');
      return false;
    }
    
    try {
      // Calculate age based on the date of birth
      const dob = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
      console.log('validateDependantAge: Date of birth:', dob);
      
      // Check if date is valid
      if (isNaN(dob.getTime())) {
        console.log('validateDependantAge: Invalid date');
        return false;
      }
      
      const today = new Date();
      console.log('validateDependantAge: Today:', today);
      
      let age = today.getFullYear() - dob.getFullYear();
      console.log('validateDependantAge: Initial age calculation:', age);
      
      // Adjust age if birthday hasn't occurred yet this year
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
        console.log('validateDependantAge: Adjusted age after birthday check:', age);
      }
      
      // Ensure age is 18 or younger
      const isValid = age <= 18;
      console.log('validateDependantAge: Final age:', age, 'Is valid (≤18):', isValid);
      return isValid;
    } catch (e) {
      console.error('Error validating dependant age:', e);
      return false;
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: DependantInfoFormValues) => {
    // If hasDependants is false, clear the dependants array
    if (!data.hasDependants) {
      data.dependants = [];
    } else if (data.dependants && data.dependants.length > 0) {
      // Validate required fields for each dependant
      const invalidDependants = data.dependants.filter((dep, index) => {
        const missingFields = [];
        if (!dep.name || dep.name.trim() === '') missingFields.push('Name');
        if (!dep.gender) missingFields.push('Gender');
        if (!dep.relationship || dep.relationship.trim() === '') missingFields.push('Relationship');
        if (!dep.relationshipTypeId) missingFields.push('Relationship Type');
        if (!dep.dateOfBirth) missingFields.push('Date of Birth');
        
        // Validate age (must be 18 or younger)
        if (dep.dateOfBirth && !validateDependantAge(dep.dateOfBirth)) {
          // Use the toast function from the hook
          toast({
            title: `Dependant ${index + 1} has invalid age`,
            description: `Dependant must be 18 years old or younger`,
            variant: "destructive",
          });
          console.log(`Dependant ${index + 1} age validation failed - above 18 years old`);
          return true;
        }
        
        // If document number is provided, validate related fields
        if (dep.documentNumber && dep.documentNumber.trim() !== '') {
          if (!dep.documentTypeId) missingFields.push('Document Type');
          if (!dep.documentIssuedDate) missingFields.push('Document Issued Date');
          if (!dep.documentExpiryDate) missingFields.push('Document Expiry Date');
          if (!dep.issuedCountry || !dep.issuedCountryId) missingFields.push('Issued Country');
        }
        
        if (missingFields.length > 0) {
          // Use the toast function from the hook
          toast({
            title: `Dependant ${index + 1} has missing fields`,
            description: `Please fill in the following fields: ${missingFields.join(', ')}`,
            variant: "destructive",
          });
          console.log(`Dependant ${index + 1} has missing fields:`, missingFields);
          return true;
        }
        
        return false;
      });
      
      // If there are any invalid dependants, stop the submission
      if (invalidDependants.length > 0) {
        setIsLoading(false);
        return;
      }
    }
    
    setIsLoading(true);
    updateFormData(data);
    
    try {
      // Format the data for API submission
      const formatDate = (date: string | Date | undefined): string => {
        if (!date) return '';
        
        // If it's already a string in ISO format (YYYY-MM-DD), use it directly
        if (typeof date === 'string') {
          // Check if it's already in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
          
          // Try to parse the string to a Date
          try {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Error parsing date string:', e);
          }
          
          // If we can't parse it, return empty string
          return '';
        }
        
        // Handle Date object
        const year = date.getFullYear();
        // Check if year is too low (likely invalid)
        if (year < 1900) {
          const currentYear = new Date().getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${currentYear}-${month}-${day}`;
        }
        return date.toISOString().split('T')[0];
      };
      
      // Map dependants to API format
      const dependants = data.dependants?.map(dep => {
        // Log each dependant's data for debugging
        console.log('Dependant form data:', JSON.stringify(dep, null, 2));
        
        // Base dependant data that's always included
        const dependantData: any = {
          dependantFullName: dep.name,
          dependantGender: dep.gender || 'M',
          dependantNationalityID: Number(dep.nationalityId) || 0,
          dependantRelationTypeID: Number(dep.relationshipTypeId) || 0,
          // Set hasDocument value based on the checkbox (1 for checked, 0 for unchecked)
          hasDocument: dep.hasDocument ? 1 : 0
        };
        
        // Include document fields with proper defaults
        dependantData.documentTypeID = Number(dep.documentTypeId) || 0;
        dependantData.documentNo = dep.documentNumber || '';
        
        dependantData.issuedDate = formatDate(dep.documentIssuedDate) || '';
        dependantData.expireDate = formatDate(dep.documentExpiryDate) || '';
        
     dependantData.issuedCountryID = Number(dep.issuedCountryId) || 0;
        
        return dependantData;
      }) || [];
      
      // Check if any dependant has documents
      const hasAnyDocuments = data.dependants?.some(dep => dep.hasDocument) || false;
      
      // Create API payload
      const apiPayload = {
        hasDocument: hasAnyDocuments ? 1 : 0,
        dependants: dependants
      };
      
       try {
        // Create the payload with the expected structure matching the API format
        const formattedPayload: DependantInfoPayload = {
          applicationId: applicationId,
          hasDocument: apiPayload.hasDocument,
          dependants: apiPayload.dependants
        };
        
        const response = await dependantInfoEndpoints.saveDependantInfo(formattedPayload);
        
        if (response.ackCode === 1) {
          // Success - show success message
          toast({
            title: "Success",
            description: "Dependant information saved successfully",
            variant: "default"
          });
          // Set autoNavigateToNext to true to trigger automatic navigation
          setIsLoading(false);
          setAutoNavigateToNext(true);
        } else {
          // Handle error
          console.error('API error:', response.ackMessage);
          toast({
            title: "Error",
            description: response.ackMessage || "Failed to save dependant information",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('API call error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to save dependant information",
          variant: "destructive"
        });
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error submitting dependant info:', error);
      setIsLoading(false);
    }
  };
  
  // Add new dependant
  const addDependant = () => {
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    append({
      name: "",
      gender: "", // Empty string to show placeholder
      relationship: "",
      relationshipTypeId: 0,
      dateOfBirth: "",
      // Explicitly set as boolean to avoid type issues
      hasDocument: false as boolean, 
      documentNumber: "",
      documentTypeId: 0,
      documentIssuedDate: "",
      documentExpiryDate: "",
      nationality: "",
      nationalityId: 0,
      issuedCountry: "",
      issuedCountryId: 0,
    });
  };
  
  return (
    <ApplicationLayout 
      title="Habari za wategemezi" 
      subtitle="Enter information about your dependants"
      applicationId={applicationId}
      currentStep="habari-za-wategemezi"
      autoNavigateToNext={autoNavigateToNext}
    >
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="hasDependants"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InteractiveCheckbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    label="Nina wategemezi wa kujumuisha kwenye ombi langu"
                    description="Tiki kisanduku hiki ikiwa una wategemezi ambao wanapaswa kujumuishwa kwenye ombi lako"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {hasDependants && (
            <div className="p-4 rounded-md">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-medium text-slate-800">Wategemezi</h3>
                </div>
                <Button 
                  type="button"
                  onClick={addDependant}
                  className="border border-blue-500 text-blue-700 hover:text-blue-500 hover:border-blue-700  px-4 py-2 rounded flex items-center bg-blue hover:bg-blue-50"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Weka Mtegemezi
                </Button>
              </div>
              
              {fields.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <p>Hakuna wategemezi waliyo ongezwa bado. Bonyeza kitufe kilicho juu kuongeza mtegemezi.</p>
                </div>
              )}
              
              {fields.map((field, index) => (
                <div key={field.id} className="mb-6 border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Mtegemezi #{index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      className="border border-red-600 text-red-600 hover:border-red-700 hover:text-red-700 px-4 py-2 rounded flex items-center bg-white hover:bg-red-50"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Futa
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-500">
                            Jina Kamili <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                            //placeholder="Weka Jina Kamili" 
                            className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.relationshipTypeId`}
                      render={({ field: relationshipField }) => (
                        <RelationshipTypeSelect
                          field={{
                            value: relationshipField.value?.toString() || "",
                            onChange: (value: string) => {
                              // Convert string value to number for the ID
                              const numValue = parseInt(value);
                              relationshipField.onChange(numValue);
                            }
                          }}
                          label="Uhusiano"
                          required={true}
                          placeholder="Chagua Aina ya Uhusiano"
                          onRelationshipTypeChange={(id, name) => {
                            // Set the relationship name based on the selected ID and name
                            form.setValue(`dependants.${index}.relationship`, name || "");
                          }}
                          showLocalizedLabels={true}
                        />
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.gender`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-500">
                            Jinsia <span className="text-red-500">*</span>
                          </FormLabel>
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
                              <SelectItem value="M">Mume</SelectItem>
                              <SelectItem value="F">Mke</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.dateOfBirth`}
                      render={({ field }) => (
                        <DatePickerFormField
                          field={field}
                          label="Tarehe ya Kuzaliwa"
                          required={true}
                          //placeholder="Chagua Tarehe ya kuzaliwa"
                        />
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.nationalityId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-500">
                            Utaifa <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              const numValue = parseInt(value);
                              field.onChange(numValue);
                              // Set the nationality name based on the selected ID
                              const selectedNationality = nationalities.find(n => n.EntryId === numValue);
                              const nationalityName = selectedNationality?.Nationality || "";
                              form.setValue(`dependants.${index}.nationality`, nationalityName);
                              
                              // Debug log for nationality selection
                              console.log(`Selected nationality for dependant ${index + 1}:`, {
                                nationalityId: numValue,
                                nationalityName,
                                foundNationality: !!selectedNationality
                              });
                            }} 
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                  {field.value ? (
                                    <span>
                                      {nationalities.find(n => n.EntryId === field.value)?.Nationality || "Select nationality"}
                                    </span>
                                  ) : (
                                    <SelectValue placeholder="Select nationality" />
                                  )}
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {isLoadingData ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                              ) : nationalities.length > 0 ? (
                                nationalities.map((nationality) => (
                                  <SelectItem key={nationality.EntryId} value={nationality.EntryId?.toString() || ""}>
                                    {nationality.Nationality || "Unknown"}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No nationalities available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.hasDocument`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <InteractiveCheckbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              label="Mtegemezi ana nyaraka za utambulisho"
                              description="Tiki kisanduku hiki ikiwa una taarifa za nyaraka za mtegemezi huyu."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch(`dependants.${index}.hasDocument`) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2">
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.documentTypeId`}
                      render={({ field: documentTypeField }) => (
                        <DocumentTypeSelect
                          field={{
                            value: documentTypeField.value?.toString() || "",
                            onChange: (value: string) => {
                              // Convert string value to number for the ID
                              const numValue = parseInt(value);
                              documentTypeField.onChange(numValue);
                            }
                          }}
                          label="Aina ya Nyaraka"
                          //placeholder="Select document type"
                        />
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.documentNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-500">
                            Namba ya Nyaraka
                          </FormLabel>
                          <FormControl>
                            <Input 
                           // placeholder="Enter document number" 
                            className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.documentIssuedDate`}
                      render={({ field }) => (
                        <DatePickerFormField
                          field={field}
                          label="Tarehe ya Kutolewa kwa Nyaraka"
                         // placeholder="Select issued date"
                        />
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.documentExpiryDate`}
                      render={({ field }) => (
                        <DatePickerFormField
                          field={field}
                          label="Tarehe ya Kuisha kwa Nyaraka"
                          //placeholder="Select expiry date"
                        />
                      )}
                    />
                    
                    
                    <FormField
                      control={form.control}
                      name={`dependants.${index}.issuedCountryId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-neutral-500">
                          Nchi Iliyo Toa Nyaraka
                          </FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              const numValue = parseInt(value);
                              field.onChange(numValue);
                              // Set the country name based on the selected ID
                              const selectedCountry = countries.find(c => c.EntryId === numValue);
                              const countryName = selectedCountry?.CountryName || "";
                              form.setValue(`dependants.${index}.issuedCountry`, countryName);
                              
                              // Debug log for country selection
                              console.log(`Selected country for dependant ${index + 1}:`, {
                                countryId: numValue,
                                countryName,
                                foundCountry: !!selectedCountry
                              });
                            }} 
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                  {field.value ? (
                                    <span>
                                      {countries.find(c => c.EntryId === field.value)?.CountryName || "Select country"}
                                    </span>
                                  ) : (
                                    <SelectValue placeholder="Select country" />
                                  )}
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {isLoadingData ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                              ) : countries.length > 0 ? (
                                countries.map((country) => (
                                  <SelectItem key={country.EntryId} value={country.EntryId?.toString() || ""}>
                                    {country.CountryName}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No countries available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between">
            <LoadingButton 
              type="button" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-2 rounded flex items-center"
              onClick={handleSaveAndExit}
              isLoading={isExiting}
              loadingText="Inaendelea..."
              spinnerVariant="secondary"
            >
              <Save className="mr-2 h-4 w-4" />
              Hifadhi na Toka
            </LoadingButton>
            
            <LoadingButton 
              type="submit" 
              className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded flex items-center"
              isLoading={isLoading}
              loadingText="Inaendelea..."
              spinnerVariant="primary"
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
