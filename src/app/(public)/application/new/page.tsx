"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Briefcase, FileText, Upload, Users, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// New application form interface
interface NewApplicationFormData {
  // Personal Information
  firstName: string;
  middleName?: string;
  surname: string;
  formerOrMaidenName?: string;
  dateOfBirth: string;
  countryOfBirth: string;
  regionOfBirth: string;
  gender: string;
  maritalStatus?: string;
  occupation: string;
  occupationType?: string;
  email: string;
  phone: string;
  
  // Residence fields
  nationality: string;
  countryOfResidence: string;
  region: string;
  district: string;
  street: string;
  plotNo?: string;
  houseNo?: string;
  mobileNumber: string;
  
  // Parent Information fields
  fatherFullName: string;
  fatherDateOfBirth: string;
  fatherPlaceOfBirth: string;
  fatherNationality: string;
  fatherCountryOfResidence: string;
  motherFullName: string;
  motherDateOfBirth: string;
  motherPlaceOfBirth: string;
  motherNationality: string;
  motherCountryOfResidence: string;
  
  // Dependants fields
  dependants: Array<{
    fullName: string;
    relationship: string;
    hasPassport: boolean;
    passportNumber?: string;
    nationality?: string;
  }>;
  
  // Documents fields
  baruaKutokaSerikali?: File | null;
  ushahidiWaKuingiaTanzania?: File | null;
  ushahidiWaWazazi?: File | null;
  baruaKutokaSerikaliPreview?: string;
  ushahidiWaKuingiaTanzaniaPreview?: string;
  ushahidiWaWazaziPreview?: string;
  
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewApplicationFormData>({
    // Personal Information
    firstName: "",
    middleName: "",
    surname: "",
    formerOrMaidenName: "",
    dateOfBirth: "",
    countryOfBirth: "",
    regionOfBirth: "",
    gender: "",
    maritalStatus: "",
    occupation: "",
    occupationType: "",
    email: "",
    phone: "",
    
    // Residence Information
    nationality: "",
    countryOfResidence: "",
    region: "",
    district: "",
    street: "",
    plotNo: "",
    houseNo: "",
    mobileNumber: "",
    
    // Parent Information
    fatherFullName: "",
    fatherDateOfBirth: "",
    fatherPlaceOfBirth: "",
    fatherNationality: "",
    fatherCountryOfResidence: "",
    motherFullName: "",
    motherDateOfBirth: "",
    motherPlaceOfBirth: "",
    motherNationality: "",
    motherCountryOfResidence: "",
    
    // Dependants Information
    dependants: [],
    
    // Documents
    baruaKutokaSerikali: null,
    ushahidiWaKuingiaTanzania: null,
    ushahidiWaWazazi: null,
    baruaKutokaSerikaliPreview: "",
    ushahidiWaKuingiaTanzaniaPreview: "",
    ushahidiWaWazaziPreview: "",
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  
  // Add dependant
  const addDependant = () => {
    setFormData(prev => ({
      ...prev,
      dependants: [...prev.dependants, { 
        fullName: "", 
        relationship: "", 
        hasPassport: false, 
        passportNumber: "", 
        nationality: "" 
      }]
    }));
  };

  // Remove dependant
  const removeDependant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependants: prev.dependants.filter((_, i) => i !== index)
    }));
  };

  // Update dependant
  const updateDependant = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      dependants: prev.dependants.map((dep, i) => 
        i === index ? { ...dep, [field]: value } : dep
      )
    }));
  };

  // Handle file upload
  const handleFileUpload = (fieldName: string, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          [fieldName]: file,
          [`${fieldName}Preview`]: result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldName]: null,
        [`${fieldName}Preview`]: ""
      }));
    }
  };

  // Remove uploaded file
  const removeFile = (fieldName: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: null,
      [`${fieldName}Preview`]: ""
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
     setTimeout(() => {
        setActiveTab("success");
      }, 2000);
    } catch (error) {
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
  
  // Tab navigation
  const tabs = [
    { id: "personal", label: "Personal Info", icon: <User className="h-4 w-4" /> },
    { id: "residence", label: "Residence", icon: <MapPin className="h-4 w-4" /> },
    { id: "parents", label: "Parent Information", icon: <Users className="h-4 w-4" /> },
    { id: "dependants", label: "Dependants", icon: <Users className="h-4 w-4" /> },
    { id: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
    { id: "review", label: "Review", icon: <FileText className="h-4 w-4" /> },
    { id: "declaration", label: "Declaration", icon: <FileText className="h-4 w-4" /> },
    { id: "success", label: "Success", icon: <FileText className="h-4 w-4" /> },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100">
      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">New Migrant Pass Application</h1>
              <p className="mt-1 text-slate-600 text-sm">
                Please fill out all required information to submit your application
              </p>
            </div>
            
            <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">Progress:</span>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full" 
                    style={{ width: `${(tabs.findIndex(t => t.id === activeTab) + 1) / tabs.length * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500">
                  Step {tabs.findIndex(t => t.id === activeTab) + 1} of {tabs.length}
                </span>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-lg bg-white overflow-hidden rounded-xl">
              <CardContent className="p-0">
                <div className="flex w-full">
                  <div className="w-72 border-r border-slate-200 bg-slate-50">
                    <div className="flex flex-col bg-slate-50 w-full rounded-none h-auto py-4">
                      {tabs.map((tab, index) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-3 justify-start px-6 py-4 text-left ${activeTab === tab.id ? 'bg-white border-l-4 border-indigo-600 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} rounded-none transition-all duration-200`}
                        >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                            {tab.icon}
                          </div>
                          <span>{tab.label}</span>
                          {activeTab === tab.id && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1">
                    <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Personal Information Tab */}
                    {activeTab === "personal" && (
                      <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium">First Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="bg-white border-slate-200 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            placeholder="Enter your first name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="middleName" className="text-sm font-medium">Middle Name</Label>
                          <Input
                            id="middleName"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleInputChange}
                            className="bg-white border-slate-300"
                            placeholder="Optional"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="surname" className="text-sm font-medium">Surname <span className="text-red-500">*</span></Label>
                          <Input
                            id="surname"
                            name="surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                            required
                            className="bg-white border-slate-300"
                            placeholder="Enter your surname"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="formerOrMaidenName" className="text-sm font-medium">Former or Maiden Name</Label>
                          <Input
                            id="formerOrMaidenName"
                            name="formerOrMaidenName"
                            value={formData.formerOrMaidenName}
                            onChange={handleInputChange}
                            className="bg-white border-slate-300"
                            placeholder="Enter former or maiden name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></Label>
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
                          <Label htmlFor="countryOfBirth" className="text-sm font-medium">Country of Birth <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.countryOfBirth}
                            onValueChange={(value) => handleSelectChange("countryOfBirth", value)}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue placeholder="Select country of birth" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tanzania">Tanzania</SelectItem>
                              <SelectItem value="kenya">Kenya</SelectItem>
                              <SelectItem value="uganda">Uganda</SelectItem>
                              <SelectItem value="rwanda">Rwanda</SelectItem>
                              <SelectItem value="burundi">Burundi</SelectItem>
                              <SelectItem value="drc">DR Congo</SelectItem>
                              <SelectItem value="southsudan">South Sudan</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="regionOfBirth" className="text-sm font-medium">Region of Birth <span className="text-red-500">*</span></Label>
                          <Input
                            id="regionOfBirth"
                            name="regionOfBirth"
                            value={formData.regionOfBirth}
                            onChange={handleInputChange}
                            required
                            className="bg-white border-slate-300"
                            placeholder="Enter region of birth"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-sm font-medium">Gender <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => handleSelectChange("gender", value)}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="maritalStatus" className="text-sm font-medium">Marital Status <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.maritalStatus}
                            onValueChange={(value) => handleSelectChange("maritalStatus", value)}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="occupation" className="text-sm font-medium">Occupation <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.occupation}
                            onValueChange={(value) => {
                              handleSelectChange("occupation", value);
                              setFormData(prev => ({ ...prev, occupationType: "" })); // Reset occupation type when occupation changes
                            }}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue placeholder="Select occupation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nimeajiliwa">Nimeajiliwa</SelectItem>
                              <SelectItem value="nimejiajiri">Nimejiajiri</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {formData.occupation && (
                          <div className="space-y-2">
                            <Label htmlFor="occupationType" className="text-sm font-medium">Occupation Type <span className="text-red-500">*</span></Label>
                            <Select
                              value={formData.occupationType}
                              onValueChange={(value) => handleSelectChange("occupationType", value)}
                            >
                              <SelectTrigger className="bg-white border-slate-300">
                                <SelectValue placeholder="Select occupation type" />
                              </SelectTrigger>
                              <SelectContent>
                                {formData.occupation === "nimeajiliwa" ? (
                                  <>
                                    <SelectItem value="serikali">Serikali</SelectItem>
                                    <SelectItem value="taasisi">Taasisi</SelectItem>
                                    <SelectItem value="kampuni">Kampuni</SelectItem>
                                  </>
                                ) : (
                                  <>
                                    <SelectItem value="mvuvi">Mvuvi</SelectItem>
                                    <SelectItem value="mkulima">Mkulima</SelectItem>
                                    <SelectItem value="mfugaji">Mfugaji</SelectItem>
                                    <SelectItem value="mengineyo">Mengineyo</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email Address <span className="text-red-500">*</span></Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="bg-white border-slate-300"
                            placeholder="example@email.com"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></Label>
                          <div className="flex items-center">
                            <div className="border border-slate-300 rounded-l-md px-3 py-2 bg-white text-slate-600 flex items-center">
                              <div className="relative w-4 h-3 mr-1">
                                <Image 
                                  src="/images/tanzania-flag.png" 
                                  alt="Tanzania" 
                                  fill 
                                  sizes="16px"
                                  style={{ objectFit: 'cover' }} 
                                />
                              </div>
                              <span>+255</span>
                            </div>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              className="rounded-l-none border-l-0 bg-white border-slate-300"
                              placeholder="621 234 567"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t mt-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("residence")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md flex items-center transition-colors shadow-sm"
                        >
                          Next: Residence
                        </Button>
                      </div>
                    </div>
                    )}
                    
                    {/* Residence Tab */}
                    {activeTab === "residence" && (
                      <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">Residence Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="nationality" className="text-sm font-medium">Nationality <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.nationality}
                            onValueChange={(value) => handleSelectChange("nationality", value)}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue placeholder="Select nationality" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kenya">Kenya</SelectItem>
                              <SelectItem value="uganda">Uganda</SelectItem>
                              <SelectItem value="rwanda">Rwanda</SelectItem>
                              <SelectItem value="burundi">Burundi</SelectItem>
                              <SelectItem value="drc">DR Congo</SelectItem>
                              <SelectItem value="southsudan">South Sudan</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="countryOfResidence" className="text-sm font-medium">Country of Residence <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.countryOfResidence}
                            onValueChange={(value) => handleSelectChange("countryOfResidence", value)}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tanzania">Tanzania</SelectItem>
                              <SelectItem value="kenya">Kenya</SelectItem>
                              <SelectItem value="uganda">Uganda</SelectItem>
                              <SelectItem value="rwanda">Rwanda</SelectItem>
                              <SelectItem value="burundi">Burundi</SelectItem>
                              <SelectItem value="drc">DR Congo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2 md:col-span-3">
                          <h4 className="text-md font-medium text-slate-700 border-b pb-2 mb-4">Address at which the applicant resides in Tanzania</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="region" className="text-sm font-medium">Region <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.region}
                            onValueChange={(value) => handleSelectChange("region", value)}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="arusha">Arusha</SelectItem>
                              <SelectItem value="dar-es-salaam">Dar es Salaam</SelectItem>
                              <SelectItem value="dodoma">Dodoma</SelectItem>
                              <SelectItem value="geita">Geita</SelectItem>
                              <SelectItem value="iringa">Iringa</SelectItem>
                              <SelectItem value="kagera">Kagera</SelectItem>
                              <SelectItem value="katavi">Katavi</SelectItem>
                              <SelectItem value="kigoma">Kigoma</SelectItem>
                              <SelectItem value="kilimanjaro">Kilimanjaro</SelectItem>
                              <SelectItem value="lindi">Lindi</SelectItem>
                              <SelectItem value="manyara">Manyara</SelectItem>
                              <SelectItem value="mara">Mara</SelectItem>
                              <SelectItem value="mbeya">Mbeya</SelectItem>
                              <SelectItem value="morogoro">Morogoro</SelectItem>
                              <SelectItem value="mtwara">Mtwara</SelectItem>
                              <SelectItem value="mwanza">Mwanza</SelectItem>
                              <SelectItem value="njombe">Njombe</SelectItem>
                              <SelectItem value="pwani">Pwani</SelectItem>
                              <SelectItem value="rukwa">Rukwa</SelectItem>
                              <SelectItem value="ruvuma">Ruvuma</SelectItem>
                              <SelectItem value="shinyanga">Shinyanga</SelectItem>
                              <SelectItem value="simiyu">Simiyu</SelectItem>
                              <SelectItem value="singida">Singida</SelectItem>
                              <SelectItem value="songwe">Songwe</SelectItem>
                              <SelectItem value="tabora">Tabora</SelectItem>
                              <SelectItem value="tanga">Tanga</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="district" className="text-sm font-medium">District <span className="text-red-500">*</span></Label>
                          <Input
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            required
                            className="bg-white border-slate-300"
                            placeholder="Enter district"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="street" className="text-sm font-medium">Street <span className="text-red-500">*</span></Label>
                          <Input
                            id="street"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            required
                            className="bg-white border-slate-300"
                            placeholder="Enter street name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="plotNo" className="text-sm font-medium">Plot No</Label>
                          <Input
                            id="plotNo"
                            name="plotNo"
                            value={formData.plotNo}
                            onChange={handleInputChange}
                            className="bg-white border-slate-300"
                            placeholder="Enter plot number"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="houseNo" className="text-sm font-medium">House No</Label>
                          <Input
                            id="houseNo"
                            name="houseNo"
                            value={formData.houseNo}
                            onChange={handleInputChange}
                            className="bg-white border-slate-300"
                            placeholder="Enter house number"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="mobileNumber" className="text-sm font-medium">Mobile Number <span className="text-red-500">*</span></Label>
                          <div className="flex items-center">
                            <div className="border border-slate-300 rounded-l-md px-3 py-2 bg-white text-slate-600 flex items-center">
                              <div className="relative w-4 h-3 mr-1">
                                <Image 
                                  src="/images/tanzania-flag.png" 
                                  alt="Tanzania" 
                                  fill 
                                  sizes="16px"
                                  style={{ objectFit: 'cover' }} 
                                />
                              </div>
                              <span>+255</span>
                            </div>
                            <Input
                              id="mobileNumber"
                              name="mobileNumber"
                              type="tel"
                              value={formData.mobileNumber}
                              onChange={handleInputChange}
                              required
                              className="rounded-l-none border-l-0 bg-white border-slate-300"
                              placeholder="621 234 567"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("personal")}
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          Previous: Personal Info
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("parents")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md flex items-center transition-colors shadow-sm"
                        >
                          Next: Parent Information
                        </Button>
                      </div>
                    </div>
                    )}
                    
                    {/* Parent Information Tab */}
                    {activeTab === "parents" && (
                      <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">Parent Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Father Information */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-slate-700 border-b pb-2">Father Information</h4>
                          
                          <div className="space-y-2">
                            <Label htmlFor="fatherFullName" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
                            <Input
                              id="fatherFullName"
                              name="fatherFullName"
                              value={formData.fatherFullName}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-slate-300"
                              placeholder="Enter father's full name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="fatherDateOfBirth" className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></Label>
                            <Input
                              id="fatherDateOfBirth"
                              name="fatherDateOfBirth"
                              type="date"
                              value={formData.fatherDateOfBirth}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-slate-300"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="fatherPlaceOfBirth" className="text-sm font-medium">Place of Birth <span className="text-red-500">*</span></Label>
                            <Input
                              id="fatherPlaceOfBirth"
                              name="fatherPlaceOfBirth"
                              value={formData.fatherPlaceOfBirth}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-slate-300"
                              placeholder="Enter place of birth"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="fatherNationality" className="text-sm font-medium">Nationality <span className="text-red-500">*</span></Label>
                            <Select
                              value={formData.fatherNationality}
                              onValueChange={(value) => handleSelectChange("fatherNationality", value)}
                            >
                              <SelectTrigger className="bg-white border-slate-300">
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kenya">Kenya</SelectItem>
                                <SelectItem value="uganda">Uganda</SelectItem>
                                <SelectItem value="rwanda">Rwanda</SelectItem>
                                <SelectItem value="burundi">Burundi</SelectItem>
                                <SelectItem value="drc">DR Congo</SelectItem>
                                <SelectItem value="southsudan">South Sudan</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="fatherCountryOfResidence" className="text-sm font-medium">Country of Residence <span className="text-red-500">*</span></Label>
                            <Select
                              value={formData.fatherCountryOfResidence}
                              onValueChange={(value) => handleSelectChange("fatherCountryOfResidence", value)}
                            >
                              <SelectTrigger className="bg-white border-slate-300">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tanzania">Tanzania</SelectItem>
                                <SelectItem value="kenya">Kenya</SelectItem>
                                <SelectItem value="uganda">Uganda</SelectItem>
                                <SelectItem value="rwanda">Rwanda</SelectItem>
                                <SelectItem value="burundi">Burundi</SelectItem>
                                <SelectItem value="drc">DR Congo</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Mother Information */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-slate-700 border-b pb-2">Mother Information</h4>
                          
                          <div className="space-y-2">
                            <Label htmlFor="motherFullName" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
                            <Input
                              id="motherFullName"
                              name="motherFullName"
                              value={formData.motherFullName}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-slate-300"
                              placeholder="Enter mother's full name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="motherDateOfBirth" className="text-sm font-medium">Date of Birth <span className="text-red-500">*</span></Label>
                            <Input
                              id="motherDateOfBirth"
                              name="motherDateOfBirth"
                              type="date"
                              value={formData.motherDateOfBirth}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-slate-300"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="motherPlaceOfBirth" className="text-sm font-medium">Place of Birth <span className="text-red-500">*</span></Label>
                            <Input
                              id="motherPlaceOfBirth"
                              name="motherPlaceOfBirth"
                              value={formData.motherPlaceOfBirth}
                              onChange={handleInputChange}
                              required
                              className="bg-white border-slate-300"
                              placeholder="Enter place of birth"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="motherNationality" className="text-sm font-medium">Nationality <span className="text-red-500">*</span></Label>
                            <Select
                              value={formData.motherNationality}
                              onValueChange={(value) => handleSelectChange("motherNationality", value)}
                            >
                              <SelectTrigger className="bg-white border-slate-300">
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kenya">Kenya</SelectItem>
                                <SelectItem value="uganda">Uganda</SelectItem>
                                <SelectItem value="rwanda">Rwanda</SelectItem>
                                <SelectItem value="burundi">Burundi</SelectItem>
                                <SelectItem value="drc">DR Congo</SelectItem>
                                <SelectItem value="southsudan">South Sudan</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="motherCountryOfResidence" className="text-sm font-medium">Country of Residence <span className="text-red-500">*</span></Label>
                            <Select
                              value={formData.motherCountryOfResidence}
                              onValueChange={(value) => handleSelectChange("motherCountryOfResidence", value)}
                            >
                              <SelectTrigger className="bg-white border-slate-300">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tanzania">Tanzania</SelectItem>
                                <SelectItem value="kenya">Kenya</SelectItem>
                                <SelectItem value="uganda">Uganda</SelectItem>
                                <SelectItem value="rwanda">Rwanda</SelectItem>
                                <SelectItem value="burundi">Burundi</SelectItem>
                                <SelectItem value="drc">DR Congo</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("residence")}
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          Previous: Residence
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("dependants")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md flex items-center transition-colors shadow-sm"
                        >
                          Next: Dependants
                        </Button>
                      </div>
                    </div>
                    )}
                    
                    {/* Dependants Tab */}
                    {activeTab === "dependants" && (
                      <div className="space-y-4">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">Dependants Information</h3>
                      
                      {formData.dependants.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 mb-4">No dependants added yet</p>
                          <Button
                            type="button"
                            onClick={addDependant}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Dependant
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {formData.dependants.map((dependant, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-md font-medium text-slate-700">Dependant {index + 1}</h4>
                                <Button
                                  type="button"
                                  onClick={() => removeDependant(index)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
                                  <Input
                                    value={dependant.fullName}
                                    onChange={(e) => updateDependant(index, 'fullName', e.target.value)}
                                    className="bg-white border-slate-300"
                                    placeholder="Enter dependant's full name"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Relationship <span className="text-red-500">*</span></Label>
                                  <Select
                                    value={dependant.relationship}
                                    onValueChange={(value) => updateDependant(index, 'relationship', value)}
                                  >
                                    <SelectTrigger className="bg-white border-slate-300">
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="spouse">Spouse</SelectItem>
                                      <SelectItem value="child">Child</SelectItem>
                                      <SelectItem value="parent">Parent</SelectItem>
                                      <SelectItem value="sibling">Sibling</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2 md:col-span-2">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`hasPassport-${index}`}
                                      checked={dependant.hasPassport}
                                      onChange={(e) => updateDependant(index, 'hasPassport', e.target.checked)}
                                      className="rounded border-slate-300"
                                    />
                                    <Label htmlFor={`hasPassport-${index}`} className="text-sm font-medium">
                                      This dependant has a passport
                                    </Label>
                                  </div>
                                </div>
                                
                                {dependant.hasPassport && (
                                  <>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Passport Number <span className="text-red-500">*</span></Label>
                                      <Input
                                        value={dependant.passportNumber || ''}
                                        onChange={(e) => updateDependant(index, 'passportNumber', e.target.value)}
                                        className="bg-white border-slate-300"
                                        placeholder="Enter passport number"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Nationality <span className="text-red-500">*</span></Label>
                                      <Select
                                        value={dependant.nationality || ''}
                                        onValueChange={(value) => updateDependant(index, 'nationality', value)}
                                      >
                                        <SelectTrigger className="bg-white border-slate-300">
                                          <SelectValue placeholder="Select nationality" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="kenya">Kenya</SelectItem>
                                          <SelectItem value="uganda">Uganda</SelectItem>
                                          <SelectItem value="rwanda">Rwanda</SelectItem>
                                          <SelectItem value="burundi">Burundi</SelectItem>
                                          <SelectItem value="drc">DR Congo</SelectItem>
                                          <SelectItem value="southsudan">South Sudan</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            onClick={addDependant}
                            variant="outline"
                            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Dependant
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("parents")}
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          Previous: Parent Information
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("documents")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md flex items-center transition-colors shadow-sm"
                        >
                          Next: Documents
                        </Button>
                      </div>
                    </div>
                    )}
                    
                    {/* Documents Tab */}
                    {activeTab === "documents" && (
                      <div className="space-y-6">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">Required Documents</h3>
                      <p className="text-sm text-slate-600 mb-6">Please upload the following required documents. All documents must be in PDF, JPG, or PNG format and not exceed 5MB.</p>
                      
                      {/* Document 1: Barua kutoka Serikali ya mtaa */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-md font-medium text-slate-700">Barua kutoka Serikali ya mtaa</h4>
                              <p className="text-sm text-slate-500">Letter from Local Government Authority</p>
                            </div>
                            <span className="text-red-500 text-sm font-medium">Required</span>
                          </div>
                          
                          {!formData.baruaKutokaSerikali ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors relative">
                              <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                              <p className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload('baruaKutokaSerikali', e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-800">{formData.baruaKutokaSerikali.name}</p>
                                  <p className="text-xs text-green-600">{(formData.baruaKutokaSerikali.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (formData.baruaKutokaSerikaliPreview) {
                                      window.open(formData.baruaKutokaSerikaliPreview, '_blank');
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => removeFile('baruaKutokaSerikali')}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document 2: Ushahidi wa Kuingia Tanzania */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-md font-medium text-slate-700">Ushahidi wa Kuingia Tanzania</h4>
                              <p className="text-sm text-slate-500">Evidence of Entry to Tanzania</p>
                            </div>
                            <span className="text-red-500 text-sm font-medium">Required</span>
                          </div>
                          
                          {!formData.ushahidiWaKuingiaTanzania ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors relative">
                              <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                              <p className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload('ushahidiWaKuingiaTanzania', e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-800">{formData.ushahidiWaKuingiaTanzania.name}</p>
                                  <p className="text-xs text-green-600">{(formData.ushahidiWaKuingiaTanzania.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (formData.ushahidiWaKuingiaTanzaniaPreview) {
                                      window.open(formData.ushahidiWaKuingiaTanzaniaPreview, '_blank');
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => removeFile('ushahidiWaKuingiaTanzania')}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document 3: Ushahidi wa wazazi */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-md font-medium text-slate-700">Ushahidi wa wazazi</h4>
                              <p className="text-sm text-slate-500">Evidence of Parents</p>
                            </div>
                            <span className="text-red-500 text-sm font-medium">Required</span>
                          </div>
                          
                          {!formData.ushahidiWaWazazi ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors relative">
                              <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                              <p className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload('ushahidiWaWazazi', e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-800">{formData.ushahidiWaWazazi.name}</p>
                                  <p className="text-xs text-green-600">{(formData.ushahidiWaWazazi.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  type="button"
                                  onClick={() => {
                                    if (formData.ushahidiWaWazaziPreview) {
                                      window.open(formData.ushahidiWaWazaziPreview, '_blank');
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => removeFile('ushahidiWaWazazi')}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("dependants")}
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          Previous: Dependants
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("review")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md flex items-center transition-colors shadow-sm"
                        >
                          Next: Review
                        </Button>
                      </div>
                    </div>
                    )}
                    
                    {/* Review Tab */}
                    {activeTab === "review" && (
                      <div className="space-y-6">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">Review Your Application</h3>
                      <p className="text-sm text-slate-600 mb-6">Please review all information below. Click Edit to modify details inline.</p>
                      
                      {/* Personal Information Review */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-slate-700">Personal Information</h4>
                          <Button
                            type="button"
                            onClick={() => setEditingSection(editingSection === "personal" ? null : "personal")}
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                          >
                            {editingSection === "personal" ? "Save" : "Edit"}
                          </Button>
                        </div>
                        {editingSection === "personal" ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">First Name</Label>
                              <Input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Middle Name</Label>
                              <Input
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Surname</Label>
                              <Input
                                name="surname"
                                value={formData.surname}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Former/Maiden Name</Label>
                              <Input
                                name="formerOrMaidenName"
                                value={formData.formerOrMaidenName}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Date of Birth</Label>
                              <Input
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Country of Birth</Label>
                              <Select
                                value={formData.countryOfBirth}
                                onValueChange={(value) => handleSelectChange("countryOfBirth", value)}
                              >
                                <SelectTrigger className="bg-white border-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="tanzania">Tanzania</SelectItem>
                                  <SelectItem value="kenya">Kenya</SelectItem>
                                  <SelectItem value="uganda">Uganda</SelectItem>
                                  <SelectItem value="rwanda">Rwanda</SelectItem>
                                  <SelectItem value="burundi">Burundi</SelectItem>
                                  <SelectItem value="drc">DR Congo</SelectItem>
                                  <SelectItem value="southsudan">South Sudan</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Region of Birth</Label>
                              <Input
                                name="regionOfBirth"
                                value={formData.regionOfBirth}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Gender</Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) => handleSelectChange("gender", value)}
                              >
                                <SelectTrigger className="bg-white border-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Marital Status</Label>
                              <Select
                                value={formData.maritalStatus}
                                onValueChange={(value) => handleSelectChange("maritalStatus", value)}
                              >
                                <SelectTrigger className="bg-white border-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single">Single</SelectItem>
                                  <SelectItem value="married">Married</SelectItem>
                                  <SelectItem value="divorced">Divorced</SelectItem>
                                  <SelectItem value="widowed">Widowed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Occupation</Label>
                              <Select
                                value={formData.occupation}
                                onValueChange={(value) => handleSelectChange("occupation", value)}
                              >
                                <SelectTrigger className="bg-white border-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="nimeajiliwa">Nimeajiliwa</SelectItem>
                                  <SelectItem value="nimejiajiri">Nimejiajiri</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Occupation Type</Label>
                              <Input
                                name="occupationType"
                                value={formData.occupationType}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Email</Label>
                              <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Phone</Label>
                              <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="bg-white border-slate-300"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-600">Full Name:</span>
                              <p className="text-slate-800">{formData.firstName} {formData.middleName} {formData.surname}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Former/Maiden Name:</span>
                              <p className="text-slate-800">{formData.formerOrMaidenName || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Date of Birth:</span>
                              <p className="text-slate-800">{formData.dateOfBirth}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Country of Birth:</span>
                              <p className="text-slate-800 capitalize">{formData.countryOfBirth}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Region of Birth:</span>
                              <p className="text-slate-800">{formData.regionOfBirth}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Gender:</span>
                              <p className="text-slate-800 capitalize">{formData.gender}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Marital Status:</span>
                              <p className="text-slate-800 capitalize">{formData.maritalStatus}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Occupation:</span>
                              <p className="text-slate-800 capitalize">{formData.occupation}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Occupation Type:</span>
                              <p className="text-slate-800 capitalize">{formData.occupationType}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Email:</span>
                              <p className="text-slate-800">{formData.email}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Phone:</span>
                              <p className="text-slate-800">{formData.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Residence Information Review */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-slate-700">Residence Information</h4>
                          <Button
                            type="button"
                            onClick={() => setActiveTab("residence")}
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-600">Nationality:</span>
                            <p className="text-slate-800">{formData.nationality}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Country of Residence:</span>
                            <p className="text-slate-800">{formData.countryOfResidence}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Region:</span>
                            <p className="text-slate-800">{formData.region}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">District:</span>
                            <p className="text-slate-800">{formData.district}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Street:</span>
                            <p className="text-slate-800">{formData.street}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Mobile Number:</span>
                            <p className="text-slate-800">{formData.mobileNumber}</p>
                          </div>
                        </div>
                      </div>

                      {/* Parent Information Review */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-slate-700">Parent Information</h4>
                          <Button
                            type="button"
                            onClick={() => setActiveTab("parents")}
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-2">
                            <h5 className="font-medium text-slate-700">Father's Information</h5>
                            <div className="space-y-1">
                              <div><span className="font-medium text-slate-600">Name:</span> {formData.fatherFullName}</div>
                              <div><span className="font-medium text-slate-600">DOB:</span> {formData.fatherDateOfBirth}</div>
                              <div><span className="font-medium text-slate-600">Place of Birth:</span> {formData.fatherPlaceOfBirth}</div>
                              <div><span className="font-medium text-slate-600">Nationality:</span> {formData.fatherNationality}</div>
                              <div><span className="font-medium text-slate-600">Country of Residence:</span> {formData.fatherCountryOfResidence}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-medium text-slate-700">Mother's Information</h5>
                            <div className="space-y-1">
                              <div><span className="font-medium text-slate-600">Name:</span> {formData.motherFullName}</div>
                              <div><span className="font-medium text-slate-600">DOB:</span> {formData.motherDateOfBirth}</div>
                              <div><span className="font-medium text-slate-600">Place of Birth:</span> {formData.motherPlaceOfBirth}</div>
                              <div><span className="font-medium text-slate-600">Nationality:</span> {formData.motherNationality}</div>
                              <div><span className="font-medium text-slate-600">Country of Residence:</span> {formData.motherCountryOfResidence}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dependants Review */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-slate-700">Dependants ({formData.dependants.length})</h4>
                          <Button
                            type="button"
                            onClick={() => setActiveTab("dependants")}
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                          >
                            Edit
                          </Button>
                        </div>
                        {formData.dependants.length === 0 ? (
                          <p className="text-slate-500 text-sm">No dependants added</p>
                        ) : (
                          <div className="space-y-3">
                            {formData.dependants.map((dependant, index) => (
                              <div key={index} className="border border-slate-100 rounded p-3 bg-slate-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                  <div><span className="font-medium text-slate-600">Name:</span> {dependant.fullName}</div>
                                  <div><span className="font-medium text-slate-600">Relationship:</span> {dependant.relationship}</div>
                                  <div><span className="font-medium text-slate-600">Has Passport:</span> {dependant.hasPassport ? 'Yes' : 'No'}</div>
                                  {dependant.hasPassport && (
                                    <>
                                      <div><span className="font-medium text-slate-600">Passport:</span> {dependant.passportNumber}</div>
                                      <div><span className="font-medium text-slate-600">Nationality:</span> {dependant.nationality}</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Documents Review */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-slate-700">Documents</h4>
                          <Button
                            type="button"
                            onClick={() => setActiveTab("documents")}
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="font-medium text-slate-600">Barua kutoka Serikali ya mtaa:</span>
                            <span className={formData.baruaKutokaSerikali ? 'text-green-600' : 'text-red-600'}>
                              {formData.baruaKutokaSerikali ? '✓ Uploaded' : '✗ Not uploaded'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="font-medium text-slate-600">Ushahidi wa Kuingia Tanzania:</span>
                            <span className={formData.ushahidiWaKuingiaTanzania ? 'text-green-600' : 'text-red-600'}>
                              {formData.ushahidiWaKuingiaTanzania ? '✓ Uploaded' : '✗ Not uploaded'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="font-medium text-slate-600">Ushahidi wa wazazi:</span>
                            <span className={formData.ushahidiWaWazazi ? 'text-green-600' : 'text-red-600'}>
                              {formData.ushahidiWaWazazi ? '✓ Uploaded' : '✗ Not uploaded'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("documents")}
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          Previous: Documents
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("declaration")}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md flex items-center transition-colors shadow-sm"
                        >
                          Next: Declaration
                        </Button>
                      </div>
                    </div>
                    )}
                    
                    {/* Declaration Tab */}
                    {activeTab === "declaration" && (
                      <div className="space-y-6">
                      <h3 className="text-lg font-medium border-b pb-2 mb-4">Declaration</h3>
                      <p className="text-sm text-slate-600 mb-6">Please review all your information below and make your declaration.</p>
                      
                      {/* Personal Information */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <h4 className="text-md font-medium text-slate-700 mb-4">Personal Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-600">Full Name:</span>
                            <p className="text-slate-800">{formData.firstName} {formData.middleName} {formData.surname}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Former/Maiden Name:</span>
                            <p className="text-slate-800">{formData.formerOrMaidenName || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Date of Birth:</span>
                            <p className="text-slate-800">{formData.dateOfBirth}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Country of Birth:</span>
                            <p className="text-slate-800 capitalize">{formData.countryOfBirth}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Region of Birth:</span>
                            <p className="text-slate-800">{formData.regionOfBirth}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Gender:</span>
                            <p className="text-slate-800 capitalize">{formData.gender}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Marital Status:</span>
                            <p className="text-slate-800 capitalize">{formData.maritalStatus}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Occupation:</span>
                            <p className="text-slate-800 capitalize">{formData.occupation}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Occupation Type:</span>
                            <p className="text-slate-800 capitalize">{formData.occupationType}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Email:</span>
                            <p className="text-slate-800">{formData.email}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Phone:</span>
                            <p className="text-slate-800">{formData.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Residence Information */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <h4 className="text-md font-medium text-slate-700 mb-4">Residence Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-600">Nationality:</span>
                            <p className="text-slate-800">{formData.nationality}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Country of Residence:</span>
                            <p className="text-slate-800">{formData.countryOfResidence}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Region:</span>
                            <p className="text-slate-800">{formData.region}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">District:</span>
                            <p className="text-slate-800">{formData.district}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Street:</span>
                            <p className="text-slate-800">{formData.street}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Mobile Number:</span>
                            <p className="text-slate-800">{formData.mobileNumber}</p>
                          </div>
                        </div>
                      </div>

                      {/* Parent Information */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <h4 className="text-md font-medium text-slate-700 mb-4">Parent Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-2">
                            <h5 className="font-medium text-slate-700">Father's Information</h5>
                            <div className="space-y-1">
                              <div><span className="font-medium text-slate-600">Name:</span> {formData.fatherFullName}</div>
                              <div><span className="font-medium text-slate-600">DOB:</span> {formData.fatherDateOfBirth}</div>
                              <div><span className="font-medium text-slate-600">Place of Birth:</span> {formData.fatherPlaceOfBirth}</div>
                              <div><span className="font-medium text-slate-600">Nationality:</span> {formData.fatherNationality}</div>
                              <div><span className="font-medium text-slate-600">Country of Residence:</span> {formData.fatherCountryOfResidence}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-medium text-slate-700">Mother's Information</h5>
                            <div className="space-y-1">
                              <div><span className="font-medium text-slate-600">Name:</span> {formData.motherFullName}</div>
                              <div><span className="font-medium text-slate-600">DOB:</span> {formData.motherDateOfBirth}</div>
                              <div><span className="font-medium text-slate-600">Place of Birth:</span> {formData.motherPlaceOfBirth}</div>
                              <div><span className="font-medium text-slate-600">Nationality:</span> {formData.motherNationality}</div>
                              <div><span className="font-medium text-slate-600">Country of Residence:</span> {formData.motherCountryOfResidence}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dependants */}
                      <div className="border border-slate-200 rounded-lg p-4 bg-white">
                        <h4 className="text-md font-medium text-slate-700 mb-4">Dependants ({formData.dependants.length})</h4>
                        {formData.dependants.length === 0 ? (
                          <p className="text-slate-500 text-sm">No dependants added</p>
                        ) : (
                          <div className="space-y-3">
                            {formData.dependants.map((dependant, index) => (
                              <div key={index} className="border border-slate-100 rounded p-3 bg-slate-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                  <div><span className="font-medium text-slate-600">Name:</span> {dependant.fullName}</div>
                                  <div><span className="font-medium text-slate-600">Relationship:</span> {dependant.relationship}</div>
                                  <div><span className="font-medium text-slate-600">Has Passport:</span> {dependant.hasPassport ? 'Yes' : 'No'}</div>
                                  {dependant.hasPassport && (
                                    <>
                                      <div><span className="font-medium text-slate-600">Passport:</span> {dependant.passportNumber}</div>
                                      <div><span className="font-medium text-slate-600">Nationality:</span> {dependant.nationality}</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Declaration Statement */}
                      <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                        <h4 className="text-lg font-medium text-slate-700 mb-4">Declaration Statement</h4>
                        <div className="space-y-4 text-sm text-slate-700">
                          <p>
                            I, <strong>{formData.firstName} {formData.middleName} {formData.surname}</strong>, hereby declare that:
                          </p>
                          <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>All information provided in this application is true, complete, and accurate to the best of my knowledge.</li>
                            <li>I understand that providing false or misleading information may result in the rejection of my application or cancellation of any permit issued.</li>
                            <li>I agree to comply with all laws and regulations of the United Republic of Tanzania.</li>
                            <li>I understand that this application does not guarantee the issuance of a migrant pass.</li>
                            <li>I consent to the processing of my personal data for the purpose of this application.</li>
                          </ul>
                          <p className="mt-4">
                            <strong>Applicant Name:</strong> {formData.firstName} {formData.middleName} {formData.surname}
                          </p>
                          <p>
                            <strong>Date:</strong> {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t mt-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("review")}
                          variant="outline"
                          className="border-slate-300 text-slate-700"
                        >
                          Previous: Review
                        </Button>
                        <LoadingButton
                          type="submit"
                          isLoading={isLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center transition-colors shadow-sm"
                        >
                          Submit Application
                        </LoadingButton>
                      </div>
                    </div>
                    )}
                    
                    {/* Success Tab */}
                    {activeTab === "success" && (
                      <div className="space-y-6">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900">Application Submitted Successfully!</h3>
                          <p className="text-slate-600">Your migrant pass application has been submitted and is now being processed.</p>
                        </div>

                        <div className="border border-slate-200 rounded-lg p-6 bg-white">
                          <div className="flex">
                            {/* Photo and Barcode Section */}
                            <div className="w-80 bg-slate-50 p-6 border-r border-slate-200">
                              <div className="space-y-6">
                                {/* Photo Placeholder */}
                                <div className="space-y-2">
                                  <h4 className="font-medium text-slate-700">Applicant Photo</h4>
                                  <div className="w-32 h-40 bg-slate-200 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center mx-auto">
                                    <div className="text-center">
                                      <User className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                      <p className="text-xs text-slate-500">Photo will be added after verification</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Barcode Placeholder */}
                                <div className="space-y-2">
                                  <h4 className="font-medium text-slate-700">Application Barcode</h4>
                                  <div className="w-full h-16 bg-slate-200 rounded border-2 border-dashed border-slate-300 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="flex space-x-1 mb-1">
                                        {[...Array(12)].map((_, i) => (
                                          <div key={i} className="w-1 h-8 bg-slate-400 rounded-sm"></div>
                                        ))}
                                      </div>
                                      <p className="text-xs text-slate-500">MP-2024-001234</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Download Button */}
                                <Button
                                  onClick={() => {
                                    const pdfContent = `
MIGRANT PASS APPLICATION FORM

[PHOTO PLACEHOLDER]                    [BARCODE PLACEHOLDER]

APPLICATION ID: MP-2024-001234
SUBMISSION DATE: ${new Date().toLocaleDateString()}

PERSONAL INFORMATION
Full Name: ${formData.firstName} ${formData.middleName} ${formData.surname}
Former/Maiden Name: ${formData.formerOrMaidenName || 'N/A'}
Date of Birth: ${formData.dateOfBirth}
Country of Birth: ${formData.countryOfBirth}
Region of Birth: ${formData.regionOfBirth}
Gender: ${formData.gender}
Marital Status: ${formData.maritalStatus}
Occupation: ${formData.occupation}
Occupation Type: ${formData.occupationType}
Email: ${formData.email}
Phone: ${formData.phone}

RESIDENCE INFORMATION
Nationality: ${formData.nationality}
Country of Residence: ${formData.countryOfResidence}
Region: ${formData.region}
District: ${formData.district}
Street: ${formData.street}
Mobile Number: ${formData.mobileNumber}

PARENT INFORMATION
Father's Name: ${formData.fatherFullName}
Father's DOB: ${formData.fatherDateOfBirth}
Father's Place of Birth: ${formData.fatherPlaceOfBirth}
Father's Nationality: ${formData.fatherNationality}
Father's Country of Residence: ${formData.fatherCountryOfResidence}

Mother's Name: ${formData.motherFullName}
Mother's DOB: ${formData.motherDateOfBirth}
Mother's Place of Birth: ${formData.motherPlaceOfBirth}
Mother's Nationality: ${formData.motherNationality}
Mother's Country of Residence: ${formData.motherCountryOfResidence}

DEPENDANTS
${formData.dependants.length === 0 ? 'No dependants' : formData.dependants.map((dep, index) => 
  `Dependant ${index + 1}: ${dep.fullName} (${dep.relationship})`
).join('\n')}

DECLARATION
I, ${formData.firstName} ${formData.middleName} ${formData.surname}, hereby declare that all information provided is true and accurate.

Date: ${new Date().toLocaleDateString()}
Applicant Signature: _____________________
                                    `;

                                    const blob = new Blob([pdfContent], { type: 'text/plain' });
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `migrant-application-MP-2024-001234.txt`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  }}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download Application Form
                                </Button>
                              </div>
                            </div>

                            {/* Application Summary */}
                            <div className="flex-1 p-6">
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-lg font-medium text-slate-700 mb-4">Application Summary</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-slate-600">Application ID:</span>
                                      <p className="text-slate-800">MP-2024-001234</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">Submission Date:</span>
                                      <p className="text-slate-800">{new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">Full Name:</span>
                                      <p className="text-slate-800">{formData.firstName} {formData.middleName} {formData.surname}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">Email:</span>
                                      <p className="text-slate-800">{formData.email}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">Phone:</span>
                                      <p className="text-slate-800">{formData.phone}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-slate-600">Status:</span>
                                      <p className="text-green-600 font-medium">Submitted</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <h5 className="font-medium text-slate-700 mb-3">Next Steps</h5>
                                  <div className="space-y-2 text-sm text-slate-600">
                                    <p>• Your application will be reviewed within 5-10 business days</p>
                                    <p>• You will receive updates via email and SMS</p>
                                    <p>• Additional documents may be requested if needed</p>
                                    <p>• You will be notified when your migrant pass is ready for collection</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                          <Button
                            onClick={() => router.push("/dashboard")}
                            variant="outline"
                            className="border-slate-300 text-slate-700"
                          >
                            Go to Dashboard
                          </Button>
                          <Button
                            onClick={() => {
                              setActiveTab("personal");
                              setFormData({
                                firstName: "",
                                middleName: "",
                                surname: "",
                                formerOrMaidenName: "",
                                dateOfBirth: "",
                                countryOfBirth: "",
                                regionOfBirth: "",
                                gender: "",
                                maritalStatus: "",
                                occupation: "",
                                occupationType: "",
                                email: "",
                                phone: "",
                                nationality: "",
                                countryOfResidence: "",
                                region: "",
                                district: "",
                                street: "",
                                plotNo: "",
                                houseNo: "",
                                mobileNumber: "",
                                fatherFullName: "",
                                fatherDateOfBirth: "",
                                fatherPlaceOfBirth: "",
                                fatherNationality: "",
                                fatherCountryOfResidence: "",
                                motherFullName: "",
                                motherDateOfBirth: "",
                                motherPlaceOfBirth: "",
                                motherNationality: "",
                                motherCountryOfResidence: "",
                                dependants: [],
                                baruaKutokaSerikali: null,
                                ushahidiWaKuingiaTanzania: null,
                                ushahidiWaWazazi: null,
                                baruaKutokaSerikaliPreview: "",
                                ushahidiWaKuingiaTanzaniaPreview: "",
                                ushahidiWaWazaziPreview: "",
                              });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Submit Another Application
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
