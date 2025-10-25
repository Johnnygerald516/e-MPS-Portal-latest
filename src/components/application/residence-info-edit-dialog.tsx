import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2,Calendar, Globe, Home, Save } from 'lucide-react';
import { useApplication } from '@/contexts/application-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingButton } from '@/components/ui/loading-button';

// Form validation schema
const residenceInfoSchema = z.object({
  // Current residence location
  countryOfResidence: z.string().min(1, "Nchi ya makazi inahitajika"),
  region: z.string().min(1, "Mkoa unahitajika"),
  district: z.string().min(1, "Wilaya inahitajika"),
  ward: z.string().min(1, "Kata inahitajika"),
  street: z.string().min(1, "Mtaa unahitajika"),
  
  // Contact and identification
  phoneNumber: z.string().min(1, "Namba ya simu inahitajika"),
  houseNumber: z.string().optional(),
  plotNumber: z.string().optional(),
  
  // Origin country and nationality
  residenceNationality: z.string().min(1, "Uraia unahitajika"),
  countryOfOrigin: z.string().min(1, "Nchi ya asili inahitajika"),
  
  // Date of entry
  dateOfEntry: z.string().min(1, "Tarehe ya kuingia nchini inahitajika"),
});

type ResidenceInfoFormValues = z.infer<typeof residenceInfoSchema>;

interface ResidenceInfoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ResidenceInfoEditDialog({ open, onOpenChange, onSuccess }: ResidenceInfoEditDialogProps) {
  const { toast } = useToast();
  const { formData, updateFormData } = useApplication();
  const applicationId = formData.applicationId;
  
  // API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Options for dropdowns
  const [countries, setCountries] = useState<any[]>([]);
  const [nationalities, setNationalities] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const form = useForm<ResidenceInfoFormValues>({
    resolver: zodResolver(residenceInfoSchema),
    defaultValues: {
      countryOfResidence: '',
      region: '',
      district: '',
      ward: '',
      street: '',
      phoneNumber: '',
      houseNumber: '',
      plotNumber: '',
      residenceNationality: '',
      countryOfOrigin: '',
      dateOfEntry: '',
    },
  });

