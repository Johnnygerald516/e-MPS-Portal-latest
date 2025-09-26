"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PassPreview from "./pass-preview";

interface ApplicationData {
  id: string;
  fullName: string;
  nationality: string;
  passportNo: string;
  paymentDate: string;
  [key: string]: any;
}

interface PassModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: ApplicationData;
}

export function PassModal({ isOpen, onClose, applicationData }: PassModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Migrant Pass Preview</DialogTitle>
        </DialogHeader>
        <PassPreview applicationData={applicationData} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
