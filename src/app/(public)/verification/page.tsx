"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Shield, Calendar, MapPin, User, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import Link from "next/link";

// Verification form interface
interface VerificationFormData {
  subjectId: string;
  dateOfBirth: string;
  registrationRegion: string;
}

export default function VerificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<VerificationFormData>({
    subjectId: "",
    dateOfBirth: "",
    registrationRegion: "",
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };
  
  // Handle region selection
  const handleRegionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      registrationRegion: value,
    }));
    if (error) setError("");
  };
  
  // Placeholder for future database verification
  const verifyUserData = async (data: VerificationFormData): Promise<boolean> => {
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Always return true for now - no validation until API is available
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Store verification data for future use
      sessionStorage.setItem('verificationData', JSON.stringify(formData));
      
      // Skip validation and proceed directly to dashboard
      await verifyUserData(formData); // Just for loading simulation
      router.push("/dashboard");
    } catch (error) {
      console.error("Verification error:", error);
      setError("Kuna tatizo la kiufundi. Tafadhali jaribu tena baadaye.");
    } finally {
      setIsLoading(false);
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
    "Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi",
    "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya", "Morogoro",
    "Mtwara", "Mwanza", "Njombe", "Pemba Kaskazini", "Pemba Kusini", "Pwani",
    "Rukwa", "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe", "Tabora",
    "Tanga", "Unguja Kaskazini", "Unguja Kusini"
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="w-full max-w-6xl mx-auto px-4">
        <Card className="border-none shadow-xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Left sidebar */}
              <div className="hidden lg:block bg-blue-600 p-8 text-white">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center mb-4">
                      <Shield className="h-8 w-8 mr-3" />
                      <h2 className="text-2xl font-bold">Uthibitisho wa Taarifa</h2>
                    </div>
                    <p className="opacity-90 text-sm mb-8">
                      Ili kuendelea na huduma, tunahitaji kuthibitisha taarifa zako za usajili. 
                      Jaza taarifa zifuatazo kwa usahihi.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <User className="h-5 w-5 mr-3 mt-0.5 opacity-80" />
                        <div>
                          <h3 className="font-medium">Namba ya Kitambulisho</h3>
                          <p className="text-sm opacity-80">Ingiza namba yako ya kitambulisho kama ilivyosajiliwa</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 mr-3 mt-0.5 opacity-80" />
                        <div>
                          <h3 className="font-medium">Tarehe ya Kuzaliwa</h3>
                          <p className="text-sm opacity-80">Chagua tarehe yako ya kuzaliwa</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 mt-0.5 opacity-80" />
                        <div>
                          <h3 className="font-medium">Mkoa wa Usajili</h3>
                          <p className="text-sm opacity-80">Chagua mkoa uliopata huduma ya usajili</p>
                        </div>
                      </div>
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
                      Jaza taarifa zako za usajili ili kuthibitisha utambulisho wako
                    </p>
                  </div>
                  
                  {error && (
                    <motion.div variants={itemVariants} className="mb-6">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-red-800">
                            {error}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>Je, haujasajiliwa bado?</strong>
                        </p>
                        <Link 
                          href="/registration" 
                          className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                        >
                          Bonyeza hapa kujisajili
                        </Link>
                      </div>
                    </motion.div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subjectId" className="text-sm font-medium">
                          Namba ya Kitambulisho (Subject ID) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="subjectId"
                          name="subjectId"
                          type="text"
                          placeholder="Mfano: TZ123456789"
                          value={formData.subjectId}
                          onChange={handleInputChange}
                          required
                          className="bg-white border-slate-300"
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
                          className="bg-white border-slate-300"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="registrationRegion" className="text-sm font-medium">
                          Mkoa wa Usajili <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.registrationRegion}
                          onValueChange={handleRegionChange}
                        >
                          <SelectTrigger className="w-full bg-white border-slate-300 rounded-md">
                            <SelectValue placeholder="Chagua Mkoa wa Usajili" />
                          </SelectTrigger>
                          <SelectContent>
                            {tanzaniaRegions.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="pt-6 flex justify-end">
                      <LoadingButton
                        type="submit"
                        isLoading={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-md flex items-center transition-colors shadow-md"
                      >
                        {isLoading ? "Inathibitisha..." : "Thibitisha Taarifa"} 
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </LoadingButton>
                    </motion.div>
                  </form>
                  
                  <motion.div variants={itemVariants} className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Kumbuka:</strong> Taarifa hizi ni muhimu kwa usalama wa akaunti yako. 
                      Hakikisha umejaza taarifa sahihi kama zilivyosajiliwa awali.
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
