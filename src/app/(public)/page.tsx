"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { ArrowRight, Sun, Moon, ChevronRight, Globe, LogIn, UserPlus, Mail, Lock, Eye, EyeOff, FileText, Briefcase, Users, CheckCircle2, BookOpen } from "lucide-react";
import { NavLink } from "../../components/ui/nav-link";
import { Button } from "../../components/ui/button";
import { PDFViewer } from "../../components/ui/pdf-viewer";
import { AgriculturalBackground } from "../../components/ui/agricultural-background";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { LoadingButton } from "../../components/ui/loading-button";
import { authEndpoints } from "../../lib/api/endpoints/auth";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

// Service types for the landing page
interface Service {
  title: string;
  preview: string;
  href: string;
  details: string; // Additional details for the dialog
  requirements?: string[];
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Scroll animation variants
const scrollFadeUpVariants: Variants = {
  offscreen: { y: 50, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  }
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const slideInLeftVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 20,
      delay: 0.2
    }
  }
};

const slideInRightVariants: Variants = {
  hidden: { x: 50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 20,
      delay: 0.2
    }
  }
};

const scaleInVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      delay: 0.1
    }
  }
};

const staggerCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 200, 
      damping: 20 
    }
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const iconVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 }
  },
  hover: {
    rotate: [0, -10, 10, -5, 0],
    transition: { duration: 0.5 }
  }
};

const buttonHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const services: Service[] = [
  {
    title: "Jaza ombi",
    preview: "Kwa Mwombaji anayeanza kujaza fomu ya maombi ya Kibali cha Walowezi kwa njia ya kielektroniki.",
    href: "/",
    details: "The e-Walowezi application service allows you to submit your information and required documents to apply for a permit. Our streamlined process ensures efficient handling of your application.",
    requirements: [
      "Namba ya Utambulisho wa mhusika(Subject ID)",
      "Barua ya Mtendaji kutoka serikali ya mtaa",
      "Picha ya Muombaji",
      "Ushahidi wa Kuingia Nchini",
      "Ushahidi wa Wazazi",
      "Nyaraka zitakazohitajika kulingana na aina ya maombi"
    ]
  },
  {
    title: "Endeleza Ombi",
    preview: "Kwa Mwombaji ambaye alishajaza fomu ya maombi ya Kibali cha Walowezi na kufikia hatua ya kupatiwa Namba ya Ombi.",
    href: "/application/continue",
    details: "Endelea na ombi ulilolianza awali. Huduma hii inakuruhusu kuendelea na mchakato wako wa maombi kwa kutoa Kitambulisho cha Ombi na namba ya simu uliyosajili.",
    requirements: [
      "Namba ya Ombi lako",
      "Namba ya simu uliyosajili"
    ]
  },
  {
    title: "Ufuatiliaji Ombi",
    preview: "Angalia hali na maendeleo ya ombi lako la kupatiwa Kibali cha Walowezi ulilowasilisha.",
    href: "/application/progress",
    details: "Track the progress of your e-Walowezi application through our portal. Get real-time updates on the status of your application and receive notifications when action is required.",
    requirements: [
      "Namba ya Ombi lako",
      "Namba ya simu uliyosajili"
    ]
  }
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  // Scroll animations
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);
  
  // Since we only have the landing page, we don't redirect authenticated users
  // Just keep them on the landing page
  useEffect(() => {
    // No redirects needed as we only have the landing page
  }, []);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false
  });
  const [formErrors, setFormErrors] = useState({
    login: '',
    register: '',
    otp: ''
  });
  const [accountForm, setAccountForm] = useState({
    login: {
      email: '',
      password: ''
    },
    register: {
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'individual',
      agreeTerms: false
    },
    otp: {
      code: '',
      email: ''
    }
  });
  
  // OTP verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('sw-TZ', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };
  
  // Password validation function
  const validatePassword = (password: string): boolean => {
    // Check for at least one uppercase letter
    const hasUpperCase = /[A-Z]/.test(password);
    // Check for at least one lowercase letter
    const hasLowerCase = /[a-z]/.test(password);
    // Check for at least one digit
    const hasDigit = /[0-9]/.test(password);
    // Check for at least one special character
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
  };

  const togglePasswordVisibility = (field: 'login' | 'register') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Clear previous errors
    setFormErrors(prev => ({ ...prev, login: '' }));
    
    try {
      // Use auth endpoint for login
      const result = await authEndpoints.signin(
        accountForm.login.email,
        accountForm.login.password
      );
      
      // Check if the login was successful based on API response
      if (result && result.status) {
        console.log('Login successful:', result);
        // If successful, redirect to dashboard
        // The token is already stored in localStorage by the signin function
        router.push('/dashboard');
      } else {
        // API returned success: false
        const errorMessage = result?.message || 'Login failed. Please check your credentials.';
        setFormErrors(prev => ({ ...prev, login: errorMessage }));
        setIsLoading(false);
      }
    } catch (error: any) {
      // Handle login errors
      console.error('Login failed:', error);
      
      // Extract error message from API response if available
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormErrors(prev => ({ ...prev, login: errorMessage }));
      setIsLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Clear previous errors
    setFormErrors(prev => ({ ...prev, register: '' }));
    
    // Validate passwords match
    if (accountForm.register.password !== accountForm.register.confirmPassword) {
      setFormErrors(prev => ({ ...prev, register: 'Passwords do not match' }));
      setIsLoading(false);
      return;
    }
    
    // Validate terms agreement
    if (!accountForm.register.agreeTerms) {
      setFormErrors(prev => ({ ...prev, register: 'You must agree to the terms and conditions' }));
      setIsLoading(false);
      return;
    }
    
    // Validate password strength
    if (!validatePassword(accountForm.register.password)) {
      setFormErrors(prev => ({ 
        ...prev, 
        register: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      }));
      setIsLoading(false);
      return;
    }
    
    try {
      // Use auth endpoint for registration
      const result = await authEndpoints.signup(
        accountForm.register.email,
        accountForm.register.password
      );
      
      console.log('Registration result:', result);
      
      if (result.status) {
        // After successful registration, show OTP verification
        setAccountForm(prev => ({
          ...prev,
          otp: {
            ...prev.otp,
            email: accountForm.register.email
          }
        }));
        
        // Set OTP verification state
        setShowOtpVerification(true);
        
        // Start OTP timer (5 minutes = 300 seconds)
        setOtpTimer(300);
        setOtpExpired(false);
        setIsLoading(false);
      } else {
        // Registration failed with API error
        const errorMessage = result.message || 'Registration failed. Please try again.';
        setFormErrors(prev => ({ ...prev, register: errorMessage }));
        setIsLoading(false);
      }
    } catch (error: any) {
      // Handle registration errors
      console.error('Registration failed:', error);
      
      // Extract error message from API response if available
      let errorMessage = 'Registration failed. Please try again.';
      
      // Check for specific error types
      if (error.isEmailTaken) {
        // Email already exists error (409 Conflict)
        errorMessage = error.message;
        // Optionally switch to login tab or provide a link
        // setActiveTab('login');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormErrors(prev => ({ ...prev, register: errorMessage }));
      setIsLoading(false);
    }
  };
  
  // OTP verification handler
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Clear previous errors
    setFormErrors(prev => ({ ...prev, otp: '' }));
    
    try {
      // Use auth endpoint for OTP verification
      const result = await authEndpoints.verifyOTP(
        accountForm.otp.email,
        accountForm.otp.code
      );
      
      if (result.status) {
        // OTP verification successful, redirect to dashboard
        router.push('/dashboard');
      } else {
        // OTP verification failed
        const errorMessage = result.message || 'OTP verification failed. Please try again.';
        setFormErrors(prev => ({ ...prev, otp: errorMessage }));
        setIsLoading(false);
      }
    } catch (error: any) {
      // Handle OTP verification errors
      console.error('OTP verification failed:', error);
      
      // Extract error message from API response if available
      let errorMessage = 'OTP verification failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormErrors(prev => ({ ...prev, otp: errorMessage }));
      setIsLoading(false);
    }
  };
  
  // Resend OTP handler
  const handleResendOtp = async () => {
    setIsLoading(true);
    
    try {
      // Use auth endpoint to resend OTP
      const result = await authEndpoints.resendOTP(accountForm.otp.email);
      
      if (result.status) {
        // Reset OTP timer
        setOtpTimer(300);
        setOtpExpired(false);
        setIsLoading(false);
      } else {
        // Resend OTP failed
        const errorMessage = result.message || 'Failed to resend OTP. Please try again.';
        setFormErrors(prev => ({ ...prev, otp: errorMessage }));
        setIsLoading(false);
      }
    } catch (error: any) {
      // Handle resend OTP errors
      console.error('Resend OTP failed:', error);
      
      // Extract error message from API response if available
      let errorMessage = 'Failed to resend OTP. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormErrors(prev => ({ ...prev, otp: errorMessage }));
      setIsLoading(false);
    }
  };
  
  // OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showOtpVerification && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prevTimer => {
          if (prevTimer <= 1) {
            setOtpExpired(true);
            clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpVerification, otpTimer]);

  return (
    <>
      {/* Hero section with softer government blue background */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        className="relative overflow-hidden">
        {/* Yellow diagonal accent line - more subtle */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-yellow-400 transform -skew-x-12 translate-x-1/2 z-0 opacity-10"></div>
        
        {/* Transparent card containing all content */}
        <div className="w-full px-4 py-4">
          <div className="bg-slate-50 p-6 shadow-lg rounded-lg">
            <div className="flex flex-col md:flex-row">
              {/* Left side content */}
              <motion.div 
                variants={slideInLeftVariants}
                initial="hidden"
                animate="visible"
                className="z-10 md:w-1/3">
                <motion.h2 
                  className="text-slate-800 text-3xl md:text-4xl font-bold mb-6 leading-tight"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.span variants={itemVariants} className="block">{t('landing.managing')}</motion.span>
                  <motion.span variants={itemVariants} className="block">Migrant (Walowezi)</motion.span>
                  <motion.span variants={itemVariants} className="block text-blue-600">{t('landing.inTanzania')}</motion.span>
                </motion.h2>
                
                <motion.p 
                  className="text-slate-600 mb-4 max-w-md"
                  variants={itemVariants}
                >
                  {t('landing.description')}
                </motion.p>
                
                <motion.div
                  variants={itemVariants}
                  className="mb-2"
                >
                  <PDFViewer 
                    pdfPath="/api/pdf?file=MIGRANT%20PASS%20(KIBALI%20CHA%20MLOWEZI).pdf"
                    buttonText="Soma Muongozo wa Kibali cha Mlowezi"
                    title="Muongozo wa Kibali cha Mlowezi"
                    variant="secondary"
                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-md font-medium text-base shadow-sm hover:shadow-md transition-all duration-200"
                  />
                </motion.div>
              </motion.div>
              
              {/* Right side - Latest Announcements */}
              <motion.div 
                variants={slideInRightVariants}
                initial="hidden"
                animate="visible"
                className="md:w-2/3 mt-12 md:mt-0 z-10">
                <motion.div 
                  variants={scaleInVariants}
                  className="bg-slate-100/70 dark:bg-slate-900/60 rounded-lg p-6 backdrop-blur-sm">
                  {/* <h3 className="font-bold text-lg mb-4">{t('landing.ourServices')}</h3> */}
                  
                  <motion.div 
                    variants={staggerCardVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {services.map((service, index) => {
                      // Determine which icon to show based on service title or index
                      let ServiceIcon = FileText;
                      
                      if (service.title.toLowerCase().includes('registration') || service.title.toLowerCase().includes('usajili')) {
                        ServiceIcon = UserPlus;
                      } else if (service.title.toLowerCase().includes('company') || service.title.toLowerCase().includes('kampuni')) {
                        ServiceIcon = Briefcase;
                      } else if (service.title.toLowerCase().includes('permit') || service.title.toLowerCase().includes('kibali')) {
                        ServiceIcon = CheckCircle2;
                      } else if (index === 1) {
                        ServiceIcon = Users;
                      }
                      
                      return (
                        <motion.div 
                          key={index} 
                          variants={cardVariants}
                          whileHover="hover"
                          className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-md hover:shadow-lg hover:border-blue-400 transition-all duration-300">
                          <div className="flex items-start mb-4">
                            <motion.div 
                              className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0"
                              variants={iconVariants}
                              whileHover="hover"
                            >
                              <ServiceIcon className="h-6 w-6 text-blue-600" />
                            </motion.div>
                            <h4 className="font-semibold text-lg text-slate-800">{service.title}</h4>
                          </div>
                          <p className="text-base text-slate-600 mt-2 flex-grow">{service.preview}</p>
                          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                            
                            {service.title === "Ufuatiliaji Ombi" ? (
                              <Link href="/application/progress">
  <motion.button 
                                  className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  <span className="text-sm whitespace-nowrap">Angalia hali ya maombi</span>
                                  <ChevronRight size={16} />
                                </motion.button>
                                
                              </Link>
                            ) : service.title === "Endeleza Ombi" ? (
                                <Link href="/application/continue">
                                  <motion.button 
                                    className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                  >
                                    <span className="text-sm whitespace-nowrap">Endeleza Ombi</span>
                                    <ChevronRight size={16} />
                                  </motion.button>
                                </Link>
                              ) : (
                                <Link href="/application">
                                  <motion.button 
                                    className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                  >
                                    <span className="text-sm whitespace-nowrap">Anza Ombi</span>
                                    <ChevronRight size={16} />
                                  </motion.button>
                                </Link>
                              )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
