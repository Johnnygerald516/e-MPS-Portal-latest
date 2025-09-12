"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { ArrowRight, Calendar, Globe, Save, Users } from "lucide-react";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';

// Country options
const countries = [
  { value: "tanzania", label: "Tanzania" },
  { value: "kenya", label: "Kenya" },
  { value: "uganda", label: "Uganda" },
  { value: "rwanda", label: "Rwanda" },
  { value: "burundi", label: "Burundi" },
];

// Region options
const regions = [
  { value: "arusha", label: "Arusha" },
  { value: "dar_es_salaam", label: "Dar es Salaam" },
  { value: "dodoma", label: "Dodoma" },
  { value: "geita", label: "Geita" },
  { value: "iringa", label: "Iringa" },
  { value: "kagera", label: "Kagera" },
  { value: "katavi", label: "Katavi" },
  { value: "kigoma", label: "Kigoma" },
  { value: "kilimanjaro", label: "Kilimanjaro" },
  { value: "lindi", label: "Lindi" },
  { value: "manyara", label: "Manyara" },
  { value: "mara", label: "Mara" },
  { value: "mbeya", label: "Mbeya" },
  { value: "morogoro", label: "Morogoro" },
  { value: "mtwara", label: "Mtwara" },
  { value: "mwanza", label: "Mwanza" },
  { value: "njombe", label: "Njombe" },
  { value: "pwani", label: "Pwani" },
  { value: "rukwa", label: "Rukwa" },
  { value: "ruvuma", label: "Ruvuma" },
  { value: "shinyanga", label: "Shinyanga" },
  { value: "simiyu", label: "Simiyu" },
  { value: "singida", label: "Singida" },
  { value: "songwe", label: "Songwe" },
  { value: "tabora", label: "Tabora" },
  { value: "tanga", label: "Tanga" },
  { value: "zanzibar", label: "Zanzibar" },
];

// Form validation schema
const parentsInfoSchema = z.object({
  fatherName: z.string().min(1, "Father's name is required"),
  fatherDateOfBirth: z.string().min(1, "Father's date of birth is required"),
  fatherCountryOfBirth: z.string().min(1, "Father's country of birth is required"),
  fatherRegionOfBirth: z.string().min(1, "Father's region of birth is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  motherDateOfBirth: z.string().min(1, "Mother's date of birth is required"),
  motherCountryOfBirth: z.string().min(1, "Mother's country of birth is required"),
  motherRegionOfBirth: z.string().min(1, "Mother's region of birth is required"),
});

type ParentsInfoFormValues = z.infer<typeof parentsInfoSchema>;

export default function ParentsInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referenceId = searchParams.get('referenceId') || '';
  const { formData, updateFormData, isLoading, setIsLoading } = useApplication();
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<ParentsInfoFormValues>({
    resolver: zodResolver(parentsInfoSchema),
    defaultValues: {
      fatherName: formData.fatherName || '',
      fatherDateOfBirth: formData.fatherDateOfBirth ? new Date(formData.fatherDateOfBirth).toISOString().split('T')[0] : undefined,
      fatherCountryOfBirth: formData.fatherCountryOfBirth || '',
      fatherRegionOfBirth: formData.fatherRegionOfBirth || '',
      motherName: formData.motherName || '',
      motherDateOfBirth: formData.motherDateOfBirth ? new Date(formData.motherDateOfBirth).toISOString().split('T')[0] : undefined,
      motherCountryOfBirth: formData.motherCountryOfBirth || '',
      motherRegionOfBirth: formData.motherRegionOfBirth || '',
    },
  });
  
  // Handle save and exit
  const handleSaveAndExit = () => {
    const formValues = form.getValues();
    // Convert date strings to Date objects
    const data = {
      ...formValues,
      fatherDateOfBirth: formValues.fatherDateOfBirth ? new Date(formValues.fatherDateOfBirth) : undefined,
      motherDateOfBirth: formValues.motherDateOfBirth ? new Date(formValues.motherDateOfBirth) : undefined,
    };
    updateFormData(data);
    router.push('/application');
  };
  
  // Handle form submission
  const onSubmit = (formValues: ParentsInfoFormValues) => {
    setIsLoading(true);
    // Convert date strings to Date objects
    const data = {
      ...formValues,
      fatherDateOfBirth: formValues.fatherDateOfBirth ? new Date(formValues.fatherDateOfBirth) : undefined,
      motherDateOfBirth: formValues.motherDateOfBirth ? new Date(formValues.motherDateOfBirth) : undefined,
    };
    updateFormData(data);
    
    // Simulate API call
    setTimeout(() => {
      router.push(`/application/dependant-info?referenceId=${referenceId}`);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <ApplicationLayout 
      title="Taarifa za Wazazi" 
      subtitle="Taarifa za wazazi wako"
      referenceId={referenceId}
      currentStep="taarifa-za-wazazi"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Father's Information */}
          <div className="p-4 rounded-md border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-2"> 
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium text-slate-600">Taarifa za Baba</h3>
            </div>
            
            {/* Father's Name */}
            <div className="mb-4">
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jina Kamili la Baba <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ingiza jina kamili la baba" 
                        className="border border-gray-300 rounded px-3 py-2 w-[325px] focus:border-blue-500 focus:outline-none" 
                        {...field} 
                      />
                    </FormControl>
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
                  <FormItem>
                    <FormLabel>Tarehe ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                          id="fatherDateOfBirth"
                          type="date"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="Ingiza tarehe ya kuzaliwa ya baba"
                          className="pl-10 rounded"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fatherCountryOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nchi ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Nchi" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
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
                name="fatherRegionOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mkoa wa Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <SelectValue placeholder="Chagua Mkoa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
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
          
          {/* Mother's Information */}
          <div className="p-4 rounded-md  border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-2"> 
              <Users className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-slate-600">Taarifa za Mama</h3>
            </div>
            
            {/* Mother's Name */}
            <div className="mb-4">
              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-500">Jina Kamili la Mama <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ingiza jina kamili la mama" 
                        className="border border-gray-300 rounded px-3 py-2 w-[325px] focus:border-blue-500 focus:outline-none" 
                        {...field} 
                      />
                    </FormControl>
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
                  <FormItem>
                    <FormLabel>Tarehe ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                          id="motherDateOfBirth"
                          type="date"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="Ingiza tarehe ya kuzaliwa ya mama"
                          className="pl-10 rounded"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="motherCountryOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nchi ya Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua Nchi" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
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
                name="motherRegionOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mkoa wa Kuzaliwa <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <SelectValue placeholder="Chagua Mkoa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
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
            
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Inaendelea...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Hifadhi na Endelea
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </ApplicationLayout>
  );
}
