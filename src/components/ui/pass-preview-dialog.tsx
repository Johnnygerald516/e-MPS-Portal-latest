"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import PassPreview from "@/components/ui/pass-preview";

interface PassPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string | null;
  refreshApplications?: () => void; // Optional function to refresh applications data
}

interface PassPreviewData {
  id: string;
  fullName: string;
  nationality: string;
  passportNo: string;
  paymentDate: string;
  controlNo: string;
  physicalAddress: string;
  region: string;
  email?: string;
  employerName?: string;
  employerAddress?: string;
  contactAddress?: string;
  approvedDate: string;
  photo?: string;
  signature?: string;
  phoneNo?: string;
  dateOfBirth?: string;
  gender?: string;
  appStage?: number;
  ResidenceWardName?: string;
  ResidenceDistrictName?: string;
  ResidenceRegionName?: string;
  dependants?: {
    name: string;
    dependantFullName?: string;
    relationship: string;
    dependantRelationType?: string;
    relationType?: string;
    age?: string;
    dateOfBirth?: string;
    expireDate?: string;
    nationality?: string;
    dependantNationality?: string;
    documentType?: string;
    documentNo?: string;
    issuedCountry?: string;
  }[];
}

export function PassPreviewDialog({
  open,
  onOpenChange,
  applicationId,
  refreshApplications
}: PassPreviewDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passData, setPassData] = useState<PassPreviewData | null>(null);

  // Fetch pass preview data when dialog opens
  useEffect(() => {
    if (open && applicationId) {
      console.log(`[PassPreviewDialog] Opening dialog for application ID: ${applicationId}`);
      fetchPassPreviewData();
    }
  }, [open, applicationId]);

  const fetchPassPreviewData = async () => {
    if (!applicationId) {
      console.error('[PassPreviewDialog] No applicationId provided');
      toast({
        title: "Error",
        description: "No application ID provided",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real application, you would make an API call here
      // For now, we'll create mock data based on the applicationId
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock pass data
      const mockData: PassPreviewData = {
        id: applicationId,
        fullName: "John Doe Smith",
        nationality: "Tanzania",
        passportNo: `PP-${applicationId.slice(-4)}`,
        paymentDate: new Date().toISOString(),
        controlNo: `CTRL-${applicationId}`,
        physicalAddress: "123 Main Street, Dar es Salaam",
        region: "Dar es Salaam",
        email: "john.doe@example.com",
        employerName: "ABC Company Ltd",
        employerAddress: "456 Business Avenue, Dar es Salaam",
        contactAddress: "+255 712 345 678",
        approvedDate: new Date().toISOString(),
        phoneNo: "+255 712 345 678",
        dateOfBirth: "1985-05-15",
        gender: "Male",
        appStage: 170,
        ResidenceWardName: "Kinondoni",
        ResidenceDistrictName: "Kinondoni",
        ResidenceRegionName: "Dar es Salaam",
        dependants: [
          {
            name: "Jane Doe",
            relationship: "Spouse",
            age: "35",
            dateOfBirth: "1990-03-20",
            nationality: "Tanzania",
            documentNo: `DEP-${applicationId}-1`
          },
          {
            name: "James Doe",
            relationship: "Child",
            age: "10",
            dateOfBirth: "2015-07-12",
            nationality: "Tanzania",
            documentNo: `DEP-${applicationId}-2`
          }
        ]
      };
      
      setPassData(mockData);
    } catch (error) {
      let errorMessage = "Failed to fetch pass preview data.";
      
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
        console.error("[PassPreviewDialog] Error details:", {
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error("[PassPreviewDialog] Unknown error type:", typeof error);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Close the dialog after a delay if there's an error
      setTimeout(() => {
        onOpenChange(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent  className="w-full max-w-[1200px] max-h-[98vh] overflow-hidden p-4">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="text-xl">Migrant Pass Preview</DialogTitle>
          <DialogDescription className="text-sm">
            Preview the migrant pass before printing
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading pass preview...</p>
            </div>
          </div>
        ) : passData ? (
          <div className="p-2 overflow-y-auto max-h-[calc(98vh-140px)]" style={{ scrollbarWidth: 'thin' }}>
            <div className="w-full">
              <PassPreview 
                applicationData={passData}
                onClose={() => {
                  // Close the dialog and refresh the table
                  onOpenChange(false);
                  // Call refreshApplications if provided
                  if (refreshApplications) {
                    refreshApplications();
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <p className="text-sm text-muted-foreground">No pass preview data available</p>
          </div>
        )}

        <DialogFooter className="p-3 border-t mt-2">
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
