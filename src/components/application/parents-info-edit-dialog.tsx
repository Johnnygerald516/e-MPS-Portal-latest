import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Calendar, Globe, MapPin } from 'lucide-react';
import { useApplication } from '@/contexts/application-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { LoadingButton } from '@/components/ui/loading-button';

// Form validation schema
const parentsInfoSchema = z.object({
  // Father information
  fatherFullName: z.string().min(1, "Jina kamili la baba linahitajika"),
  fatherDateOfBirth: z.string().min(1, "Tarehe ya kuzaliwa ya baba inahitajika"),
  fatherCountryOfBirth: z.string().min(1, "Nchi ya kuzaliwa ya baba inahitajika"),
  fatherRegionOfBirth: z.string().min(1, "Mkoa wa kuzaliwa wa baba unahitajika"),
  fatherNationality: z.string().min(1, "Uraia wa baba unahitajika"),
  fatherCountryOfResident: z.string().min(1, "Nchi ya makazi ya baba inahitajika"),
  
  // Mother information
  motherFullName: z.string().min(1, "Jina kamili la mama linahitajika"),
  motherDateOfBirth: z.string().min(1, "Tarehe ya kuzaliwa ya mama inahitajika"),
  motherCountryOfBirth: z.string().min(1, "Nchi ya kuzaliwa ya mama inahitajika"),
  motherRegionOfBirth: z.string().min(1, "Mkoa wa kuzaliwa wa mama unahitajika"),
  motherNationality: z.string().min(1, "Uraia wa mama unahitajika"),
  motherCountryOfResident: z.string().min(1, "Nchi ya makazi ya mama inahitajika"),
});

type ParentsInfoFormValues = z.infer<typeof parentsInfoSchema>;

interface ParentsInfoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ParentsInfoEditDialog({ open, onOpenChange, onSuccess }: ParentsInfoEditDialogProps) {
  const { toast } = useToast();
  const { formData, updateFormData } = useApplication();
  const applicationId = formData.applicationId;
  
  // API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.emps.go.tz/api';
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Options for dropdowns
  const [countries, setCountries] = useState<any[]>([]);
  const [nationalities, setNationalities] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  
  const form = useForm<ParentsInfoFormValues>({
    resolver: zodResolver(parentsInfoSchema),
    defaultValues: {
      fatherFullName: '',
      fatherDateOfBirth: '',
      fatherCountryOfBirth: '',
      fatherRegionOfBirth: '',
      fatherNationality: '',
      fatherCountryOfResident: '',
      motherFullName: '',
      motherDateOfBirth: '',
      motherCountryOfBirth: '',
      motherRegionOfBirth: '',
      motherNationality: '',
      motherCountryOfResident: '',
    },
  });

  // Fetch parents info data when dialog opens
  useEffect(() => {
    if (open && applicationId) {
      fetchParentsInfo();
      fetchReferenceData();
    }
  }, [open, applicationId]);

