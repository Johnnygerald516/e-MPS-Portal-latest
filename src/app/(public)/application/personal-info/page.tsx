"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Force dynamic rendering to prevent prerendering errors with client-side data
export const dynamic = 'force-dynamic';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, User, ArrowRight, Loader2, Save } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { personalInfoEndpoints } from "@/lib/api/endpoints/personal-info";
import { useToast } from "@/components/ui/use-toast";

// Form validation schema
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.date().refine(val => !!val, {
    message: "Date of birth is required",
  }),
  gender: z.enum(["M", "F"]).refine(val => !!val, {
    message: "Gender is required",
  }),
  nationality: z.string().min(2, "Nationality is required"),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export default function PersonalInfoPage() {
  const router = useRouter();
  const { formData, updateFormData, isLoading, setIsLoading } = useApplication();
  const { toast } = useToast();
  const [isExiting, setIsExiting] = useState(false);
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      dateOfBirth: typeof formData.dateOfBirth === 'string' ? new Date(formData.dateOfBirth) : formData.dateOfBirth,
      gender: formData.gender as "M" | "F" | undefined,
      nationality: formData.nationality || "Tanzania",
    },
  });
  
  // Prepare data for API submission
  const preparePersonalInfoPayload = (data: PersonalInfoFormValues) => {
    // Format date to YYYY-MM-DD string format
    const formatDate = (date: Date | undefined): string => {
      if (!date) return '';
      return date.toISOString().split('T')[0];
    };

    return {
      applicationId: formData.applicationId || '',
      firstName: data.firstName,
      middleName: data.middleName || '',
      lastName: data.lastName,
      dateOfBirth: formatDate(data.dateOfBirth),
      gender: data.gender || '',
      maritalStatusId: formData.maritalStatusId || 0,
      nationality: data.nationality || 'Tanzania',
      occupationId: formData.occupationId || 0,
      email: formData.email || '',
      phoneNumber: formData.phoneNumber || formData.mobileNumber || ''
    };
  };

  // Handle save and exit
  const handleSaveAndExit = async () => {
    try {
      setIsExiting(true);
      const data = form.getValues();
      updateFormData(data);
      
      const apiPayload = preparePersonalInfoPayload(data);
      const response = await personalInfoEndpoints.savePersonalInfo(apiPayload);
      
      if (response.ackCode === 1) {
        toast({
          title: "Success",
          description: "Personal information saved successfully",
          variant: "default"
        });
        router.push('/');
      } else {
        toast({
          title: "Error",
          description: response.ackMessage || "Failed to save personal information",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExiting(false);
    }
  };

  // Handle form submission
  const onSubmit: SubmitHandler<PersonalInfoFormValues> = async (data) => {
    try {
      setIsLoading(true);
      updateFormData(data);
      
      const apiPayload = preparePersonalInfoPayload(data);
      const response = await personalInfoEndpoints.savePersonalInfo(apiPayload);
      
      if (response.ackCode === 1) {
        toast({
          title: "Success",
          description: "Personal information saved successfully",
          variant: "default"
        });
        router.push("/application/residence-info");
      } else {
        toast({
          title: "Error",
          description: response.ackMessage || "Failed to save personal information",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ApplicationLayout 
      title="Personal Information" 
      subtitle="Enter your personal details"
      currentStep="taarifa-binafsi"
    >
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control as any}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your middle name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control as any}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Date of Birth <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && !isNaN(new Date(field.value).getTime()) ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    Gender <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="M" id="male" />
                        <label htmlFor="male" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Male
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="F" id="female" />
                        <label htmlFor="female" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Female
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control as any}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nationality <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter your nationality" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <LoadingButton 
              type="button" 
              className="bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center"
              isLoading={isExiting}
              loadingText="Inahifadhi..."
              spinnerVariant="primary"
              onClick={handleSaveAndExit}
            >
              Hifadhi na Toka
              <Save className="ml-2 h-4 w-4" />
            </LoadingButton>
            
            <LoadingButton 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center flex-1"
              isLoading={isLoading}
              loadingText="Inaendelea..."
              spinnerVariant="primary"
            >
              Hifadhi na Endelea
              <ArrowRight className="ml-2 h-4 w-4" />
            </LoadingButton>
          </div>
        </form>
      </Form>
    </ApplicationLayout>
  );
}
