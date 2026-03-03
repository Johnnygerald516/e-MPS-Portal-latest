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
import { verificationEndpoints } from '@/lib/api/endpoints/verification';

// Form validation schema - all fields optional
const residenceInfoSchema = z.object({
  // Current residence location
  countryOfResidence: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  street: z.string().optional(),
  
  // Contact and identification
  phoneNumber: z.string().optional(),
  houseNumber: z.string().optional(),
  plotNumber: z.string().optional(),
  
  // Origin country and nationality
  residenceNationality: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  
  // Date of entry
  dateOfEntry: z.string().optional(),
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
  const [regions, setRegions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  // Loading states for cascading dropdowns
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingNationalities, setIsLoadingNationalities] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  
  // Store selected IDs for cascading
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  
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
      loadDialogData();
    }
  }, [open, applicationId]);

  // Load all data in proper sequence
  const loadDialogData = async () => {
    setIsLoadingData(true);
    try {
      // First, fetch countries and nationalities
      setIsLoadingCountries(true);
      const countriesResponse = await verificationEndpoints.fetchCountries();
      let countriesList: any[] = [];
      if (countriesResponse.ackCode === 1 && countriesResponse.jsonResult) {
        countriesList = countriesResponse.jsonResult;
        setCountries(countriesList);
      }
      setIsLoadingCountries(false);

      setIsLoadingNationalities(true);
      const nationalitiesResponse = await verificationEndpoints.fetchNationalities();
      if (nationalitiesResponse.ackCode === 1 && nationalitiesResponse.jsonResult) {
        setNationalities(nationalitiesResponse.jsonResult);
      }
      setIsLoadingNationalities(false);

      // Now fetch residence info
      const response = await fetch(`${apiBaseUrl}/applications/${applicationId}/residence-info`);
      if (response.ok) {
        const data = await response.json();
        if (data.ackCode === 1 && data.jsonResult) {
          const residenceInfo = data.jsonResult;
          
          console.log('Residence Info from API:', residenceInfo);
          
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

          // API response only includes ward name, not country/region/district
          // Set only the values that come from API, leave others empty
          // Dropdowns will be populated when user selects values
          
          form.reset({
            countryOfResidence: '', // Not provided by API - user will select
            region: '', // Not provided by API - user will select
            district: '', // Not provided by API - user will select
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
      }
    } catch (error) {
      console.error('Error loading dialog data:', error);
      toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata data. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      // Fetch countries using verification endpoints
      setIsLoadingCountries(true);
      const countriesResponse = await verificationEndpoints.fetchCountries();
      if (countriesResponse.ackCode === 1 && countriesResponse.jsonResult) {
        setCountries(countriesResponse.jsonResult);
      }
      setIsLoadingCountries(false);

      // Fetch nationalities using verification endpoints
      setIsLoadingNationalities(true);
      const nationalitiesResponse = await verificationEndpoints.fetchNationalities();
      if (nationalitiesResponse.ackCode === 1 && nationalitiesResponse.jsonResult) {
        setNationalities(nationalitiesResponse.jsonResult);
      }
      setIsLoadingNationalities(false);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      setIsLoadingCountries(false);
      setIsLoadingNationalities(false);
      toast({
        title: 'Hitilafu',
        description: 'Imeshindikana kupata data za rejea. Tafadhali jaribu tena.',
        variant: 'destructive',
      });
    }
  };
  
  // Fetch regions for selected country
  const fetchRegionsForCountry = async (countryId: number) => {
    if (!countryId) return;
    
    setIsLoadingRegions(true);
    try {
      const response = await verificationEndpoints.fetchRegions(countryId);
      if (response.ackCode === 1 && response.jsonResult) {
        setRegions(response.jsonResult);
      } else {
        setRegions([]);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      setRegions([]);
    } finally {
      setIsLoadingRegions(false);
    }
  };
  
  // Fetch districts for selected region
  const fetchDistrictsForRegion = async (regionId: number) => {
    if (!regionId) return;
    
    setIsLoadingDistricts(true);
    try {
      const response = await verificationEndpoints.fetchDistricts(regionId);
      if (response.ackCode === 1 && response.jsonResult) {
        setDistricts(response.jsonResult);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    } finally {
      setIsLoadingDistricts(false);
    }
  };
  
  // Fetch wards for selected district
  const fetchWardsForDistrict = async (districtId: number) => {
    if (!districtId) return;
    
    setIsLoadingWards(true);
    try {
      const response = await verificationEndpoints.fetchWards(districtId);
      if (response.ackCode === 1 && response.jsonResult) {
        setWards(response.jsonResult);
      } else {
        setWards([]);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
      setWards([]);
    } finally {
      setIsLoadingWards(false);
    }
  };

  const onSubmit = async (data: ResidenceInfoFormValues) => {
    if (!applicationId) return;

    setIsSubmitting(true);
    try {
      // Map string values to IDs
      const wardMatch = wards.find(w => w.WardName === data.ward);
      const countryOfOriginMatch = countries.find(c => c.CountryName === data.countryOfOrigin);
      const nationalityMatch = nationalities.find(n => {
        const name = n.NationalityName || n.Nationality || n.Name || '';
        return name === data.residenceNationality;
      });

      // Prepare the payload with IDs
      const residencePayload = {
        applicationId: applicationId,
        wardResidenceId: wardMatch?.EntryId || wardMatch?.EntryID || 1,
        streetName: data.street,
        phoneNo: data.phoneNumber,
        houseNo: data.houseNumber || '',
        plotNo: data.plotNumber || '',
        countryOfOriginId: countryOfOriginMatch?.EntryId || 1,
        nationalityId: nationalityMatch?.EntryId || nationalityMatch?.EntryID || 1,
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
      <DialogContent className="w-[95vw] sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
              <div className="mb-6 sm:mb-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {/* Row 1: Nchi ya Makazi, Mkoa, Wilaya */}
                  <FormField
                    control={form.control}
                    name="countryOfResidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Nchi ya Makazi <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Find the selected country to get its ID
                            const selectedCountry = countries.find(c => c.CountryName === value);
                            if (selectedCountry) {
                              setSelectedCountryId(selectedCountry.EntryId);
                              // Clear dependent fields
                              form.setValue('region', '');
                              form.setValue('district', '');
                              form.setValue('ward', '');
                              setRegions([]);
                              setDistricts([]);
                              setWards([]);
                              // Fetch regions for this country
                              fetchRegionsForCountry(selectedCountry.EntryId);
                            }
                          }}
                          disabled={isLoadingCountries}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <SelectValue placeholder="Chagua nchi ya makazi" />
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
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-neutral-500">Mkoa <span className="text-red-500">*</span></FormLabel>
                        <Select 
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Find the selected region to get its ID
                            const selectedRegion = regions.find(r => r.RegionName === value);
                            if (selectedRegion) {
                              const regionId = selectedRegion.EntryID || selectedRegion.EntryId || selectedRegion.ID || selectedRegion.Id || selectedRegion.id || 0;
                              setSelectedRegionId(regionId);
                              // Clear dependent fields
                              form.setValue('district', '');
                              form.setValue('ward', '');
                              setDistricts([]);
                              setWards([]);
                              // Fetch districts for this region
                              fetchDistrictsForRegion(regionId);
                            }
                          }}
                          disabled={isLoadingRegions || !selectedCountryId || regions.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
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
                                  <SelectItem key={region.EntryID || region.EntryId || region.ID || region.Id || region.id} value={region.RegionName}>
                                    {region.RegionName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Chagua nchi kwanza</div>
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
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Find the selected district to get its ID
                            const selectedDistrict = districts.find(d => d.DistrictName === value);
                            if (selectedDistrict) {
                              const districtId = selectedDistrict.EntryID || selectedDistrict.EntryId || selectedDistrict.ID || selectedDistrict.Id || selectedDistrict.id || 0;
                              setSelectedDistrictId(districtId);
                              // Clear dependent field
                              form.setValue('ward', '');
                              setWards([]);
                              // Fetch wards for this district
                              fetchWardsForDistrict(districtId);
                            }
                          }}
                          disabled={isLoadingDistricts || !selectedRegionId || districts.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <SelectValue placeholder="Chagua wilaya" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingDistricts ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : districts.length > 0 ? (
                              districts
                                .filter((district) => district.DistrictName && district.DistrictName.trim() !== '')
                                .map((district) => (
                                  <SelectItem key={district.EntryID || district.EntryId || district.ID || district.Id || district.id} value={district.DistrictName}>
                                    {district.DistrictName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Chagua mkoa kwanza</div>
                            )}
                          </SelectContent>
                        </Select>
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
                          disabled={isLoadingWards || !selectedDistrictId || wards.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <SelectValue placeholder="Chagua kata" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {isLoadingWards ? (
                              <div className="py-2 px-3 text-sm text-gray-500">Inapakia...</div>
                            ) : wards.length > 0 ? (
                              wards
                                .filter((ward) => ward.WardName && ward.WardName.trim() !== '')
                                .map((ward) => (
                                  <SelectItem key={ward.EntryID || ward.EntryId || ward.ID || ward.Id || ward.id} value={ward.WardName}>
                                    {ward.WardName}
                                  </SelectItem>
                                ))
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Chagua wilaya kwanza</div>
                            )}
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
                          disabled={isLoadingNationalities}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
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
                                  const nationalityName = nationality.NationalityName || nationality.Nationality || nationality.Name || '';
                                  return nationalityName.trim() !== '';
                                })
                                .map((nationality) => {
                                  const nationalityName = nationality.NationalityName || nationality.Nationality || nationality.Name || '';
                                  const nationalityId = nationality.EntryID || nationality.EntryId || nationality.ID || nationality.Id || nationality.id || 0;
                                  return (
                                    <SelectItem key={nationalityId} value={nationalityName}>
                                      {nationalityName}
                                    </SelectItem>
                                  );
                                })
                            ) : (
                              <div className="py-2 px-3 text-sm text-gray-500">Hakuna data ilipatikana</div>
                            )}
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
                          disabled={isLoadingCountries}
                        >
                          <FormControl>
                            <SelectTrigger className="border border-gray-300 rounded px-3 py-2 w-full focus:border-blue-500 focus:outline-none">
                              <div className="flex items-center">
                                <SelectValue placeholder="Chagua nchi ya asili" />
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
