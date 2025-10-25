import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Calendar, Globe, Save } from 'lucide-react';
import { useApplication } from '@/contexts/application-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { LoadingButton } from '@/components/ui/loading-button';
import { InteractiveCheckbox } from '@/components/ui/interactive-checkbox';
import { DatePickerFormField } from '@/components/ui/date-picker-form-field';
import { RelationshipTypeSelect } from '@/components/ui/relationship-type-select';
import { DocumentTypeSelect } from '@/components/ui/document-type-select';
import { verificationEndpoints } from '@/lib/api/endpoints/verification';
import { dependantInfoEndpoints, DependantInfoPayload } from '@/lib/api/endpoints/dependant-info';

// Form validation schema
const dependantSchema = z.object({
  name: z.string().min(2, "Jina linahitajika"),
  gender: z.string().min(1, "Jinsia inahitajika"),
  relationship: z.string().min(2, "Uhusiano unahitajika"),
  relationshipTypeId: z.number().min(1, "Aina ya uhusiano inahitajika"),
  dateOfBirth: z.union([z.string(), z.date()])
    .refine(val => !!val, {
      message: "Tarehe ya kuzaliwa inahitajika",
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
      message: "Mtegemezi lazima awe na umri wa miaka 18 au chini",
    }),
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

const dependantsInfoSchema = z.object({
  dependants: z.array(dependantSchema).min(1, "Angalau mtegemezi mmoja anahitajika"),
});

type DependantsInfoFormValues = z.infer<typeof dependantsInfoSchema>;

interface Country {
  EntryId: number;
  CountryName: string;
}

interface Nationality {
  EntryId?: number;
  Nationality?: string;
  [key: string]: any;
}

interface DependantsInfoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DependantsInfoEditDialog({ open, onOpenChange, onSuccess }: DependantsInfoEditDialogProps) {
  const { toast } = useToast();
  const { formData, updateFormData } = useApplication();
  const applicationId = formData.applicationId;
  
  // API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.emps.go.tz/api';
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Options for dropdowns
  const [countries, setCountries] = useState<Country[]>([]);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  
  const form = useForm<DependantsInfoFormValues>({
    resolver: zodResolver(dependantsInfoSchema),
    defaultValues: {
      dependants: [],
    },
  });
  
  // Use field array for dynamic dependants
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dependants",
  });

  // Fetch dependants info data when dialog opens
  useEffect(() => {
    if (open && applicationId) {
      fetchDependantsInfo();
      fetchReferenceData();
    }
  }, [open, applicationId]);

  const fetchReferenceData = async () => {
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
       toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata data za rejea. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    }
  };

  const fetchDependantsInfo = async () => {
    if (!applicationId) return;

    setIsLoadingData(true);
    try {
      const response = await dependantInfoEndpoints.getDependantInfo(applicationId);
      
      if (response.ackCode === 1 && response.jsonResult) {
        const dependantInfo = response.jsonResult;
        
        // Check if dependantInfo is an array or a single object
        const dependantsArray = Array.isArray(dependantInfo) 
          ? dependantInfo 
          : [dependantInfo]; // Convert to array if it's a single object
        
        // Map API response to form values
        const formattedDependants = dependantsArray.map(dep => {
          // Format dates if they exist
          const formatDate = (dateString: string | undefined): string => {
            if (!dateString) return '';
            try {
              const parsedDate = new Date(dateString);
              if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toISOString().split('T')[0];
              }
              return dateString;
            } catch (error) {
              return dateString;
            }
          };
          
          return {
            name: dep.dependantFullName || '',
            gender: dep.dependantGender || '',
            relationship: dep.dependantRelationType || '',
            relationshipTypeId: dep.dependantRelationTypeID || 0,
            dateOfBirth: formatDate(dep.dateOfBirth),
            hasDocument: !!dep.hasDocument,
            documentNumber: dep.documentNo || '',
            documentTypeId: dep.documentTypeID || 0,
            documentIssuedDate: formatDate(dep.issuedDate),
            documentExpiryDate: formatDate(dep.expireDate),
            nationality: dep.dependantNationalityID || '',
            nationalityId: typeof dep.dependantNationalityID === 'number' ? dep.dependantNationalityID : 0,
            issuedCountry: dep.issuedCountry || '',
            issuedCountryId: dep.issuedCountryID || 0,
          };
        });
        
        // Reset form with fetched data
        form.reset({
          dependants: formattedDependants,
        });
      }
    } catch (error) {
      toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata taarifa za wategemezi. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Add new dependant
  const addDependant = () => {
    append({
      name: "",
      gender: "",
      relationship: "",
      relationshipTypeId: 0,
      dateOfBirth: "",
      hasDocument: false,
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

  const onSubmit = async (data: DependantsInfoFormValues) => {
    if (!applicationId) return;

    setIsSubmitting(true);
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
          }
          
          // If we can't parse it, return empty string
          return '';
        }
        
        // Handle Date object
        return date.toISOString().split('T')[0];
      };
      
      // Map dependants to API format
      const dependants = data.dependants.map(dep => {
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
      });
      
      // Check if any dependant has documents
      const hasAnyDocuments = data.dependants.some(dep => dep.hasDocument) || false;
      
      // Create the payload with the expected structure matching the API format
      const formattedPayload: DependantInfoPayload = {
        applicationId: applicationId,
        hasDocument: hasAnyDocuments ? 1 : 0,
        dependants: dependants
      };
      
      const response = await dependantInfoEndpoints.saveDependantInfo(formattedPayload);
      
      if (response.ackCode === 1) {
        toast({
          title: 'Imefanikiwa',
          description: 'Taarifa za wategemezi zimehifadhiwa kikamilifu.',
        });
        
        // Update form data in context
        updateFormData({
          hasDependants: true,
          dependants: data.dependants
        });
        
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: 'Hitilafu',
          description: response.ackMessage || 'Imeshindikana kuhifadhi taarifa za wategemezi.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kuhifadhi taarifa za wategemezi. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Hariri Taarifa za Wategemezi</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Inapakia taarifa...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-slate-800">Wategemezi</h3>
                </div>
                <Button 
                  type="button"
                  onClick={addDependant}
                  className="border border-blue-500 text-blue-700 hover:text-blue-500 hover:border-blue-700 px-4 py-2 rounded flex items-center bg-blue hover:bg-blue-50"
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Ongeza Mtegemezi
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
                      <Save className="h-4 w-4 mr-1" />
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
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                              <Input 
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
                                <div className="flex items-center">
                                  <SelectValue placeholder="Chagua Jinsia" />
                                </div>
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
                            }} 
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                                <div className="flex items-center">
                                  <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                  {field.value ? (
                                    <span>
                                      {nationalities.find(n => n.EntryId === field.value)?.Nationality || "Chagua utaifa"}
                                    </span>
                                  ) : (
                                    <SelectValue placeholder="Chagua utaifa" />
                                  )}
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {nationalities.map((nationality) => (
                                <SelectItem key={nationality.EntryId} value={nationality.EntryId?.toString() || ""}>
                                  {nationality.Nationality || "Unknown"}
                                </SelectItem>
                              ))}
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
                        name={`dependants.${index}.documentIssuedDate`}
                        render={({ field }) => (
                          <DatePickerFormField
                            field={field}
                            label="Tarehe ya Kutolewa kwa Nyaraka"
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
                              }} 
                              value={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                                  <div className="flex items-center">
                                    <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                    {field.value ? (
                                      <span>
                                        {countries.find(c => c.EntryId === field.value)?.CountryName || "Chagua nchi"}
                                      </span>
                                    ) : (
                                      <SelectValue placeholder="Chagua nchi" />
                                    )}
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {countries.map((country) => (
                                  <SelectItem key={country.EntryId} value={country.EntryId?.toString() || ""}>
                                    {country.CountryName}
                                  </SelectItem>
                                ))}
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

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Ghairi
                </Button>
                <LoadingButton 
                  type="submit" 
                  isLoading={isSubmitting}
                  loadingText="Inahifadhi..."
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Hifadhi Taarifa
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
