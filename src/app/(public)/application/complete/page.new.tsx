"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Download, CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent } from "@/components/ui/card";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { format } from "date-fns";
import { MigrantFormData, generateMigrantFormPDF, imageToBase64 } from '@/components/application/MigrantFormPDF';

// Import jsPDF dynamically to avoid SSR issues
let jsPDF: any;

// Load PDF library on client side only
if (typeof window !== 'undefined') {
  import('jspdf').then((jsPDFModule) => {
    jsPDF = jsPDFModule.default;
  });
}

export default function ApplicationCompletePage() {
  const searchParams = useSearchParams();
  const referenceId = searchParams.get('referenceId') || '';
  const { formData } = useApplication();
  
  // Use state for application ID and submission date to avoid hydration errors
  const [applicationId, setApplicationId] = useState(referenceId || '');
  const [submissionDate, setSubmissionDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Set application ID from URL parameter if available
    if (referenceId) {
      setApplicationId(referenceId);
    }
    
    // Set submission date on client-side
    setSubmissionDate(new Date().toLocaleDateString());
  }, [referenceId]);
  
  // Format dates for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not provided';
    return format(new Date(date), 'dd MMM yyyy');
  };
  
  // Preload applicant photo
  const [images, setImages] = useState<{
    applicantPhoto?: string;
  }>({});
  
  useEffect(() => {
    // Load applicant photo when component mounts
    const loadImages = async () => {
      try {
        // Use a placeholder for applicant photo if not available
        const applicantPhoto = await imageToBase64('/images/applicant-photo.jpg');
        
        setImages({
          applicantPhoto: applicantPhoto
        });
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };
    
    loadImages();
  }, []);

  // Handle PDF download
  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      // Check if jsPDF is loaded and applicant photo is available
      if (!jsPDF) {
        alert('PDF generator is loading. Please try again in a moment.');
        setIsLoading(false);
        return;
      }

      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Prepare form data for PDF generation
      const migrantFormData: MigrantFormData = {
        applicationId: applicationId,
        firstName: formData.firstName || '',
        middleName: formData.middleName || '',
        lastName: formData.lastName || '',
        otherName: formData.otherName || '',
        maritalStatus: formData.maritalStatus || '',
        dateOfBirth: formData.dateOfBirth ? (typeof formData.dateOfBirth === 'string' ? new Date(formData.dateOfBirth) : formData.dateOfBirth) : null,
        gender: formData.gender || '',
        countryOfBirth: formData.nationality || '',
        region: formData.region || '',
        mobileNumber: formData.mobileNumber || '',
        occupationType: formData.occupationType || '',
        occupation: formData.occupation || '',
        // Add other fields as needed
      };
      
      // Generate the PDF using our component
      await generateMigrantFormPDF(
        doc, 
        migrantFormData,
        images.applicantPhoto
      );
      
      // Save the PDF
      doc.save(`migrant-application-${applicationId}.pdf`);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <ApplicationLayout 
      title="Ombi Limefanikiwa" 
      subtitle="Maombi yako yamewasilishwa kwa mafanikio"
      applicationId={applicationId || referenceId || '---'}
      currentStep="complete"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Success Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hongera! Maombi Yako Yamefanikiwa</h2>
            <p className="text-gray-600 mt-2">
              Maombi yako yamewasilishwa kwa mafanikio na yatashughulikiwa hivi karibuni.
            </p>
          </div>
        </div>

        {/* Application Details Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Maelezo ya Maombi</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Namba ya Maombi:</span>
                  <span className="font-medium text-gray-800">{applicationId}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Tarehe ya Kuwasilisha:</span>
                  <span className="font-medium text-gray-800">{submissionDate}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Jina la Mwombaji:</span>
                  <span className="font-medium text-gray-800">
                    {formData.firstName || ''} {formData.middleName || ''} {formData.lastName || ''}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Hali ya Maombi:</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Yamewasilishwa
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <LoadingButton
            onClick={handleDownloadPDF}
            isLoading={isLoading}
            loadingText="Inaandaa Fomu..."
            spinnerVariant="primary"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Pakua Fomu ya Maombi
          </LoadingButton>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-2 rounded flex items-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Rudi Mwanzo
          </Button>
        </div>
      </motion.div>
    </ApplicationLayout>
  );
}
