"use client";

import React from "react";
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
import { useCustomToast } from "@/hooks/use-custom-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample countries list
const countries = [
  "Tanzania",
  "Kenya",
  "Uganda",
  "Rwanda",
  "Burundi",
  "Democratic Republic of Congo",
  "South Sudan",
  "Ethiopia",
  "Somalia",
  "Mozambique",
  "Zambia",
  "Malawi",
];

// Form validation schema
const parentsInfoSchema = z.object({
  fatherName: z.string().min(1, "Father's name is required"),
  fatherDateOfBirth: z.date({
    required_error: "Father's date of birth is required",
  }),
  fatherCountryOfBirth: z.string().min(1, "Father's country of birth is required"),
  fatherRegionOfBirth: z.string().min(1, "Father's region of birth is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  motherDateOfBirth: z.date({
    required_error: "Mother's date of birth is required",
  }),
  motherCountryOfBirth: z.string().min(1, "Mother's country of birth is required"),
  motherRegionOfBirth: z.string().min(1, "Mother's region of birth is required"),
});

type ParentsInfoFormValues = z.infer<typeof parentsInfoSchema>;

export default function ParentsInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId') || '';
  const { formData, updateFormData, isLoading, setIsLoading } = useApplication();
  const { showError, showSuccess } = useCustomToast();
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<ParentsInfoFormValues>({
    resolver: zodResolver(parentsInfoSchema),
    defaultValues: {
      fatherName: formData.fatherName || "",
      fatherDateOfBirth: formData.fatherDateOfBirth ? new Date(formData.fatherDateOfBirth) : undefined,
      fatherCountryOfBirth: formData.fatherCountryOfBirth || "",
      fatherRegionOfBirth: formData.fatherRegionOfBirth || "",
      motherName: formData.motherName || "",
      motherDateOfBirth: formData.motherDateOfBirth ? new Date(formData.motherDateOfBirth) : undefined,
      motherCountryOfBirth: formData.motherCountryOfBirth || "",
      motherRegionOfBirth: formData.motherRegionOfBirth || "",
    },
  });
  
  // Handle save and exit
  const handleSaveAndExit = () => {
    const data = {
      ...form.getValues(),
      // Map field names to match API requirements
      fatherFullName: form.getValues().fatherName,
      motherFullName: form.getValues().motherName,
    };
    updateFormData(data);
    router.push('/application');
  };

  // Handle form submission
  const onSubmit = async (formValues: ParentsInfoFormValues) => {
    setIsLoading(true);
    try {
      // Convert date strings to Date objects
      const data = {
        ...formValues,
        fatherDateOfBirth: formValues.fatherDateOfBirth ? new Date(formValues.fatherDateOfBirth) : new Date(),
        motherDateOfBirth: formValues.motherDateOfBirth ? new Date(formValues.motherDateOfBirth) : new Date(),
        // Map field names to match API requirements
        fatherFullName: formValues.fatherName,
        motherFullName: formValues.motherName,
      };
      updateFormData(data);
      
      // Call the API to submit parents info
      const response = await parentsInfoEndpoints.submitParentsInfo(applicationId, data);
      
      if (response.ackCode === 1) {
        // Success - navigate to next page
        router.push(`/application/dependant-info?applicationId=${applicationId}`);
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
      currentStep="parents-info"
    >
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <Users className="h-5 w-5 text-violet-800" />
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
                          type="date" 
                          className="pl-10 rounded" 
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(date);
                          }}
                          placeholder="mm/dd/yyyy"
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
                        <SelectTrigger className="border border-gray-300 rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua nchi" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
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
                    <FormControl>
                      <Input 
                        placeholder="Ingiza mkoa wa kuzaliwa" 
                        className="border border-gray-300 rounded" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center gap-2 mb-4 mt-8 border-b pb-2">
              <Users className="h-5 w-5 text-violet-800" />
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
                          type="date" 
                          className="pl-10 rounded" 
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            field.onChange(date);
                          }}
                          placeholder="mm/dd/yyyy"
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
                        <SelectTrigger className="border border-gray-300 rounded">
                          <div className="flex items-center">
                            <Globe className="mr-2 h-4 w-4 text-slate-400" />
                            <SelectValue placeholder="Chagua nchi" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
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
                    <FormControl>
                      <Input 
                        placeholder="Ingiza mkoa wa kuzaliwa" 
                        className="border border-gray-300 rounded" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
