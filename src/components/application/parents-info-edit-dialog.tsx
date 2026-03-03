import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Calendar, Globe, Save } from 'lucide-react';
import { useApplication } from '@/contexts/application-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { LoadingButton } from '@/components/ui/loading-button';
import { verificationEndpoints } from '@/lib/api/endpoints/verification';

// Form validation schema - all fields optional
const parentsInfoSchema = z.object({
  // Father information
  fatherFullName: z.string().optional(),
  fatherDateOfBirth: z.string().optional(),
  fatherCountryOfBirth: z.string().optional(),
  fatherRegionOfBirth: z.string().optional(),
  fatherNationality: z.string().optional(),
  fatherCountryOfResident: z.string().optional(),
  
  // Mother information
  motherFullName: z.string().optional(),
  motherDateOfBirth: z.string().optional(),
  motherCountryOfBirth: z.string().optional(),
  motherRegionOfBirth: z.string().optional(),
  motherNationality: z.string().optional(),
  motherCountryOfResident: z.string().optional(),
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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingNationalities, setIsLoadingNationalities] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  
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
      loadDialogData();
    }
  }, [open, applicationId]);

  // Load all data in proper sequence
  const loadDialogData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch countries using verification endpoints
      setIsLoadingCountries(true);
      const countriesResponse = await verificationEndpoints.fetchCountries();
      let countriesList: any[] = [];
      if (countriesResponse.ackCode === 1 && countriesResponse.jsonResult) {
        countriesList = countriesResponse.jsonResult;
        setCountries(countriesList);
      }
      setIsLoadingCountries(false);

      // Fetch nationalities using verification endpoints
      setIsLoadingNationalities(true);
      const nationalitiesResponse = await verificationEndpoints.fetchNationalities();
      let nationalitiesList: any[] = [];
      if (nationalitiesResponse.ackCode === 1 && nationalitiesResponse.jsonResult) {
        nationalitiesList = nationalitiesResponse.jsonResult;
        setNationalities(nationalitiesList);
      }
      setIsLoadingNationalities(false);

      // Fetch regions - we need to get Tanzania's country ID first (usually 1)
      setIsLoadingRegions(true);
      // Find Tanzania in the countries list
      const tanzania = countriesList.find(c => c.CountryName?.toLowerCase().includes('tanzania'));
      if (tanzania) {
        const regionsResponse = await verificationEndpoints.fetchRegions(tanzania.EntryId);
        if (regionsResponse.ackCode === 1 && regionsResponse.jsonResult) {
          setRegions(regionsResponse.jsonResult);
        }
      }
      setIsLoadingRegions(false);

      // Now fetch parents info
      await fetchParentsInfo();
    } catch (error) {
      console.error('Error loading dialog data:', error);
      toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata data za rejea. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchParentsInfo = async () => {
    if (!applicationId) return;

    try {
      const response = await fetch(`${apiBaseUrl}/applications/${applicationId}/parents-info`);
      if (response.ok) {
        const data = await response.json();
        if (data.ackCode === 1 && data.jsonResult) {
          const parentsInfo = data.jsonResult;
          
          console.log('Parents Info from API:', parentsInfo);
          console.log('Available countries:', countries);
          console.log('Available regions:', regions);
          console.log('Available nationalities:', nationalities);
          
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

          // Match country and region names with dropdown options
          const fatherCountryMatch = countries.find(c => 
            c.CountryName?.toLowerCase() === parentsInfo.fatherCountryOfBirth?.toLowerCase()
          );
          const motherCountryMatch = countries.find(c => 
            c.CountryName?.toLowerCase() === parentsInfo.motherCountryOfBirth?.toLowerCase()
          );
          
          const fatherRegionMatch = regions.find(r => 
            r.RegionName?.toLowerCase() === parentsInfo.fatherRegionOfBirth?.toLowerCase()
          );
          const motherRegionMatch = regions.find(r => 
            r.RegionName?.toLowerCase() === parentsInfo.motherRegionOfBirth?.toLowerCase()
          );
          
          const fatherNationalityMatch = nationalities.find(n => {
            const name = n.NationalityName || n.Nationality || n.Name || '';
            return name.toLowerCase() === parentsInfo.fatherNationality?.toLowerCase();
          });
          const motherNationalityMatch = nationalities.find(n => {
            const name = n.NationalityName || n.Nationality || n.Name || '';
            return name.toLowerCase() === parentsInfo.motherNationality?.toLowerCase();
          });

          console.log('Father country match:', fatherCountryMatch);
          console.log('Mother country match:', motherCountryMatch);
          console.log('Father region match:', fatherRegionMatch);
          console.log('Mother region match:', motherRegionMatch);

          form.reset({
            fatherFullName: parentsInfo.fatherFullName || '',
            fatherDateOfBirth: fatherDateOfBirth,
            fatherCountryOfBirth: fatherCountryMatch?.CountryName || parentsInfo.fatherCountryOfBirth || '',
            fatherRegionOfBirth: fatherRegionMatch?.RegionName || parentsInfo.fatherRegionOfBirth || '',
            fatherNationality: fatherNationalityMatch ? (fatherNationalityMatch.NationalityName || fatherNationalityMatch.Nationality || fatherNationalityMatch.Name) : parentsInfo.fatherNationality || '',
            fatherCountryOfResident: parentsInfo.fatherCountryOfResident || '',
            motherFullName: parentsInfo.motherFullName || '',
            motherDateOfBirth: motherDateOfBirth,
            motherCountryOfBirth: motherCountryMatch?.CountryName || parentsInfo.motherCountryOfBirth || '',
            motherRegionOfBirth: motherRegionMatch?.RegionName || parentsInfo.motherRegionOfBirth || '',
            motherNationality: motherNationalityMatch ? (motherNationalityMatch.NationalityName || motherNationalityMatch.Nationality || motherNationalityMatch.Name) : parentsInfo.motherNationality || '',
            motherCountryOfResident: parentsInfo.motherCountryOfResident || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching parents info:', error);
    }
  };

  const onSubmit = async (data: ParentsInfoFormValues) => {
    if (!applicationId) return;

    setIsSubmitting(true);
    try {
      // Map dropdown names to IDs
      const fatherCountryOfBirth = countries.find(c => c.CountryName === data.fatherCountryOfBirth);
      const fatherCountryOfResident = countries.find(c => c.CountryName === data.fatherCountryOfResident);
      const motherCountryOfBirth = countries.find(c => c.CountryName === data.motherCountryOfBirth);
      const motherCountryOfResident = countries.find(c => c.CountryName === data.motherCountryOfResident);
      
      const fatherRegionOfBirth = regions.find(r => r.RegionName === data.fatherRegionOfBirth);
      const motherRegionOfBirth = regions.find(r => r.RegionName === data.motherRegionOfBirth);
      
      const fatherNationality = nationalities.find(n => {
        const name = n.NationalityName || n.Nationality || n.Name || '';
        return name === data.fatherNationality;
      });
      const motherNationality = nationalities.find(n => {
        const name = n.NationalityName || n.Nationality || n.Name || '';
        return name === data.motherNationality;
      });

      // Prepare the payload with the exact field names expected by the API
      const parentsPayload = {
        fatherFullName: data.fatherFullName,
        fatherDateOfBirth: data.fatherDateOfBirth,
        fatherCountryOfBirthId: fatherCountryOfBirth?.EntryId || 0,
        fatherCountryOfResidentId: fatherCountryOfResident?.EntryId || 0,
        fatherNationalityId: fatherNationality?.EntryId || fatherNationality?.EntryID || 0,
        fatherRegionOfBirthId: fatherRegionOfBirth?.EntryId || fatherRegionOfBirth?.EntryID || 0,
        motherFullName: data.motherFullName,
        motherDateOfBirth: data.motherDateOfBirth,
        motherRegionOfBirthId: motherRegionOfBirth?.EntryId || motherRegionOfBirth?.EntryID || 0,
        motherCountryOfBirthId: motherCountryOfBirth?.EntryId || 0,
        motherCountryOfResidentId: motherCountryOfResident?.EntryId || 0,
        motherNationalityId: motherNationality?.EntryId || motherNationality?.EntryID || 0,
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
          <DialogTitle className="text-slate-600 border-b pb-2 border-slate-200">Hariri Taarifa za Wazazi</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex justify-center items-center py-8">
                     <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
                     <span className="ml-2 text-slate-200">Inapakia taarifa...</span>
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
                            {/* <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                            {/* <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                                {/* <Globe className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua nchi" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingCountries ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : countries.length > 0 ? (
                              countries
                                .filter((country) => country.CountryName && country.CountryName.trim() !== '')
                                .map((country) => (
                                  <SelectItem key={country.EntryId} value={country.CountryName}>
                                    {country.CountryName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna nchi zilizopatikana</div>
                            )}
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
                                {/* <MapPin className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua mkoa" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingRegions ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : regions.length > 0 ? (
                              regions
                                .filter((region) => region.RegionName && region.RegionName.trim() !== '')
                                .map((region) => (
                                  <SelectItem key={region.EntryId || region.EntryID} value={region.RegionName}>
                                    {region.RegionName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna mikoa iliyopatikana</div>
                            )}
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
                                {/* <Globe className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua uraia" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingNationalities ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : nationalities.length > 0 ? (
                              nationalities
                                .filter((nationality) => {
                                  const name = nationality.NationalityName || nationality.Nationality || nationality.Name || '';
                                  return name.trim() !== '';
                                })
                                .map((nationality) => {
                                  const name = nationality.NationalityName || nationality.Nationality || nationality.Name || '';
                                  return (
                                    <SelectItem key={nationality.EntryId || nationality.EntryID} value={name}>
                                      {name}
                                    </SelectItem>
                                  );
                                })
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna uraia uliopatikana</div>
                            )}
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
                                {/* <Globe className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua nchi" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingCountries ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : countries.length > 0 ? (
                              countries
                                .filter((country) => country.CountryName && country.CountryName.trim() !== '')
                                .map((country) => (
                                  <SelectItem key={country.EntryId} value={country.CountryName}>
                                    {country.CountryName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna nchi zilizopatikana</div>
                            )}
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
                            {/* <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                            {/* <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                                {/* <Globe className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua nchi" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingCountries ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : countries.length > 0 ? (
                              countries
                                .filter((country) => country.CountryName && country.CountryName.trim() !== '')
                                .map((country) => (
                                  <SelectItem key={country.EntryId} value={country.CountryName}>
                                    {country.CountryName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna nchi zilizopatikana</div>
                            )}
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
                                {/* <MapPin className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua mkoa" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingRegions ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : regions.length > 0 ? (
                              regions
                                .filter((region) => region.RegionName && region.RegionName.trim() !== '')
                                .map((region) => (
                                  <SelectItem key={region.EntryId || region.EntryID} value={region.RegionName}>
                                    {region.RegionName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna mikoa iliyopatikana</div>
                            )}
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
                                {/* <Globe className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua uraia" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingNationalities ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : nationalities.length > 0 ? (
                              nationalities
                                .filter((nationality) => {
                                  const name = nationality.NationalityName || nationality.Nationality || nationality.Name || '';
                                  return name.trim() !== '';
                                })
                                .map((nationality) => {
                                  const name = nationality.NationalityName || nationality.Nationality || nationality.Name || '';
                                  return (
                                    <SelectItem key={nationality.EntryId || nationality.EntryID} value={name}>
                                      {name}
                                    </SelectItem>
                                  );
                                })
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna uraia uliopatikana</div>
                            )}
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
                                {/* <Globe className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua nchi" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingCountries ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : countries.length > 0 ? (
                              countries
                                .filter((country) => country.CountryName && country.CountryName.trim() !== '')
                                .map((country) => (
                                  <SelectItem key={country.EntryId} value={country.CountryName}>
                                    {country.CountryName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna nchi zilizopatikana</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

             <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between mt-6 border-t pt-4 border-slate-200 gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Ghairi
                </Button>
                <LoadingButton 
                  type="submit" 
                  isLoading={isSubmitting}
                  loadingText="Inahifadhi..."
                   className="bg-blue-800 hover:bg-blue-900 min-w-[100px] rounded w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                    Hifadhi Mabadiliko
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