  // Fetch residence info data when dialog opens
  useEffect(() => {
    if (open && applicationId) {
      fetchResidenceInfo();
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

      // Fetch wards
      const wardsResponse = await fetch(`${apiBaseUrl}/wards`);
      if (wardsResponse.ok) {
        const wardsData = await wardsResponse.json();
        setWards(wardsData.jsonResult || []);
      }
    } catch (error) {
    toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata data za rejea. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    }
  };

  const fetchResidenceInfo = async () => {
    if (!applicationId) return;

    setIsLoadingData(true);
    try {
      const response = await fetch(`${apiBaseUrl}/applications/${applicationId}/residence-info`);
      if (response.ok) {
        const data = await response.json();
        if (data.ackCode === 1 && data.jsonResult) {
          const residenceInfo = data.jsonResult;
          
          // Format date if it exists
          let dateOfEntry = '';
          if (residenceInfo.dateOfEntry) {
            try {
              const parsedDate = new Date(residenceInfo.dateOfEntry);
              if (!isNaN(parsedDate.getTime())) {
                dateOfEntry = parsedDate.toISOString().split('T')[0];
              } else {
                dateOfEntry = residenceInfo.dateOfEntry;
              }
            } catch (error) {
              dateOfEntry = residenceInfo.dateOfEntry;
            }
          }

          form.reset({
            countryOfResidence: residenceInfo.countryOfResidence || '',
            region: residenceInfo.region || '',
            district: residenceInfo.district || '',
            ward: residenceInfo.wardResidence || '',
            street: residenceInfo.streetName || '',
            phoneNumber: residenceInfo.phoneNo || '',
            houseNumber: residenceInfo.houseNo || '',
            plotNumber: residenceInfo.plotNo || '',
            residenceNationality: residenceInfo.nationality || '',
            countryOfOrigin: residenceInfo.countryOfOrigin || '',
            dateOfEntry: dateOfEntry,
          });
        }
      } else {
        toast({
          title: 'Hitilafu',
          description: 'Imeshindikana kupata taarifa za makazi. Tafadhali jaribu tena.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata taarifa za makazi. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSubmit = async (data: ResidenceInfoFormValues) => {
    if (!applicationId) return;

    setIsSubmitting(true);
    try {
      // Prepare the payload with the exact field names expected by the API
      const residencePayload = {
        applicationId: applicationId,
        // Use the exact field names expected by the API
        wardResidenceId: data.ward, 
        streetName: data.street,
        phoneNo: data.phoneNumber,
        houseNo: data.houseNumber || '',
        plotNo: data.plotNumber || '',
        countryOfOriginId: data.countryOfOrigin || '', 
        nationalityId: data.residenceNationality || '', 
        dateOfEntry: data.dateOfEntry || ''
      };

      const response = await fetch(`${apiBaseUrl}/applications/${applicationId}/residence-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residencePayload),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.ackCode === 1) {
          toast({
            title: 'Imefanikiwa',
            description: 'Taarifa za makazi zimehifadhiwa kikamilifu.',
          });
          
          // Update form data in context
          updateFormData({
            countryOfResidence: data.countryOfResidence,
            region: data.region,
            district: data.district,
            ward: data.ward,
            street: data.street,
            phoneNumber: data.phoneNumber,
            houseNumber: data.houseNumber,
            plotNumber: data.plotNumber,
            residenceNationality: data.residenceNationality,
            countryOfOrigin: data.countryOfOrigin,
            dateOfEntry: data.dateOfEntry
          });
          
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          toast({
            title: 'Hitilafu',
            description: responseData.ackMessage || 'Imeshindikana kuhifadhi taarifa za makazi.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Hitilafu',
          description: 'Imeshindikana kuhifadhi taarifa za makazi. Tafadhali jaribu tena.',
          variant: 'destructive',
        });
      }
    } catch (error) {
    toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kuhifadhi taarifa za makazi. Tafadhali jaribu tena.',
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
          <DialogTitle className="text-slate-600 border-b pb-2 border-slate-200">Hariri Taarifa za Makazi</DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
                      <span className="ml-2 text-slate-200">Inapakia taarifa...</span>
                    </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Anuwani ya Makazi Section */}
              <div className="mb-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Row 1: Nchi ya Makazi, Mkoa, Wilaya */}
                  <FormField
                    control={form.control}
                    name="countryOfResidence"
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
                                <SelectValue placeholder="Nchi ya Makazi" />
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
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Mkoa <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            {/* <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Wilaya <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            {/* <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                  
                  {/* Row 2: Kata, Mtaa, Uraia */}
                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Kata <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                {/* <MapPin className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua kata" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {wards.map((ward) => (
                              <SelectItem key={ward.EntryId} value={ward.WardName}>
                                {ward.WardName}
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
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Mtaa <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            {/* <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                    name="residenceNationality"
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
                  
                  {/* Row 3: Namba ya Simu, Namba ya Nyumba, Namba ya Kiwanja */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Namba ya Simu <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            {/* <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                    name="houseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Namba ya Nyumba</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {/* <Home className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                    name="plotNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Namba ya Kiwanja</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {/* <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /> */}
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
                  
                  {/* Row 4: Nchi ya Asili, Tarehe ya Kuingia Nchini */}
                  <FormField
                    control={form.control}
                    name="countryOfOrigin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Asili <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                {/* <Globe className="mr-2 h-4 w-4 text-slate-400" /> */}
                                <SelectValue placeholder="Chagua nchi ya asili" />
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
                  
                  <FormField
                    control={form.control}
                    name="dateOfEntry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Tarehe ya Kuingia Nchini <span className="text-red-500">*</span></FormLabel>
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
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between mt-6 border-t pt-4 border-slate-200 gap-3">
                <Button 
                type="button" 
                variant="outline" 
                 onClick={() => onOpenChange(false)}>
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
