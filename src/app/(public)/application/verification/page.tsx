"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, User, Calendar, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import Link from "next/link";
import { useApplication } from "@/contexts/application-context";

// Verification form interface
interface VerificationFormData {
  subjectId: string;
  dateOfBirth: string;
  region: string;
  passNumber: string;
  phoneNumber: string;
}

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateFormData } = useApplication();
  const [isLoading, setIsLoading] = useState(false);
  const [applicationType, setApplicationType] = useState<string>("");
  const [showApplicationId, setShowApplicationId] = useState(false);
  const [applicationData, setApplicationData] = useState<{applicationId: string, mobileNumber: string}>({
    applicationId: "",
    mobileNumber: ""
  });
  const [formData, setFormData] = useState<VerificationFormData>({
    subjectId: "",
    dateOfBirth: "",
    region: "",
    passNumber: "",
    phoneNumber: "",
  });
  
  useEffect(() => {
    const type = searchParams.get("type");
    if (type) {
      setApplicationType(type);
    }
  }, [searchParams]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare the verification payload based on application type
      const verificationPayload = applicationType === "renew" 
        ? {
            passNumber: formData.passNumber,
            subjectId: formData.subjectId,
            phoneNumber: formData.phoneNumber
          }
        : {
            subjectId: formData.subjectId,
            dateOfBirth: formData.dateOfBirth,
            region: formData.region
          };
      
      // Make the actual API call to verify the user
      const response = await fetch('/api/applications/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationPayload)
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Verification API response:', responseData);
      
      // Check if the verification was successful
      if (responseData.ackCode === 1) {
        // Extract applicationID and phoneNo from the response
        const applicationId = responseData.jsonResult?.applicationID;
        const phoneNo = responseData.jsonResult?.phoneNo;
        
        if (!applicationId) {
          throw new Error('Application ID not found in response');
        }
        
        // Set the application data from the API response
        setApplicationData({
          applicationId: applicationId,
          mobileNumber: phoneNo || ''
        });
        
        // Save applicationId to the application context
        updateFormData({
          applicationId: applicationId,
          // Also save other relevant information
          applicationType: applicationType === "renew" ? "renew" : "new",
          mobileNumber: phoneNo || ''
        });
        
        setShowApplicationId(true);
      } else {
        // Handle verification failure
        alert(responseData.ackMessage || "Taarifa ulizoweka hazipatikani kwenye mfumo. Tafadhali hakikisha umeweka taarifa sahihi.");
      }
    } catch (error) {
      console.error("Error during verification:", error);
      alert("Kuna hitilafu imetokea wakati wa kuthibitisha taarifa zako. Tafadhali jaribu tena.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate database verification for existing users
  const verifyExistingUser = async (passNumber: string, subjectId: string, phoneNumber: string): Promise<boolean> => {
    // Simulate API call to verify user exists in database
    // In real implementation, this would check against your database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, return true if all fields are filled
    // In production, this would verify against actual database records
    return passNumber.length > 0 && subjectId.length > 0 && phoneNumber.length > 0;
  };
  
  // Handle continue to application form
  const handleContinueToDashboard = () => {
    // Navigate to the appropriate page based on application type without using URL parameters
    // ApplicationId is already stored in context
    if (applicationType === "renew") {
      router.push(`/application/basic-info`);
    } else {
      router.push(`/application/personal-info`);
    }
  };
  
  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };
  
  // Tanzania regions
  const tanzaniaRegions = [
    "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", 
    "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara", 
    "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pwani", 
    "Rukwa", "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe", 
    "Tabora", "Tanga"
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="w-full max-w-4xl mx-auto px-4">
        <Card className="border-none shadow-xl overflow-hidden bg-white">
          <CardContent className="p-0">
            {!showApplicationId ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                {/* Left sidebar */}
                <div className="hidden lg:block bg-indigo-600 p-8 text-white">
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Uthibitisho wa Taarifa</h2>
                      <p className="opacity-90 text-sm mb-6">
                        Ingiza taarifa zako za kibinafsi ili kuthibitisha utambulisho wako.
                      </p>
                      <div className="space-y-4">
                        {applicationType === "renew" ? (
                          <>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <span className="text-sm">Pass Number</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <span className="text-sm">Subject ID</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <span className="text-sm">Namba ya Simu</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <span className="text-sm">Namba ya Kumbukumbu</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <span className="text-sm">Tarehe ya Kuzaliwa</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <span className="text-sm">Mkoa wa Maombi</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/20 mt-8">
                      <Link href="/application" className="flex items-center text-white/80 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Rudi Nyuma
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Right content area */}
                <div className="col-span-2 p-8">
                  <div className="lg:hidden mb-6">
                    <Link href="/application" className="flex items-center text-slate-600 hover:text-slate-900">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Rudi Nyuma
                    </Link>
                  </div>
                  
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-slate-900">Uthibitisho wa Taarifa</h1>
                      <p className="mt-2 text-slate-600 text-sm">
                        {applicationType === "new" 
                          ? "Ingiza taarifa zako za kibinafsi ili kuanza ombi jipya"
                          : "Ingiza taarifa zako za kibinafsi ili kuendelea na ombi la upyaji"
                        }
                      </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <motion.div variants={itemVariants} className="space-y-6">
                        {applicationType === "renew" ? (
                          // Renewal Application Form Fields
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="passNumber" className="text-sm font-medium">
                                Pass Number <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="passNumber"
                                name="passNumber"
                                value={formData.passNumber}
                                onChange={handleInputChange}
                                required
                                className="bg-white border-slate-300 rounded-md"
                                placeholder="Ingiza namba ya pass yako"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="subjectId" className="text-sm font-medium">
                                Subject ID <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="subjectId"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleInputChange}
                                required
                                className="bg-white border-slate-300 rounded-md"
                                placeholder="Ingiza Subject ID yako"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                                Namba ya Simu <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                required
                                className="bg-white border-slate-300 rounded-md"
                                placeholder="Ingiza namba ya simu yako (mfano: +255712345678)"
                              />
                            </div>
                          </>
                        ) : (
                          // New Application Form Fields
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="subjectId" className="text-sm font-medium">
                                Namba ya Kumbukumbu (Subject ID) <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="subjectId"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleInputChange}
                                required
                                className="bg-white border-slate-300 rounded-md"
                                placeholder="Ingiza namba ya kumbukumbu yako"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                                Tarehe ya Kuzaliwa <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                required
                                className="bg-white border-slate-300 rounded-md"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="region" className="text-sm font-medium">
                                Mkoa Ulipofanyia Maombi <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.region}
                                onValueChange={(value) => handleSelectChange("region", value)}
                              >
                                <SelectTrigger className="w-full bg-white border-slate-300 rounded-md">
                                  <SelectValue placeholder="Chagua mkoa" />
                                </SelectTrigger>
                                <SelectContent>
                                  {tanzaniaRegions.map((region) => (
                                    <SelectItem key={region.toLowerCase()} value={region.toLowerCase()}>
                                      {region}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="pt-6 flex justify-end">
                        <LoadingButton
                          type="submit"
                          isLoading={isLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-md flex items-center transition-colors shadow-md"
                        >
                          Thibitisha na Endelea <ChevronRight className="ml-2 h-4 w-4" />
                        </LoadingButton>
                      </motion.div>
                    </form>
                  </motion.div>
                </div>
              </div>
            ) : (
              /* Application ID Display */
              <div className="p-8 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-md mx-auto"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Uthibitisho Umekamilika!</h1>
                    <p className="text-slate-600 text-sm">
                      Taarifa zako zimekaguliwa na kuthibitishwa. Hapa chini ni namba ya ombi lako na namba ya simu.
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-6 mb-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Namba ya Ombi (Application ID)</Label>
                        <div className="mt-1 p-3 bg-white border rounded-md">
                          <span className="text-lg font-mono font-bold text-indigo-600">{applicationData.applicationId}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-slate-700">Namba ya Simu</Label>
                        <div className="mt-1 p-3 bg-white border rounded-md">
                          <span className="text-lg font-mono font-bold text-slate-900">{applicationData.mobileNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Muhimu:</strong> Hifadhi namba hizi kwa ufuatiliaji wa ombi lako. Utazihitaji kuangalia maendeleo ya ombi lako.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleContinueToDashboard}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Endelea na Kujaza Ombi <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
