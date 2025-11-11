"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Trash2, CheckCircle, XCircle, FileText, Clock, AlertCircle, Image as ImageIcon, Eye } from "lucide-react";
import { documentsEndpoints } from '@/lib/api';
import { useCustomToast } from "@/hooks/use-custom-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { fileToBase64 as convertFileToBase64 } from "@/lib/utils/base64";

interface DocumentsTableProps {
  applicationId: string;
  onNextStageAvailable?: (nextStageId: string) => void;
  onDocumentsStatusChange?: (documents: any[]) => void;
}

interface AttachmentType {
  AttachmentTypeID: number;
  AttachmentName: string;
  Viambatanisho: string;
}

interface DocumentStatus {
  id: number;
  status: 'pending' | 'uploaded' | 'rejected' | 'approved';
  file?: File;
  documentId?: string;
  fileUrl?: string;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({ applicationId, onNextStageAvailable, onDocumentsStatusChange }) => {
  const router = useRouter();
  const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentStatuses, setDocumentStatuses] = useState<DocumentStatus[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);
  const [nextStageId, setNextStageId] = useState<string | null>(null);
  const { showSuccess, showError } = useCustomToast();
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);
  const [applicantPhotoUrl, setApplicantPhotoUrl] = useState<string | null>(null);
  
  // PDF preview state
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  
  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, { file: File; base64: string; url: string }>>({});

  // Prefetch attachment types for faster loading
  useEffect(() => {
    // Prefetch attachment types immediately when component is imported
    const prefetchAttachmentTypes = async () => {
      try {
        const cachedTypes = sessionStorage.getItem('attachmentTypes');
        if (!cachedTypes) {
          const response = await documentsEndpoints.fetchAttachmentTypes();
          if (response.ackCode === 1 && response.jsonResult) {
            sessionStorage.setItem('attachmentTypes', JSON.stringify(response.jsonResult));
          }
        }
      } catch (error) {
      }
    };
    
    prefetchAttachmentTypes();
  }, []);

  // Fetch data on component mount with optimized loading
  useEffect(() => {
    // Use a cached version of attachment types if available
    const cachedTypes = sessionStorage.getItem('attachmentTypes');
    let attachmentTypesLoaded = false;
    
    // Function to initialize document statuses from attachment types
    const initializeDocumentStatuses = (types: AttachmentType[]) => {
      // Try to load saved document statuses from localStorage first
      if (applicationId) {
        try {
          const savedStatusesJson = localStorage.getItem(`document_statuses_${applicationId}`);
          if (savedStatusesJson) {
            const savedStatuses = JSON.parse(savedStatusesJson);
            const initialStatuses = types.map(type => {
              const savedStatus = savedStatuses.find((s: any) => s.id === type.AttachmentTypeID);
              
              if (savedStatus) {
                return {
                  id: type.AttachmentTypeID,
                  status: savedStatus.status as 'pending' | 'uploaded' | 'rejected' | 'approved',
                  documentId: savedStatus.documentId,
                  fileUrl: savedStatus.fileUrl
                };
              } else {
                // No saved status, use default
                return {
                  id: type.AttachmentTypeID,
                  status: 'pending' as const
                };
              }
            });
            
            setDocumentStatuses(initialStatuses);
            return initialStatuses;
          }
        } catch (error) {
        }
      }
      
      // Fall back to default initialization if no saved statuses
      const initialStatuses = types.map(type => ({
        id: type.AttachmentTypeID,
        status: 'pending' as const
      }));
      setDocumentStatuses(initialStatuses);
      return initialStatuses;
    };
    
    // Load attachment types from cache if available (should be fast)
    if (cachedTypes) {
      try {
        const parsedTypes = JSON.parse(cachedTypes);
        setAttachmentTypes(parsedTypes);
        initializeDocumentStatuses(parsedTypes);
        attachmentTypesLoaded = true;
      } catch (e) {
      }
    }
    
    // Optimized data fetching with priority loading
    const fetchData = async () => {
      // Start with a minimal loading state
      if (!attachmentTypesLoaded) {
        setLoading(true);
      }
      
      try {
        // Step 1: Fast path - load attachment types if not already loaded
        let attachmentTypesResult = [];
        if (!attachmentTypesLoaded) {
          try {
            const response = await documentsEndpoints.fetchAttachmentTypes();
            if (response.ackCode === 1 && response.jsonResult) {
              attachmentTypesResult = response.jsonResult;
              setAttachmentTypes(attachmentTypesResult);
              initializeDocumentStatuses(attachmentTypesResult);
              sessionStorage.setItem('attachmentTypes', JSON.stringify(attachmentTypesResult));
            } else {
              throw new Error('Failed to fetch attachment types');
            }
          } catch (error) {
            setAttachmentTypes([]);
            initializeDocumentStatuses([]);
            attachmentTypesResult = [];
          }
        }
        
        // Step 2: Fetch existing documents if applicationId is provided
        // This can happen in parallel with rendering the initial UI
        if (applicationId) {
          try {
            // Use a cached version if available (for quick navigation back and forth)
            const cachedDocs = sessionStorage.getItem(`documents_${applicationId}`);
            if (cachedDocs) {
              const parsedDocs = JSON.parse(cachedDocs);
              processExistingDocuments(parsedDocs);
            }
            
            // Always fetch fresh data directly, but don't block rendering
            try {
              // Fetch documents directly from the API
              const apiUrl = process.env.NEXT_PUBLIC_API_URL;
              if (apiUrl) {
                const externalApiUrl = `${apiUrl}/applications/${applicationId}/documents`;
                const response = await fetch(externalApiUrl, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (response.ok) {
                  const responseData = await response.json();
                  
                  if (responseData.ackCode === 1 && responseData.jsonResult) {
                    const existingDocs = responseData.jsonResult.documents || responseData.jsonResult;
                    
                    // Only cache and process if we have valid data
                    if (existingDocs && (Array.isArray(existingDocs) || typeof existingDocs === 'object')) {
                      // Cache the documents for this application
                      sessionStorage.setItem(`documents_${applicationId}`, JSON.stringify(existingDocs));
                      
                      // Process the documents
                      processExistingDocuments(existingDocs);
                    } 
                  }
                }
              }
            } catch (error) {
             }
          }
           catch (error) {
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to process existing documents
    const processExistingDocuments = (existingDocs: any) => {
      if (Array.isArray(existingDocs)) {
        // Process existing documents
        setDocumentStatuses(prev => 
          prev.map(status => {
            const existingDoc = existingDocs.find(
              (doc: any) => doc.attachmentTypeId === status.id || 
                            doc.attachmentTypeId === status.id.toString()
            );
            
            if (existingDoc) {
              return {
                ...status,
                status: existingDoc.status || 'uploaded',
                documentId: existingDoc.documentId || existingDoc.id,
                fileUrl: existingDoc.fileUrl || existingDoc.url
              };
            }
            return status;
          })
        );
        
        // Check for nextStageId
        const responseWithNextStage = existingDocs.find((doc: any) => doc.nextStageId);
        if (responseWithNextStage?.nextStageId) {
          setNextStageId(responseWithNextStage.nextStageId);
          if (onNextStageAvailable) {
            onNextStageAvailable(responseWithNextStage.nextStageId);
          }
        }
        
        // Set applicant photo URL if available
        const applicantPhoto = existingDocs.find(
          (doc: any) => doc.attachmentTypeId === 1 || doc.attachmentTypeId === '1'
        );
        if (applicantPhoto && (applicantPhoto.fileUrl || applicantPhoto.url)) {
          setApplicantPhotoUrl(applicantPhoto.fileUrl || applicantPhoto.url);
        }
      } else {
       }
    };
    
    fetchData();
  }, [applicationId, onNextStageAvailable]);

  // Check if all required documents are uploaded
  const areAllDocumentsUploaded = () => {
    const allUploaded = documentStatuses.every(doc => doc.status === 'uploaded' || doc.status === 'approved');
    return allUploaded;
  };
  
  // Use a ref to track previous document statuses for comparison
  const prevDocumentStatusesRef = useRef<typeof documentStatuses>([]);
  
  // Effect to notify parent component when document statuses change
  useEffect(() => {
    // Skip the first render and only notify on actual changes
    if (documentStatuses.length > 0 && attachmentTypes.length > 0 && 
        prevDocumentStatusesRef.current.length > 0 && onDocumentsStatusChange) {
      
      // Check if document statuses have actually changed
      const hasStatusChanged = documentStatuses.some((doc, index) => {
        const prevDoc = prevDocumentStatusesRef.current[index];
        return !prevDoc || prevDoc.status !== doc.status;
      });
      
      // Only notify parent if there's an actual change
      if (hasStatusChanged) {
        // Create document objects for the parent component
        const docs = documentStatuses.map(doc => ({
          id: String(doc.id),  // Convert to string to match the expected format
          status: doc.status,
          name: attachmentTypes.find(at => at.AttachmentTypeID === doc.id)?.Viambatanisho || '',
          description: attachmentTypes.find(at => at.AttachmentTypeID === doc.id)?.AttachmentName || '',
          required: true  // Assume all documents are required
        }));
        
        // Pass the document statuses to the parent component
        onDocumentsStatusChange(docs);
      }
    }
    
    // Update the ref with current document statuses
    prevDocumentStatusesRef.current = [...documentStatuses];
  }, [documentStatuses, attachmentTypes, onDocumentsStatusChange]);
  
  // Handle Save and Continue button click
  const handleSaveAndContinue = async () => {
    if (!applicationId || !nextStageId) {
      showError({ description: "Missing application ID or next stage ID" });
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the endpoint to proceed to the next stage
      const response = await fetch(`/api/applications/${applicationId}/attachments/${nextStageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        showError({ description: `Error: ${response.status} ${response.statusText}` });
        return;
      }
      
      const responseData = await response.json();
      
      if (responseData.ackCode === 1) {
        showSuccess({ description: "Successfully moved to the next stage" });
        
        if (responseData.jsonResult?.redirectUrl) {
          router.push(responseData.jsonResult.redirectUrl);
        }
      } else {
        showError({ description: responseData.ackMessage || "Failed to proceed to the next stage" });
      }
    } catch (error) {
      showError({ description: `An unexpected error occurred: ${(error as Error).message}` });
    } finally {
      setLoading(false);
    }
  };

  // Open document selection dialog for uploading
  const openDocumentDialog = (attachment: AttachmentType) => {
    setSelectedAttachment(attachment);
    setSelectedFile(null);
    setFilePreview(null);
    setFileValidationError(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };
  
  // Handle preview document button click for already uploaded documents
  const handlePreviewDocument = (attachment: AttachmentType) => {
    // Find the document status for this attachment type
    const docStatus = documentStatuses.find(status => status.id === attachment.AttachmentTypeID);
    
    if (docStatus?.fileUrl) {
      // Store the selected attachment for use in the preview dialog
      setSelectedAttachment(attachment);
      
      // If we have a fileUrl, open it directly in the PDF preview dialog
      setPdfPreviewUrl(docStatus.fileUrl);
      setPdfPreviewOpen(true);
    } else {
      showError({ description: "Document preview is not available" });
    }
  };
  
  // Handle view PDF button click for uploaded files
  const handleViewPdf = (attachmentTypeId: number) => {
    const uploadedFile = uploadedFiles[attachmentTypeId];
    if (uploadedFile?.url) {
      // Find the attachment type
      const attachment = attachmentTypes.find(a => a.AttachmentTypeID === attachmentTypeId);
      if (attachment) {
        setSelectedAttachment(attachment);
      }
      
      // Open the PDF preview dialog
      setPdfPreviewUrl(uploadedFile.url);
      setPdfPreviewOpen(true);
    } else {
      showError({ description: "PDF preview is not available" });
    }
  };
  
  // Handle submit file button click
  const handleSubmitFile = async (attachmentTypeId: number) => {
    const uploadedFile = uploadedFiles[attachmentTypeId];
    if (!uploadedFile?.base64) {
      showError({ description: "Faili haipatikani kwa ajili ya kuwasilisha." });
      return;
    }
    
    try {
      setUploading(attachmentTypeId);
      
      // Prepare payload exactly as required
      const payload = {
        attachmentTypeId: attachmentTypeId,
        attachment: uploadedFile.base64
      };
      
      // Send to the attachments endpoint
      const response = await fetch(`/api/applications/${applicationId}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = {
          ackCode: 0,
          ackMessage: `Invalid response format: ${responseText.substring(0, 100)}`,
          jsonResult: null
        };
      }
      
      if (!response.ok || responseData.ackCode === 0) {
        showError({ 
          description: responseData.ackMessage || `Error ${response.status}: ${response.statusText}` 
        });
        return;
      }
      
      // Process successful response
      if (responseData.ackCode === 1) {
        // Update document status in the table
        setDocumentStatuses(prev => {
          const updatedStatuses = prev.map(status => 
            status.id === attachmentTypeId 
              ? { 
                  ...status, 
                  status: 'uploaded' as const,
                  file: uploadedFile.file,
                  documentId: responseData.jsonResult?.applicationID || status.documentId,
                  fileUrl: uploadedFile.url
                } 
              : status
          );
          
          // Save document statuses to localStorage to persist across page refreshes
          try {
            // Create a simplified version of the statuses for storage (without file objects)
            const storableStatuses = updatedStatuses.map(status => ({
              id: status.id,
              status: status.status,
              documentId: status.documentId,
              fileUrl: status.fileUrl
            }));
            
            // Store in localStorage with application ID to keep separate for each application
            localStorage.setItem(`document_statuses_${applicationId}`, JSON.stringify(storableStatuses));
          
          } catch (error) {
          }
          
          // The parent component will be notified via the useEffect that watches documentStatuses
          // No need to call onDocumentsStatusChange directly here
          
          return updatedStatuses;
        });
        
       if (attachmentTypeId === 1 && uploadedFile.url) {
          setApplicantPhotoUrl(uploadedFile.url);
        }
        
        // Store nextStageId if available in the response
        if (responseData.jsonResult?.nextStageId) {
          setNextStageId(responseData.jsonResult.nextStageId);
          
          // Notify parent component if callback is provided
          if (onNextStageAvailable) {
            onNextStageAvailable(responseData.jsonResult.nextStageId);
          }
        }
        
        // Show success message with applicationID and nextStage if available
        if (responseData.jsonResult?.applicationID && responseData.jsonResult?.nextStage) {
          showSuccess({ 
            description: `Nyaraka imetumwa kwa mafanikio.` 
          });
        } else {
          showSuccess({ description: "Nyaraka imetumwa kwa mafanikio." });
        }
      } else {
        showError({ description: responseData.ackMessage || "Imeshindikana kuwasilisha nyaraka" });
      }
    } catch (error) {
      showError({ description: `An unexpected error occurred: ${(error as Error).message}` });
    } finally {
      setUploading(null);
    }
  };
  
  // Handle remove uploaded file button click
  const handleRemoveUploadedFile = (attachmentTypeId: number) => {
    // Remove from uploadedFiles
    const newUploadedFiles = { ...uploadedFiles };
    
    // Release the object URL to prevent memory leaks
    if (newUploadedFiles[attachmentTypeId]?.url) {
      URL.revokeObjectURL(newUploadedFiles[attachmentTypeId].url);
    }
    
    delete newUploadedFiles[attachmentTypeId];
    setUploadedFiles(newUploadedFiles);
    
    // Update document status in the table
    setDocumentStatuses(prev => 
      prev.map(status => 
        status.id === attachmentTypeId 
          ? { ...status, status: 'pending', file: undefined } 
          : status
      )
    );
    
    showSuccess({ description: "File removed successfully" });
  };
  
  // Handle submit document button click
  const handleSubmitDocument = async (attachment: AttachmentType) => {
    // Find the document status for this attachment type
    const docStatus = documentStatuses.find(status => status.id === attachment.AttachmentTypeID);
    
    if (!docStatus?.fileUrl) {
      showError({ description: "Document is not available for submission" });
      return;
    }
    
    try {
      setUploading(attachment.AttachmentTypeID);
      
      // Here you would typically submit the document to your backend
      // For now, we'll just show a success message
      showSuccess({ description: `${attachment.AttachmentName} submitted successfully` });
      
      // Update the document status to 'approved' if needed
      setDocumentStatuses(prev => 
        prev.map(status => 
          status.id === attachment.AttachmentTypeID 
            ? { ...status, status: 'approved' } 
            : status
        )
      );
    } catch (error) {
      showError({ description: "An error occurred while submitting the document" });
    } finally {
      setUploading(null);
    }
  };
  
  // Handle direct file upload without dialog - uploads to state for preview before submission
  const handleDirectUpload = async (event: React.ChangeEvent<HTMLInputElement>, attachment: AttachmentType) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate the file based on attachment type
    const isValid = await validateFile(file, attachment.AttachmentTypeID);
    if (!isValid) return;
    
    try {
      setUploading(attachment.AttachmentTypeID);
      
      // Convert file to base64
      const base64Data = await fileToBase64(file);
      
      // Create a URL for preview based on file type
      const fileUrl = URL.createObjectURL(file);
      
      // Store the uploaded file in state
      setUploadedFiles(prev => ({
        ...prev,
        [attachment.AttachmentTypeID]: {
          file,
          base64: base64Data,
          url: fileUrl
        }
      }));
      
      // Set the selected attachment for the preview dialog
      setSelectedAttachment(attachment);
      
      // Handle preview based on file type
      if (file.type === 'application/pdf') {
        // Open the PDF preview dialog automatically
        setPdfPreviewUrl(fileUrl);
        setPdfPreviewOpen(true);
        // Show success toast for PDF upload
        showSuccess({ description: "Nyaraka imepakiwa na iko tayari kwa ukaguzi. Tafadhali kagua kabla ya kuwasilisha." });
      } else if (file.type.startsWith('image/') && attachment.AttachmentTypeID === 1) {
        // For applicant photo, set the photo URL
        setApplicantPhotoUrl(fileUrl);
        // Show success message for image upload
        showSuccess({ description: "Picha ya muombaji imepakiwa. Bonyeza 'Thibitisha' ili kuwasilisha." });
      }
      
    } catch (error) {
      showError({ description: `An unexpected error occurred: ${(error as Error).message}` });
    } finally {
      setUploading(null);
      
      // Clear the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Validate file based on attachment type
  const validateFile = (file: File, attachmentTypeId?: number): Promise<boolean> => {
    return new Promise(async (resolve) => {
      // Reset previous validation errors
      setFileValidationError(null);
      
      // Check if this is an applicant photo (usually ID 1)
      if (attachmentTypeId === 1) {
        // For applicant photo, only allow image files (PNG, JPEG, JPG)
        const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validImageTypes.includes(file.type)) {
          setFileValidationError('Picha ya muombaji lazima iwe ya aina ya PNG, JPEG, au JPG');
          showError({ description: 'Picha ya muombaji lazima iwe ya aina ya PNG, JPEG, au JPG' });
          resolve(false);
          return;
        }
        
        // Check file size (1MB = 1048576 bytes for images)
        if (file.size > 1048576) {
          setFileValidationError('Ukubwa wa picha lazima uwe chini ya au sawa na 1MB');
          showError({ description: 'Ukubwa wa picha lazima uwe chini ya au sawa na 1MB' });
          resolve(false);
          return;
        }
        
        // No need to check image dimensions or aspect ratio
        // Just validate file type and size
      } else {
        // For other documents, require PDF
        if (file.type !== 'application/pdf') {
          setFileValidationError('Nyaraka zingine lazima ziwe za aina ya PDF');
          showError({ description: 'Nyaraka zingine lazima ziwe za aina ya PDF' });
          resolve(false);
          return;
        }
        
        // Check file size (1MB = 1048576 bytes for PDFs)
        if (file.size > 1048576) {
          setFileValidationError('Ukubwa wa faili lazima uwe chini ya au sawa na 1MB');
          showError({ description: 'Ukubwa wa faili lazima uwe chini ya au sawa na 1MB' });
          resolve(false);
          return;
        }
      }
      
      // If all validations pass
      resolve(true);
    });
  };

  // Get image dimensions (width and height)
  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      // Create an HTML Image element
      const img = document.createElement('img');
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
        // Clean up the object URL to prevent memory leaks
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
        // Clean up the object URL to prevent memory leaks
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };
  
  // Use our shared utility function for file to base64 conversion
  const fileToBase64 = async (file: File): Promise<string> => {
    try {
      // Use the shared utility function
      return await convertFileToBase64(file);
    } catch (error) {
      throw error;
    }
  };
  
  // Handle file selection in dialog
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Pass the selected attachment ID to validateFile
    const isValid = await validateFile(file, selectedAttachment?.AttachmentTypeID);
    if (isValid) {
      setSelectedFile(file);
      
      // Create preview for the file
      if (file.type === 'application/pdf') {
        // Create a URL for the PDF file for preview
        const pdfUrl = URL.createObjectURL(file);
        setPdfPreviewUrl(pdfUrl);
        setFilePreview('/file.svg'); // Use a PDF icon for thumbnail
        
        // Clean up the URL when component unmounts
        return () => {
          URL.revokeObjectURL(pdfUrl);
        };
      } else if (file.type.startsWith('image/')) {
        // For image files (like applicant photo), show the actual image
        const imageUrl = URL.createObjectURL(file);
        setFilePreview(imageUrl);
        setPdfPreviewUrl(null); // Not a PDF
      }
    }
  };

  // Handle file upload from dialog
  const handleSubmit = async () => {
    if (!applicationId || !selectedAttachment || !selectedFile) {
      showError({ description: "Missing required information for upload" });
      return;
    }
    
    // Close the file selection dialog first to prevent multiple uploads
    setDialogOpen(false);

    try {
      setUploading(selectedAttachment.AttachmentTypeID);
      setUploadProgress(10);
      
      // Convert file to base64
      const base64Data = await fileToBase64(selectedFile);
      setUploadProgress(50);
      
      // Prepare payload exactly as required
      const payload = {
        attachmentTypeId: selectedAttachment.AttachmentTypeID,
        attachment: base64Data
      };
      setUploadProgress(70);
      
      // Submit directly to the attachments endpoint
      const response = await fetch(`/api/applications/${applicationId}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      setUploadProgress(90);
      
      if (!response.ok) {
        const errorText = await response.text();
       try {
          const errorData = JSON.parse(errorText);
          showError({ description: errorData.ackMessage || `Error: ${response.statusText}` });
        } catch (parseError) {
          showError({ description: `Failed to upload document (${response.status})` });
        }
        
        return; 
      }
      
      const responseData = await response.json();
      setUploadProgress(100);
      
      if (responseData.ackCode === 1) {
        // Update document status in the table
        setDocumentStatuses(prev => {
          const updatedStatuses = prev.map(status => 
            status.id === selectedAttachment.AttachmentTypeID 
              ? { 
                  ...status, 
                  status: 'uploaded' as const,
                  file: selectedFile,
                  documentId: responseData.jsonResult?.documentId || status.documentId,
                  fileUrl: responseData.jsonResult?.fileUrl || status.fileUrl
                } 
              : status
          );
          
          // The parent component will be notified via the useEffect that watches documentStatuses
          // No need to call onDocumentsStatusChange directly here
          
          return updatedStatuses;
        });
        
        // If this is an applicant photo (usually ID 1), save the URL for display
        if (selectedAttachment.AttachmentTypeID === 1 && responseData.jsonResult?.fileUrl) {
          setApplicantPhotoUrl(responseData.jsonResult.fileUrl);
          
          // Force a re-render to display the image
          setTimeout(() => {
            setApplicantPhotoUrl(prev => prev); // This triggers a re-render
          }, 100);
        }
        
        // Store nextStageId if available in the response
        if (responseData.jsonResult?.nextStageId) {
          setNextStageId(responseData.jsonResult.nextStageId);
          
          // Notify parent component if callback is provided
          if (onNextStageAvailable) {
            onNextStageAvailable(responseData.jsonResult.nextStageId);
          }
        }
        
        showSuccess({ description: "Document uploaded successfully" });
      } else {
        showError({ description: responseData.ackMessage || "Failed to upload document" });
      }
    } catch (error) {
      showError({ description: "An error occurred while uploading the document" });
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  };

  // Handle document deletion
  const handleDelete = async (attachmentTypeId: number) => {
    try {
      setUploading(attachmentTypeId);
      
      // Find the document status for this attachment type
      const docStatus = documentStatuses.find(status => status.id === attachmentTypeId);
      
      if (!docStatus || !docStatus.documentId) {
        // If no document ID is found, just update the UI status
        setDocumentStatuses(prev => {
          const updatedStatuses = prev.map(status => 
            status.id === attachmentTypeId 
              ? { ...status, status: 'pending' as const, file: undefined, fileUrl: undefined } 
              : status
          );
          
          // The parent component will be notified via the useEffect that watches documentStatuses
          // No need to call onDocumentsStatusChange directly here
          
          return updatedStatuses;
        });
        
        // If this was an applicant photo, clear the URL
        if (attachmentTypeId === 1) {
          setApplicantPhotoUrl(null);
        }
        
        showSuccess({ description: "Document removed" });
        setUploading(null);
        return;
      }
      
      const response = await documentsEndpoints.deleteDocument(docStatus.documentId);
      
      if (response.ackCode === 1) {
        // Update document status to pending
        setDocumentStatuses(prev => {
          const updatedStatuses = prev.map(status => 
            status.id === attachmentTypeId 
              ? { ...status, status: 'pending' as const, file: undefined, fileUrl: undefined } 
              : status
          );
          
          // The parent component will be notified via the useEffect that watches documentStatuses
          // No need to call onDocumentsStatusChange directly here
          
          return updatedStatuses;
        });
        
        // If this was an applicant photo, clear the URL
        if (attachmentTypeId === 1) {
          setApplicantPhotoUrl(null);
        }
        
        showSuccess({ description: "Document deleted successfully" });
      } else {
        showError({ description: response.ackMessage || "Failed to delete document" });
      }
    } catch (error) {
      showError({ description: "An error occurred while deleting the document" });
    } finally {
      setUploading(null);
    }
  };

  // Get status badge for document
  const getStatusBadge = (status: string, attachmentTypeId?: number) => {
    // Check if this document has been uploaded to state but not yet submitted
    const isPreviewed = attachmentTypeId && uploadedFiles[attachmentTypeId] ? true : false;
    
    switch (status) {
      case "pending":
        if (isPreviewed) {
          return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1"><Eye className="h-3 w-3" /> Previewed</Badge>;
        }
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "uploading":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</Badge>;
      case "uploaded":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Uploaded</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading documents...</span> 
      </div>
    );
  }

  return (
    <div className="overflow-x-auto relative">
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              JINA
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              HALI
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              KITENDO
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attachmentTypes.map((attachment, index) => {
            const documentStatus = documentStatuses.find(status => status.id === attachment.AttachmentTypeID);
            const status = documentStatus?.status || 'pending';
            
            return (
              <tr key={attachment.AttachmentTypeID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{attachment.Viambatanisho}</div>
                  {/* Special instructions for Applicant Photo */}
                  {attachment.AttachmentTypeID === 1 && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                      <p>
                        {/* <strong>Maelekezo:</strong> */}
                         Picha iwe na background nyeupe, format PNG, JPEG, JPG na ukubwa usiozidi 1MB</p>
                      {/* <p>Aina za faili zinazokubalika: PNG, JPEG, JPG (≤1MB)</p> */}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(status, attachment.AttachmentTypeID)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {status === 'uploaded' || status === 'approved' ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreviewDocument(attachment)}
                        disabled={uploading === attachment.AttachmentTypeID}
                        className="border border-blue-300 text-blue-500 hover:text-blue-600 px-3 py-1 rounded flex items-center bg-white hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Angalia Nyaraka
                      </Button>
                      {/* <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(attachment.AttachmentTypeID)}
                        disabled={uploading === attachment.AttachmentTypeID}
                        className="border border-red-600 text-red-600 hover:border-red-700 hover:text-red-700 px-3 py-1 rounded flex items-center bg-white hover:bg-red-50"
                      >
                        {uploading === attachment.AttachmentTypeID ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Ondoa Nyaraka
                      </Button> */}
                    </div>
                  ) : uploadedFiles[attachment.AttachmentTypeID] ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewPdf(attachment.AttachmentTypeID)}
                        disabled={uploading === attachment.AttachmentTypeID}
                        className="border border-blue-300 text-blue-500 hover:text-blue-600 px-3 py-1 rounded flex items-center bg-white hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                       Angalia Nyaraka
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveUploadedFile(attachment.AttachmentTypeID)}
                        disabled={uploading === attachment.AttachmentTypeID}
                        className="border border-red-600 text-red-600 hover:border-red-700 hover:text-red-700 px-3 py-1 rounded flex items-center bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id={`direct-upload-${attachment.AttachmentTypeID}`}
                        className="hidden"
                        onChange={(e) => handleDirectUpload(e, attachment)}
                        accept={attachment.AttachmentTypeID === 1 ? "image/png,image/jpeg,image/jpg" : "application/pdf"}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`direct-upload-${attachment.AttachmentTypeID}`)?.click()}
                        disabled={uploading === attachment.AttachmentTypeID}
                        className="border border-blue-300 text-blue-400 hover:text-blue-500 hover:border-blue-600 px-3 py-1 rounded flex items-center bg-white hover:bg-blue-50"
                      >
                        {uploading === attachment.AttachmentTypeID ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Ina Pakia Nyaraka...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" />
                            {attachment.AttachmentTypeID === 1 ? "Pakia" : "Pakia"}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Document Upload Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) setDialogOpen(false);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAttachment ? `Upload ${selectedAttachment.AttachmentName}` : 'Upload Document'}
            </DialogTitle>
            <DialogDescription>
              Please select a PDF file (max 1MB) to upload.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {fileValidationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {fileValidationError}
              </div>
            )}
            
            {/* Step 1: Select File */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-medium">Step 1: Select a file</h3>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition-colors">
                {filePreview ? (
                  <div className="flex flex-col items-center">
                    {filePreview === '/file.svg' ? (
                      <FileText className="w-16 h-16 text-blue-500 mb-2" />
                    ) : (
                      <div className="w-32 h-32 relative mb-2">
                        <Image src={filePreview} alt="Preview" fill className="object-contain" />
                      </div>
                    )}
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {selectedFile?.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to select a file or drag and drop</p>
                  </div>
                )}
                <input
                  type="file"
                  id="file-select"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="application/pdf"
                />
                <label htmlFor="file-select" className="w-full h-full absolute top-0 left-0 cursor-pointer">
                  <span className="sr-only">Select file</span>
                </label>
              </div>
              
              {selectedFile && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">File selected successfully</span>
                  </div>
                  
                  {selectedFile.type === 'application/pdf' && pdfPreviewUrl && (
                    <div className="flex justify-center mt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex items-center gap-2 border-blue-300 text-blue-600"
                        onClick={() => setPdfPreviewOpen(true)}
                      >
                        <Eye className="h-4 w-4" />
                        Preview PDF
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Step 2: Submit File */}
            {selectedFile && (
              <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium">Step 2: Submit file</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Ready to submit</p>
                      <p className="text-xs text-blue-600 mt-1">Click the Submit button below to send this file</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 text-right">{uploadProgress}%</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              onClick={() => setDialogOpen(false)}
              disabled={uploading !== null}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            {!selectedFile ? (
              // No file selected yet
              <Button
                type="button"
                onClick={() => document.getElementById('file-select')?.click()}
                disabled={uploading !== null}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto",
                  uploading !== null && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            ) : (
              // File selected, show upload button
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={uploading !== null}
                className={cn(
                  "bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto",
                  uploading !== null && "opacity-50 cursor-not-allowed"
                )}
              >
                {uploading !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload Document'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={pdfPreviewOpen && pdfPreviewUrl !== null} onOpenChange={(open) => {
        if (!open) setPdfPreviewOpen(false);
      }}>
        <DialogContent className="w-[90vw] h-[90vh] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {selectedAttachment ? `Preview: ${selectedAttachment.AttachmentName}` : 'Document Preview'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Tafadhali kagua nyaraka zako kwa makini kabla ya kuwasilisha.</p>
          </DialogHeader>
          {pdfPreviewUrl && (
            <div className="w-full h-full overflow-hidden">
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-[calc(90vh-120px)]"
                title="PDF Preview"
              />
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setPdfPreviewOpen(false)} 
              className="w-full sm:w-auto"
            >
              Funga 
            </Button>
            
            {/* Show Submit button only for uploaded files that haven't been submitted yet */}
            {selectedAttachment && uploadedFiles[selectedAttachment.AttachmentTypeID] && (
              <Button 
                onClick={() => {
                  if (selectedAttachment) {
                    handleSubmitFile(selectedAttachment.AttachmentTypeID);
                    setPdfPreviewOpen(false);
                  }
                }} 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                disabled={uploading !== null}
              >
                {uploading !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Inatuma...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Thibitisha na Wasilisha Nyaraka
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsTable;
