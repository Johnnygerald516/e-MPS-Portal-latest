"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Download, CheckCircle, Home, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { format } from "date-fns";
import { MigrantFormData, generateMigrantFormPDF, imageToBase64 } from '@/components/application/MigrantFormPDF';
import PDFPreview from '@/components/application/PDFPreview';

// Import jsPDF dynamically to avoid SSR issues
let jsPDF: any;

// Load PDF library on client side only
if (typeof window !== 'undefined') {
  import('jspdf').then((jsPDFModule) => {
    jsPDF = jsPDFModule.default;
  });
}

function ApplicationCompleteContent(): React.ReactNode {
  const searchParams = useSearchParams();
  // Get applicationId from URL parameter
  const applicationIdParam = searchParams.get('applicationId') || '';
  const { formData } = useApplication();
  
  // Use state for application ID and submission date to avoid hydration errors
  const [applicationId, setApplicationId] = useState(applicationIdParam || '');
  const [submissionDate, setSubmissionDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for real API data like declaration page
  const [applicationData, setApplicationData] = useState<any>(null);
  const [applicantPhoto, setApplicantPhoto] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true); // Start with loading state
  
  // Add state for submission status from context
  const [submissionStatus, setSubmissionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [submissionMessage, setSubmissionMessage] = useState<string>('');
  
  useEffect(() => {
    // Set application ID from context or URL parameter
    const contextApplicationId = formData.applicationId;
    if (contextApplicationId) {
      setApplicationId(contextApplicationId);
    } else if (applicationIdParam) {
      setApplicationId(applicationIdParam);
    } else {
    }
    
    // Set submission date on client-side
    setSubmissionDate(new Date().toLocaleDateString());
    
    // Check submission status from context
    if (formData.submissionStatus === 'success') {
      setSubmissionStatus('success');
      setSubmissionMessage(formData.submissionMessage || 'Application submitted successfully');
    } else if (formData.submissionError) {
      setSubmissionStatus('error');
      setSubmissionMessage(formData.submissionError);
    } else {
      // Default to loading if no status is available
      setSubmissionStatus('loading');
      setSubmissionMessage('Processing your application...');
    }
  }, [applicationIdParam, formData]);

  // Fetch real application data like declaration page
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!applicationId) return;
      
      setIsLoadingData(true);
      try {
        const response = await fetch(`/api/applications/${applicationId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.ackCode === 1 && data.jsonResult) {
            setApplicationData(data.jsonResult);
            
            // Handle applicant photo - same logic as declaration page
            if (data.jsonResult.applicantPhoto && Array.isArray(data.jsonResult.applicantPhoto) && 
                data.jsonResult.applicantPhoto.length > 0) {
              
              const photoItem = data.jsonResult.applicantPhoto[0];
              
              if (photoItem.attachmentType && typeof photoItem.attachmentType === 'string') {
                if (photoItem.attachmentType.startsWith('data:')) {
                  setApplicantPhoto(photoItem.attachmentType);
                } else {
                  const photoUrl = `data:image/jpeg;base64,${photoItem.attachmentType}`;
                  setApplicantPhoto(photoUrl);
                }
              }
            }
          }
        }
      } catch (error) {
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchApplicationData();
  }, [applicationId]);
  
  // Format dates for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not provided';
    return format(new Date(date), 'dd MMM yyyy');
  };
  
  // Preload images
  const [images, setImages] = useState<{
    coatOfArms?: string;
    logo?: string;
    applicantPhoto?: string;
  }>({});
  
  useEffect(() => {
    // Load images when component mounts
    const loadImages = async () => {
      try {
        // Load each image individually with error handling
        let coatOfArmsImage = '';
        let logoImage = '';
        let applicantPhoto = '';
        
        // Use a PNG data URL instead of SVG for better compatibility with jsPDF
        coatOfArmsImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTAzLTIwVDEwOjA4OjI1KzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wMy0yMFQxMDoxMDoxMCswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wMy0yMFQxMDoxMDoxMCswMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3YzY4ZmI3Yy1kMDI2LTRiNGEtOWRkZC1mYWYzNmExZGMwYWIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N2M2OGZiN2MtZDAyNi00YjRhLTlkZGQtZmFmMzZhMWRjMGFiIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6N2M2OGZiN2MtZDAyNi00YjRhLTlkZGQtZmFmMzZhMWRjMGFiIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3YzY4ZmI3Yy1kMDI2LTRiNGEtOWRkZC1mYWYzNmExZGMwYWIiIHN0RXZ0OndoZW49IjIwMjMtMDMtMjBUMTA6MDg6MjUrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7LK7UAAAAgSURBVHja7cEBAQAAAICQ/q/uCAoAAAAAAAAAAABcDStPAAGLJ8wFAAAAAElFTkSuQmCC';
       logoImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTAzLTIwVDEwOjA4OjI1KzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wMy0yMFQxMDoxMDoxMCswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wMy0yMFQxMDoxMDoxMCswMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3YzY4ZmI3Yy1kMDI2LTRiNGEtOWRkZC1mYWYzNmExZGMwYWIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N2M2OGZiN2MtZDAyNi00YjRhLTlkZGQtZmFmMzZhMWRjMGFiIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6N2M2OGZiN2MtZDAyNi00YjRhLTlkZGQtZmFmMzZhMWRjMGFiIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3YzY4ZmI3Yy1kMDI2LTRiNGEtOWRkZC1mYWYzNmExZGMwYWIiIHN0RXZ0OndoZW49IjIwMjMtMDMtMjBUMTA6MDg6MjUrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7LK7UAAAAgSURBVHja7cEBAQAAAICQ/q/uCAoAAAAAAAAAAABcDStPAAGLJ8wFAAAAAElFTkSuQmCC';
       applicantPhoto = await imageToBase64('/images/user.png');
        
        if (!applicantPhoto) {
          applicantPhoto = await imageToBase64('/public/images/user.png');
        }
        
        if (!applicantPhoto) {
          applicantPhoto = await imageToBase64('/images/applicant-photo.jpg');
        }
        
        // If all attempts fail, use an embedded SVG data URL as fallback
        if (!applicantPhoto) {
          applicantPhoto = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjUwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMzAiIHk9IjEzMCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSI3MCIgcng9IjIwIiByeT0iMjAiIGZpbGw9IiNlMGUwZTAiLz48dGV4dCB4PSIxMDAiIHk9IjE4MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+VXNlciBQaG90bzwvdGV4dD48L3N2Zz4=';
        } else {
        }
        
        setImages({
          coatOfArms: coatOfArmsImage,
          logo: logoImage,
          applicantPhoto: applicantPhoto
        });
      } catch (error) {
      }
    };
    
    loadImages();
  }, []);

  // Prepare form data for PDF generation using the same data format as displayed on the declaration page
  const migrantFormData: MigrantFormData = {
        applicationId: applicationId,
        
        // Basic Information - use uppercase format as shown in declaration page
        firstName: (applicationData?.ApplicationDetails?.[0]?.firstName || formData.firstName || '').toUpperCase(),
        middleName: (applicationData?.ApplicationDetails?.[0]?.middleName || formData.middleName || '').toUpperCase(),
        lastName: (applicationData?.ApplicationDetails?.[0]?.lastName || formData.lastName || '').toUpperCase(),
        otherName: (applicationData?.ApplicationDetails?.[0]?.otherName || formData.otherName || '').toUpperCase(),
        maritalStatus: (applicationData?.ApplicationDetails?.[0]?.maritalStatus || formData.maritalStatus || '').toUpperCase(),
        dateOfBirth: applicationData?.ApplicationDetails?.[0]?.dateOfBirth ? 
          new Date(applicationData.ApplicationDetails[0].dateOfBirth) : 
          (formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined),
        gender: (applicationData?.ApplicationDetails?.[0]?.gender || formData.gender || '').toUpperCase(),
        mobileNumber: (applicationData?.ApplicationDetails?.[0]?.mobileNumber || formData.mobileNumber || '').toUpperCase(),
        occupationType: (applicationData?.ApplicationDetails?.[0]?.occupationType || formData.occupationType || '').toUpperCase(),
        occupation: (applicationData?.ApplicationDetails?.[0]?.occupationDetail || formData.employmentStatus || '').toUpperCase(),
        
        // Residence Information
        countryOfResidence: (applicationData?.ApplicationDetails?.[0]?.countryOfResidence || formData.countryOfResidence || '').toUpperCase(),
        region: (applicationData?.ApplicationDetails?.[0]?.regionOfBirth || formData.region || '').toUpperCase(),
        district: (applicationData?.ApplicationDetails?.[0]?.districtOfResidence || formData.district || '').toUpperCase(),
        street: (applicationData?.ApplicationDetails?.[0]?.streetOfResidence || formData.street || '').toUpperCase(),
        permanentAddress: (applicationData?.ApplicationDetails?.[0]?.permanentAddressOrigin || formData.permanentAddressOrigin || 'SAWA NA ANWANI YA SASA').toUpperCase(),
        dateOfEntry: applicationData?.ApplicationDetails?.[0]?.dateOfEntryTanzania ? 
          new Date(applicationData.ApplicationDetails[0].dateOfEntryTanzania) : 
          (formData.dateOfEntry ? new Date(formData.dateOfEntry) : undefined),
        
        // Parents Information
        fatherName: (applicationData?.ApplicationDetails?.[0]?.fatherFullName || formData.fatherName || '').toUpperCase(),
        fatherDateOfBirth: applicationData?.ApplicationDetails?.[0]?.fatherDateOfBirth ? 
          new Date(applicationData.ApplicationDetails[0].fatherDateOfBirth) : 
          (formData.fatherDateOfBirth ? new Date(formData.fatherDateOfBirth) : undefined),
        fatherCountryOfBirth: (applicationData?.ApplicationDetails?.[0]?.fatherCountryOfBirth || formData.fatherCountryOfBirth || '').toUpperCase(),
        fatherRegion: (applicationData?.ApplicationDetails?.[0]?.fatherRegionOfBirth || formData.fatherRegionOfBirth || '').toUpperCase(),
        fatherNationality: (applicationData?.ApplicationDetails?.[0]?.fatherNationality || '').toUpperCase(),
        fatherCountryOfResidence: (applicationData?.ApplicationDetails?.[0]?.fatherCountryOfResidence || '').toUpperCase(),
        
        motherName: (applicationData?.ApplicationDetails?.[0]?.motherFullName || formData.motherName || '').toUpperCase(),
        motherDateOfBirth: applicationData?.ApplicationDetails?.[0]?.motherDateOfBirth ? 
          new Date(applicationData.ApplicationDetails[0].motherDateOfBirth) : 
          (formData.motherDateOfBirth ? new Date(formData.motherDateOfBirth) : undefined),
        motherCountryOfBirth: (applicationData?.ApplicationDetails?.[0]?.motherCountryOfBirth || formData.motherCountryOfBirth || '').toUpperCase(),
        motherRegionOfBirth: (applicationData?.ApplicationDetails?.[0]?.motherRegionOfBirth || formData.motherRegionOfBirth || '').toUpperCase(),
        motherNationality: (applicationData?.ApplicationDetails?.[0]?.motherNationality || '').toUpperCase(),
        motherCountryOfResidence: (applicationData?.ApplicationDetails?.[0]?.motherCountryOfResidence || '').toUpperCase(),
        
        // Additional fields from API data
        nationality: (applicationData?.ApplicationDetails?.[0]?.nationality || '').toUpperCase(),
        countryOfBirth: (applicationData?.ApplicationDetails?.[0]?.countryOfBirth || '').toUpperCase(),
        placeOfBirth: (applicationData?.ApplicationDetails?.[0]?.placeOfBirth || '').toUpperCase(),
        passportNumber: (applicationData?.ApplicationDetails?.[0]?.passportNumber || formData.previousPassNumber || '').toUpperCase(),
        passportIssueDate: applicationData?.ApplicationDetails?.[0]?.passportIssueDate ? 
          new Date(applicationData.ApplicationDetails[0].passportIssueDate) : undefined,
        passportExpiryDate: applicationData?.ApplicationDetails?.[0]?.passportExpiryDate ? 
          new Date(applicationData.ApplicationDetails[0].passportExpiryDate) : undefined,
        
        // Include dependants data with uppercase formatting and more complete information
        dependants: applicationData?.applicationdependants ? 
          applicationData.applicationdependants.map((dep: any) => ({
            ...dep,
            dependantFullName: dep.dependantFullName ? dep.dependantFullName.toUpperCase() : '',
            dependantGender: dep.dependantGender ? dep.dependantGender.toUpperCase() : '',
            dependantNationality: dep.dependantNationality ? dep.dependantNationality.toUpperCase() : '',
            documentNumber: dep.documentNumber ? dep.documentNumber.toUpperCase() : '',
            // Format dates properly
            issueDate: dep.issueDate ? new Date(dep.issueDate) : undefined,
            expireDate: dep.expireDate ? new Date(dep.expireDate) : undefined,
          })) : 
          formData.dependants ? formData.dependants.map((dep: any) => ({
            dependantFullName: dep.name ? dep.name.toUpperCase() : '',
            dependantRelationType: dep.relationship,
            dependantGender: dep.gender ? dep.gender.toUpperCase() : '',
            dependantNationality: dep.nationality ? dep.nationality.toUpperCase() : '',
            documentNumber: dep.passportNumber ? dep.passportNumber.toUpperCase() : '',
            expireDate: dep.passportExpiryDate instanceof Date ? dep.passportExpiryDate : undefined,
            issueDate: dep.passportIssuedDate instanceof Date ? dep.passportIssuedDate : 
                      (dep.dateOfBirth instanceof Date ? dep.dateOfBirth : undefined)
          })) : [],
        
        // Include attachments data
        attachments: applicationData?.applicationAttachment || [],
        
        // Include submission date
        submissionDate: submissionDate
      };
      
  // Handle PDF download
  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      // Check if jsPDF is loaded
      if (!jsPDF) {
        alert('PDF generator is loading. Please try again in a moment.');
        setIsLoading(false);
        return;
      }

      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Check if we have any images loaded
      const hasImages = !!(images.coatOfArms || images.logo || images.applicantPhoto);
      if (!hasImages) {
      }
      
      // Generate the PDF using our component
      await generateMigrantFormPDF(
        doc, 
        migrantFormData,
        applicantPhoto || images.applicantPhoto || '' // Use real API photo first, then fallback
      );
      
      // Save the PDF
      doc.save(`migrant-application-${applicationId}.pdf`);
      
    } catch (error) {
      alert('There was an error generating the PDF. Please try again.');
    } finally {
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
      applicationId={applicationId || '---'}
      currentStep="complete"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Status Header - Shows different content based on submission status */}
        <div className="text-center space-y-6">
          {/* {submissionStatus === 'loading' && (
            <>
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <div className="h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Inasubiri Uthibitisho...</h2>
                <p className="text-gray-600 mt-2">
                  Tunashughulikia maombi yako, tafadhali subiri...
                </p>
              </div>
            </>
          )} */}
          
          {/* {submissionStatus === 'success' && ( */}
            <>
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Hongera! Maombi Yako Yamefanikiwa</h2>
                {/* <p className="text-gray-600 mt-2">
                  {submissionMessage || 'Maombi yako yamewasilishwa kwa mafanikio na yatashughulikiwa hivi karibuni.'}
                </p> */}
              </div>
            </>
          {/* )} */}
          
          {/* {submissionStatus === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertTriangle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Kuna Tatizo Limetokea</h2>
                <p className="text-red-600 mt-2">
                  {submissionMessage || 'Kumekuwa na hitilafu wakati wa kuwasilisha maombi yako. Tafadhali jaribu tena.'}
                </p>
              </div>
            </>
          )} */}
        </div>

        {/* Application Details Card */}
        {/* <Card className="border border-gray-200 shadow-sm">
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
                  <span className="font-medium text-gray-800 uppercase">
                    {applicationData?.ApplicationDetails?.[0]?.firstName || formData.firstName || ''} {applicationData?.ApplicationDetails?.[0]?.middleName || formData.middleName || ''} {applicationData?.ApplicationDetails?.[0]?.lastName || formData.lastName || ''}
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
        </Card> */}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 border-t border-gray-200 pt-4">
          {/* Preview Form Button */}
          <PDFPreview 
            formData={migrantFormData}
            onDownloadPDF={handleDownloadPDF}
            photoUrl={applicantPhoto || images.applicantPhoto || ''}
          />
          
          {/* Download PDF Button */}
          <Button
            onClick={handleDownloadPDF}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded flex items-center shadow-md transition-all duration-300 hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Inaandaa Fomu...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Pakua Fomu ya Maombi
              </>
            )}
          </Button>
          
          {/* Home Button */}
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

export default function ApplicationCompletePage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4 text-center">Loading...</div>}>
      <ApplicationCompleteContent />
    </Suspense>
  );
}