  const fetchReferenceData = async () => {
    try {
      // Fetch countries
      const countriesResponse = await fetch(`${apiBaseUrl}/countries`);
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json();
        setCountries(countriesData.jsonResult || []);
      }

      // Fetch nationalities
      const nationalitiesResponse = await fetch(`${apiBaseUrl}/nationalities`);
      if (nationalitiesResponse.ok) {
        const nationalitiesData = await nationalitiesResponse.json();
        setNationalities(nationalitiesData.jsonResult || []);
      }

      // Fetch regions
      const regionsResponse = await fetch(`${apiBaseUrl}/regions`);
      if (regionsResponse.ok) {
        const regionsData = await regionsResponse.json();
        setRegions(regionsData.jsonResult || []);
      }
    } catch (error) {
      toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata data za rejea. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    }
  };

  const fetchParentsInfo = async () => {
    if (!applicationId) return;

    setIsLoadingData(true);
    try {
      const response = await fetch(`${apiBaseUrl}/applications/${applicationId}/parents-info`);
      if (response.ok) {
        const data = await response.json();
        if (data.ackCode === 1 && data.jsonResult) {
          const parentsInfo = data.jsonResult;
          
          // Format dates if they exist
          let fatherDateOfBirth = '';
          if (parentsInfo.fatherDateOfBirth) {
            try {
              const parsedDate = new Date(parentsInfo.fatherDateOfBirth);
              if (!isNaN(parsedDate.getTime())) {
                fatherDateOfBirth = parsedDate.toISOString().split('T')[0];
              } else {
                fatherDateOfBirth = parentsInfo.fatherDateOfBirth;
              }
            } catch (error) {
              fatherDateOfBirth = parentsInfo.fatherDateOfBirth;
            }
          }
          
          let motherDateOfBirth = '';
          if (parentsInfo.motherDateOfBirth) {
            try {
              const parsedDate = new Date(parentsInfo.motherDateOfBirth);
              if (!isNaN(parsedDate.getTime())) {
                motherDateOfBirth = parsedDate.toISOString().split('T')[0];
              } else {
                motherDateOfBirth = parentsInfo.motherDateOfBirth;
              }
            } catch (error) {
              motherDateOfBirth = parentsInfo.motherDateOfBirth;
            }
          }

          form.reset({
            fatherFullName: parentsInfo.fatherFullName || '',
            fatherDateOfBirth: fatherDateOfBirth,
            fatherCountryOfBirth: parentsInfo.fatherCountryOfBirth || '',
            fatherRegionOfBirth: parentsInfo.fatherRegionOfBirth || '',
            fatherNationality: parentsInfo.fatherNationality || '',
            fatherCountryOfResident: parentsInfo.fatherCountryOfResident || '',
            motherFullName: parentsInfo.motherFullName || '',
            motherDateOfBirth: motherDateOfBirth,
            motherCountryOfBirth: parentsInfo.motherCountryOfBirth || '',
            motherRegionOfBirth: parentsInfo.motherRegionOfBirth || '',
            motherNationality: parentsInfo.motherNationality || '',
            motherCountryOfResident: parentsInfo.motherCountryOfResident || '',
          });
        }
      } else {
        toast({
          title: 'Hitilafu',
          description: 'Imeshindikana kupata taarifa za wazazi. Tafadhali jaribu tena.',
          variant: 'destructive',
        });
      }
    } catch (error) {
    toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata taarifa za wazazi. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: ParentsInfoFormValues) => {
    if (!applicationId) return;

    setIsSubmitting(true);
    try {
      // Prepare the payload with the exact field names expected by the API
      const parentsPayload = {
        fatherFullName: data.fatherFullName,
        fatherDateOfBirth: data.fatherDateOfBirth,
        fatherCountryOfBirthId: 1, // Default to 1 if not available
        fatherCountryOfResidentId: 1, // Default to 1 if not available
        fatherNationalityId: 1, // Default to 1 if not available
        fatherRegionOfBirthId: 1, // Default to 1 if not available
        motherFullName: data.motherFullName,
        motherDateOfBirth: data.motherDateOfBirth,
        motherRegionOfBirthId: 1, // Default to 1 if not available
        motherCountryOfBirthId: 1, // Default to 1 if not available
        motherCountryOfResidentId: 1, // Default to 1 if not available
        motherNationalityId: 1, // Default to 1 if not available
      };

      const response = await fetch(`${apiBaseUrl}/applications/${applicationId}/parents-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parentsPayload),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.ackCode === 1) {
          toast({
            title: 'Imefanikiwa',
            description: 'Taarifa za wazazi zimehifadhiwa kikamilifu.',
          });
          
          // Update form data in context
          updateFormData({
            fatherName: data.fatherFullName,
            fatherDateOfBirth: data.fatherDateOfBirth,
            fatherCountryOfBirth: data.fatherCountryOfBirth,
            fatherRegionOfBirth: data.fatherRegionOfBirth,
            fatherNationality: data.fatherNationality,
            motherName: data.motherFullName,
            motherDateOfBirth: data.motherDateOfBirth,
            motherCountryOfBirth: data.motherCountryOfBirth,
            motherRegionOfBirth: data.motherRegionOfBirth,
            motherNationality: data.motherNationality
            // Note: Country of residence properties are not currently in the ApplicationFormData interface
            // and should be added if needed for complete data storage
          });
          
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          toast({
            title: 'Hitilafu',
            description: responseData.ackMessage || 'Imeshindikana kuhifadhi taarifa za wazazi.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Hitilafu',
          description: 'Imeshindikana kuhifadhi taarifa za wazazi. Tafadhali jaribu tena.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kuhifadhi taarifa za wazazi. Tafadhali jaribu tena.',
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
          <DialogTitle className="text-xl font-semibold">Hariri Taarifa za Wazazi</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Inapakia taarifa...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Father Information Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium border-b pb-2 mb-4">Taarifa za Baba</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Father's Full Name */}
                  <FormField
                    control={form.control}
                    name="fatherFullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Jina Kamili la Baba <span className="text-red-500">*</span></FormLabel>
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
                  
                  {/* Father's Date of Birth */}
                  <FormField
                    control={form.control}
                    name="fatherDateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Tarehe ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input 
                              type="date"
                              className="border border-gray-300 rounded pl-10 py-2 w-full focus:border-blue-500 focus:outline-none" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Father's Country of Birth */}
                  <FormField
                    control={form.control}
                    name="fatherCountryOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Chagua nchi" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                              <SelectItem key={country.EntryId} value={country.CountryName}>
                                {country.CountryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Father's Region of Birth */}
                  <FormField
                    control={form.control}
                    name="fatherRegionOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Mkoa wa Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Chagua mkoa" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {regions.map((region) => (
                              <SelectItem key={region.EntryId} value={region.RegionName}>
                                {region.RegionName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Father's Nationality */}
                  <FormField
                    control={form.control}
                    name="fatherNationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Uraia <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Chagua uraia" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {nationalities.map((nationality) => (
                              <SelectItem key={nationality.EntryId} value={nationality.NationalityName}>
                                {nationality.NationalityName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Father's Country of Residence */}
                  <FormField
                    control={form.control}
                    name="fatherCountryOfResident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Makazi <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Chagua nchi" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                              <SelectItem key={country.EntryId} value={country.CountryName}>
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
              </div>
              
              {/* Mother Information Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium border-b pb-2 mb-4">Taarifa za Mama</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mother's Full Name */}
                  <FormField
                    control={form.control}
                    name="motherFullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Jina Kamili la Mama <span className="text-red-500">*</span></FormLabel>
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
                  
                  {/* Mother's Date of Birth */}
                  <FormField
                    control={form.control}
                    name="motherDateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Tarehe ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input 
                              type="date"
                              className="border border-gray-300 rounded pl-10 py-2 w-full focus:border-blue-500 focus:outline-none" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Mother's Country of Birth */}
                  <FormField
                    control={form.control}
                    name="motherCountryOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Chagua nchi" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                              <SelectItem key={country.EntryId} value={country.CountryName}>
                                {country.CountryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Mother's Region of Birth */}
                  <FormField
                    control={form.control}
                    name="motherRegionOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Mkoa wa Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Chagua mkoa" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {regions.map((region) => (
                              <SelectItem key={region.EntryId} value={region.RegionName}>
                                {region.RegionName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Mother's Nationality */}
                  <FormField
                    control={form.control}
                    name="motherNationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Uraia <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Chagua uraia" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {nationalities.map((nationality) => (
                              <SelectItem key={nationality.EntryId} value={nationality.NationalityName}>
                                {nationality.NationalityName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Mother's Country of Residence */}
                  <FormField
                    control={form.control}
                    name="motherCountryOfResident"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Makazi <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="Chagua nchi" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                              <SelectItem key={country.EntryId} value={country.CountryName}>
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
              </div>

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
