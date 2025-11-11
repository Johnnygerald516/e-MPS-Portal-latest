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
        console.log('Fetching application data for ID:', applicationId);
        const response = await fetch(`/api/applications/${applicationId}`);
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
          return;
        }
        
        const data = await response.json();
        console.log('API response received:', data);
        
        if (data.ackCode === 1 && data.jsonResult) {
          console.log('Setting application data:', data.jsonResult);
          setApplicationData(data.jsonResult);
          
          // Handle applicant photo - improved logic with better error handling
          if (data.jsonResult.applicantPhoto && Array.isArray(data.jsonResult.applicantPhoto) && 
              data.jsonResult.applicantPhoto.length > 0) {
            
            console.log('Found applicant photo data:', data.jsonResult.applicantPhoto[0]);
            const photoItem = data.jsonResult.applicantPhoto[0];
            
            // Check for attachmentType or attachmentData fields
            const photoData = photoItem.attachmentType || photoItem.attachmentData || photoItem.base64Data;
            
            if (photoData && typeof photoData === 'string') {
              if (photoData.startsWith('data:')) {
                console.log('Setting photo from data URL');
                setApplicantPhoto(photoData);
              } else {
                console.log('Setting photo from base64 string');
                const photoUrl = `data:image/jpeg;base64,${photoData}`;
                setApplicantPhoto(photoUrl);
              }
            } else {
              console.warn('Photo data not found or invalid format');
            }
          } else {
            console.log('No applicant photo found in API response');
          }
        } else {
          console.error('Invalid API response format or ackCode != 1:', data);
        }
      } catch (error) {
        console.error('Error fetching application data:', error);
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

  // Helper function to safely convert string to uppercase
  const safeToUpperCase = (value: any): string => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value || '';
  };

  // Helper function to safely parse date
  const safeParseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? undefined : date;
    } catch (e) {
      console.error('Error parsing date:', dateValue, e);
      return undefined;
    }
  };

  // Log the raw application data for debugging
  useEffect(() => {
    if (applicationData) {
      console.log('Application data structure:', Object.keys(applicationData));
      if (applicationData.ApplicationDetails && applicationData.ApplicationDetails.length > 0) {
        console.log('ApplicationDetails[0] fields:', Object.keys(applicationData.ApplicationDetails[0]));
      }
      if (applicationData.applicationdependants) {
        console.log('applicationdependants length:', applicationData.applicationdependants.length);
      }
    }
  }, [applicationData]);

  // Prepare form data for PDF generation with improved error handling
  const migrantFormData: MigrantFormData = {
    applicationId: applicationId,
    
    // Basic Information - use uppercase format with safe conversion
    firstName: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.firstName || formData.firstName),
    middleName: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.middleName || formData.middleName),
    lastName: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.lastName || formData.lastName),
    otherName: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.otherName || formData.otherName),
    maritalStatus: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.maritalStatus || formData.maritalStatus),
    dateOfBirth: safeParseDate(applicationData?.ApplicationDetails?.[0]?.dateOfBirth || formData.dateOfBirth),
    gender: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.gender || formData.gender),
    mobileNumber: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.mobileNumber || applicationData?.ApplicationDetails?.[0]?.phoneNumber || formData.mobileNumber),
    occupationType: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.occupationType || formData.occupationType),
    occupation: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.occupationDetail || applicationData?.ApplicationDetails?.[0]?.occupation || formData.employmentStatus),
    
    // Residence Information - check multiple possible field names
    countryOfResidence: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.countryOfResidence || applicationData?.ApplicationDetails?.[0]?.residenceCountry || formData.countryOfResidence),
    region: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.regionOfBirth || applicationData?.ApplicationDetails?.[0]?.regionOfResidence || applicationData?.ApplicationDetails?.[0]?.region || formData.region),
    district: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.districtOfResidence || applicationData?.ApplicationDetails?.[0]?.district || formData.district),
    street: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.streetOfResidence || applicationData?.ApplicationDetails?.[0]?.street || formData.street),
    permanentAddress: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.permanentAddressOrigin || applicationData?.ApplicationDetails?.[0]?.permanentAddress || formData.permanentAddressOrigin || 'SAWA NA ANWANI YA SASA'),
    dateOfEntry: safeParseDate(applicationData?.ApplicationDetails?.[0]?.dateOfEntryTanzania || applicationData?.ApplicationDetails?.[0]?.dateOfEntry || formData.dateOfEntry),
    
    // Parents Information - check multiple possible field names
    fatherName: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.fatherFullName || applicationData?.ApplicationDetails?.[0]?.fatherName || formData.fatherName),
    fatherDateOfBirth: safeParseDate(applicationData?.ApplicationDetails?.[0]?.fatherDateOfBirth || formData.fatherDateOfBirth),
    fatherCountryOfBirth: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.fatherCountryOfBirth || formData.fatherCountryOfBirth),
    fatherRegion: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.fatherRegionOfBirth || applicationData?.ApplicationDetails?.[0]?.fatherRegion || formData.fatherRegionOfBirth),
    fatherNationality: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.fatherNationality || formData.fatherNationality),
    fatherCountryOfResidence: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.fatherCountryOfResidence || formData.fatherCountryName || ''),
    
    motherName: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.motherFullName || applicationData?.ApplicationDetails?.[0]?.motherName || formData.motherName),
    motherDateOfBirth: safeParseDate(applicationData?.ApplicationDetails?.[0]?.motherDateOfBirth || formData.motherDateOfBirth),
    motherCountryOfBirth: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.motherCountryOfBirth || formData.motherCountryOfBirth),
    motherRegionOfBirth: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.motherRegionOfBirth || applicationData?.ApplicationDetails?.[0]?.motherRegion || formData.motherRegionOfBirth),
    motherNationality: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.motherNationality || formData.motherNationality),
    motherCountryOfResidence: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.motherCountryOfResidence || formData.motherCountryName || ''),
    
    // Additional fields from API data
    nationality: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.nationality || formData.nationality),
    countryOfBirth: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.countryOfBirth || formData.countryOfBirth),
    placeOfBirth: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.placeOfBirth || ''),  // formData doesn't have placeOfBirth property
    passportNumber: safeToUpperCase(applicationData?.ApplicationDetails?.[0]?.passportNumber || formData.previousPassNumber),
    passportIssueDate: safeParseDate(applicationData?.ApplicationDetails?.[0]?.passportIssueDate),
    passportExpiryDate: safeParseDate(applicationData?.ApplicationDetails?.[0]?.passportExpiryDate),
    
    // Handle dependants data with improved error handling
    dependants: applicationData?.applicationdependants ? 
      applicationData.applicationdependants.map((dep: any) => {
        try {
          return {
            dependantFullName: safeToUpperCase(dep.dependantFullName || dep.fullName || dep.name),
            dependantRelationType: safeToUpperCase(dep.dependantRelationType || dep.relationType || dep.relationship),
            dependantGender: safeToUpperCase(dep.dependantGender || dep.gender),
            dependantNationality: safeToUpperCase(dep.dependantNationality || dep.nationality),
            documentNumber: safeToUpperCase(dep.documentNumber || dep.passportNumber || dep.documentId),
            issueDate: safeParseDate(dep.issueDate || dep.documentIssueDate || dep.passportIssuedDate),
            expireDate: safeParseDate(dep.expireDate || dep.documentExpiryDate || dep.passportExpiryDate),
          };
        } catch (e) {
          console.error('Error processing dependant:', dep, e);
          return {
            dependantFullName: 'ERROR PROCESSING DEPENDANT',
            dependantRelationType: '',
            dependantGender: '',
            dependantNationality: '',
            documentNumber: '',
          };
        }
      }) : 
      formData.dependants ? formData.dependants.map((dep: any) => {
        try {
          return {
            dependantFullName: safeToUpperCase(dep.name),
            dependantRelationType: safeToUpperCase(dep.relationship),
            dependantGender: safeToUpperCase(dep.gender),
            dependantNationality: safeToUpperCase(dep.nationality),
            documentNumber: safeToUpperCase(dep.passportNumber),
            expireDate: safeParseDate(dep.passportExpiryDate),
            issueDate: safeParseDate(dep.passportIssuedDate || dep.dateOfBirth),
          };
        } catch (e) {
          console.error('Error processing dependant from form data:', dep, e);
          return {
            dependantFullName: 'ERROR PROCESSING DEPENDANT',
            dependantRelationType: '',
            dependantGender: '',
            dependantNationality: '',
            documentNumber: '',
          };
        }
      }) : [],
    
    // Include attachments data
    attachments: applicationData?.applicationAttachment || [],
    
    // Include submission date
    submissionDate: submissionDate
  };
  
  // Log the prepared form data for debugging
  useEffect(() => {
    console.log('Prepared migrantFormData:', migrantFormData);
  }, [migrantFormData]);
      
  // Handle PDF download
  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      console.log('Starting PDF download with application ID:', applicationId);
      
      // Check if jsPDF is loaded
      if (!jsPDF) {
        console.error('jsPDF not loaded yet');
        alert('PDF generator is loading. Please try again in a moment.');
        setIsLoading(false);
        return;
      }

      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Check if we have any images loaded
      const hasImages = !!(images.coatOfArms || images.logo || images.applicantPhoto);
      if (!hasImages) {
        console.warn('No images loaded for PDF generation');
      }
      
      // Check if we have application data
      if (!applicationData && !formData.firstName) {
        console.warn('No application data available for PDF generation');
      }
      
      // Log what photo source we're using
      if (applicantPhoto) {
        console.log('Using API photo for PDF');
      } else if (images.applicantPhoto) {
        console.log('Using fallback photo for PDF');
      } else {
        console.log('No photo available for PDF');
      }
      
      // Generate the PDF using our component
      await generateMigrantFormPDF(
        doc, 
        migrantFormData,
        applicantPhoto || images.applicantPhoto || '' // Use real API photo first, then fallback
      );
      
      // Save the PDF
      doc.save(`migrant-application-${applicationId}.pdf`);
      console.log('PDF saved successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    // localStorage.clear();
    sessionStorage.clear();
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
