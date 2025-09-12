"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { CheckCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function ConfirmationPage() {
  const router = useRouter();
  
  // Generate a random application reference number
  const applicationRef = `MP-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
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
  
  return (
    <ApplicationLayout 
      title="Application Confirmation" 
      subtitle="Your application has been submitted successfully"
      currentStep="uthibitisho"
    >
      <div className="relative overflow-hidden">
        {/* Yellow diagonal accent line - more subtle */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-yellow-400 transform -skew-x-12 translate-x-1/2 z-0 opacity-10"></div>
        
        <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="mb-8"
            >
              <Button
                variant="ghost"
                className="flex items-center text-slate-600 hover:text-slate-900"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div 
                variants={itemVariants}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Application Submitted Successfully</h1>
                <p className="mt-2 text-slate-600 max-w-md">
                  Your application has been received and is now being processed. You will receive updates via SMS and email.
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="border-slate-200 shadow-md">
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>
                      Keep this information for your records
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-500">Application Reference</p>
                      <p className="text-xl font-mono font-semibold text-slate-900">{applicationRef}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-slate-900">Next Steps</h3>
                      <ul className="space-y-2 text-slate-600">
                        <li className="flex items-start">
                          <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                          <span>Your application will be reviewed by our team (1-3 business days)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                          <span>You will receive SMS notifications about your application status</span>
                        </li>
                        <li className="flex items-start">
                          <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                          <span>If approved, you will be notified when and where to collect your Migrant Pass</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => router.push("/")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Home className="h-4 w-4" />
                      Return to Home
                    </Button>
                    <Button
                      onClick={() => router.push("/application/status")}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Check Application Status
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </div>
      </div>
    </ApplicationLayout>
  );
}
