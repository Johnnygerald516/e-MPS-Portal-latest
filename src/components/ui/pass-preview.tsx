"use client";

import { Check, Loader2, Printer, User, QrCode as QrCodeIcon, Download, FileText } from "lucide-react";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { downloadPDF, generatePDF } from "@/lib/utils/pdf-generator";
import "./pass-print-styles.css";

// Import these conditionally to avoid build errors
let QRCode: any;
let useReactToPrint: any;

// Import the modules only in client-side environment
if (typeof window !== 'undefined') {
  QRCode = require('react-qr-code').default;
  useReactToPrint = require('react-to-print').useReactToPrint;
}

// Small helper component for repeated rows
interface RowProps {
  label: string;
  value: string | number | React.ReactElement;
}

const Row = ({ label, value }: RowProps) => (
  <div className="flex items-start">
    <div className="w-2/5">
      <p className="text-xs mb-0 text-[11px] leading-tight font-bold">{label}</p>
    </div>
    <div className="w-3/5">
      <p className="text-xs font-bold mb-0 text-[11px] leading-tight italic">
        {value !== undefined && value !== null ? value : "N/A"}
      </p>
    </div>
  </div>
);

interface Dependant {
  name: string;
  relationship: string;
  dateOfBirth?: string;
  expireDate?: string;
  age?: string;
  nationality?: string;
  documentType?: string;
  documentNo?: string;
  issuedCountry?: string;
}

interface ApplicationData {
  id: string;
  fullName: string;
  nationality: string;
  passportNo: string;
  paymentDate: string;
  employerName?: string;
  employerAddress?: string;
  issuedAt?: string;
  contactAddress?: string;
  region?: string;
  email?: string;
  controlNo?: string;
  physicalAddress?: string;
  phoneNo?: string;
  signature?: string;
  dependants?: Dependant[];
  appStage?: number;
  stageId?: number;
  stage?: number;
  currentStage?: number;
  workflowStage?: number;
  stageID?: number;
  ResidenceWardName?: string;
  ResidenceDistrictName?: string;
  ResidenceRegionName?: string;
  photo?: string;
  approvedDate?: string;
  purpose?: string;
  duration?: string;
  qrCode?: string;
  validUntil?: string;
  PassValidFrom?: string;
}

interface PassPreviewProps {
  applicationData: ApplicationData;
  onClose?: () => void;
}

export default function PassPreview({
  applicationData,
  onClose
}: PassPreviewProps) {
  // Create a reference to the printable content
  const printRef = useRef<HTMLDivElement>(null);
  
  const [coatOfArmsLoaded, setCoatOfArmsLoaded] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  
  // Check if there's a photo to load
  useEffect(() => {
    if (applicationData.photo) {
      setHasPhoto(true);
      console.log("[PassPreview] Photo data:", {
        photoType: typeof applicationData.photo,
        photoLength: typeof applicationData.photo === 'string' ? applicationData.photo.length : 'N/A',
        photoStartsWith: typeof applicationData.photo === 'string' ? applicationData.photo.substring(0, 50) + '...' : 'N/A'
      });
    } else {
      // No photo to load, so mark as loaded
      setPhotoLoaded(true);
    }
  }, [applicationData]);
  
  // Check when all images are loaded
  useEffect(() => {
    if (coatOfArmsLoaded && photoLoaded) {
      setImagesReady(true);
    }
  }, [coatOfArmsLoaded, photoLoaded]);
  
  // Force print after timeout even if images aren't loaded
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isPrinting) {
      // Set a timeout to force print after 3 seconds even if images aren't loaded
      timeoutId = setTimeout(() => {
        if (isPrinting && !imagesReady) {
          console.log('Forcing print after timeout');
          setImagesReady(true);
        }
      }, 3000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPrinting, imagesReady]);

  // Handle printing after images are loaded
  useEffect(() => {
    if (isPrinting && imagesReady) {
      // Actual printing logic
      if (printRef.current) {
        try {
          // Use react-to-print directly instead of opening a new window
          handlePrint();
        } catch (err) {
          console.error('Error during print:', err);
          setIsPrinting(false);
        }
      }
    }
  }, [isPrinting, imagesReady]);
  
  // Create a direct print handler using react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Migrant Pass - ${applicationData.fullName}`,
    onBeforePrint: async () => {
      console.log('Before print');
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      console.log('Print completed');
    },
    onPrintError: (error: Error | string) => {
      console.error('Print error:', error);
      setIsPrinting(false);
    },
    pageStyle: `
      @page {
        size: A5 portrait;
        margin: 0mm;
        bleed: 0;
      }
      @media print {
        html, body {
          margin: 0;
          padding: 0;
          width: 148mm;
          height: 210mm;
          overflow: hidden;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        .pass-printable-area {
          width: 148mm;
          height: 210mm;
          box-sizing: border-box;
          overflow: hidden;
          page-break-after: always;
          page-break-inside: avoid;
          display: block !important;
          transform: scale(0.96);
          transform-origin: top center;
          position: absolute;
          left: 0;
          top: 0;
        }
        body * {
          visibility: hidden;
        }
        .pass-printable-area, .pass-printable-area * {
          visibility: visible;
        }
        .pass-printable-area {
          border: none !important;
          border-width: 0 !important;
        }
      }
    `
  });

  // Print handler that checks if images are ready
  const printPass = () => {
    if (!imagesReady) {
      setIsPrinting(true);
    } else {
      handlePrint();
    }
  };

  // Download PDF handler
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    try {
      // Show loading state
      setIsPrinting(true);
      
      // Wait for images to load if needed
      if (!imagesReady) {
        await new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (imagesReady) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
          
          // Force resolve after 3 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 3000);
        });
      }
      
      // Generate and download PDF
      await downloadPDF(printRef.current, `Migrant_Pass_${applicationData.id}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-end mb-4">
        <Button
          onClick={printPass}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Pass
        </Button>
        <Button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 ml-2"
          disabled={isPrinting}
        >
          {isPrinting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="ml-2"
          >
            Close
          </Button>
        )}
      </div>
      
      <div className="relative">
        <div 
          ref={printRef}
          className="border border-gray-400 rounded-lg overflow-hidden shadow-lg print:shadow-none print:border-0 print:border-none bg-white relative pass-printable-area"
          style={{
            width: "148mm",
            height: "210mm",
            maxHeight: "210mm",
            pageBreakAfter: "always",
            pageBreakInside: "avoid",
            fontSize: "10px",
            padding: "1mm",
            boxSizing: "border-box",
            overflowY: "auto",
            transform: "scale(0.90)",
            transformOrigin: "top center",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}>
          
          {/* Header with document info */}
          <div className="flex justify-end items-start p-1 pb-0">
            <div className="flex items-center font-bold text-[11px]">
              TIF 24
            </div>
          </div>

          {/* Main header with QR code and title */}
          <div className="flex items-start justify-between p-0.5 mt-0">
            {/* QR Code */}
            <div className="w-1/4 pt-0">
              <div className="p-0.5 bg-white relative mt-3">
                <div className="relative">
                  <QRCode
                    size={100}
                    style={{ height: "90px", maxWidth: "100%", width: "100%" }}
                    value={`${applicationData.id}-${applicationData.fullName}`}
                    viewBox={`0 0 100 100`}
                    level="H"
                    fgColor="#000"
                    bgColor="#fff"
                  />
                </div>
              </div>
              <div className="mt-0.5">
                <p className="text-[10px] text-center font-bold mr-2 mb-0.5 whitespace-nowrap">MP No. {applicationData.id}</p>
              </div>
            </div>
             
            {/* Coat of arms and title */}
            <div className="flex-1 text-center px-1">
              <img
              src="/assets/images/coat-of-arms.png"
              alt="Coat of Arms"
              className="h-10 mx-auto mb-2"
              onLoad={() => {
                console.log('Coat of arms image loaded');
                setCoatOfArmsLoaded(true);
              }}
              onError={() => {
                console.warn("Failed to load coat of arms image");
                setCoatOfArmsLoaded(true); // Mark as loaded even on error to allow printing
              }}
            />  <p className="text-[14px] font-bold uppercase mb-0 whitespace-nowrap">
                THE UNITED REPUBLIC OF TANZANIA
              </p>
              <p className="text-[11px] mb-0">The Immigration Regulations 1977,</p>
              <p className="text-[11px] italic mb-0">(Regulation 18(3)(a))</p>
            </div>

            {/* Photo */}
            <div className="w-1/4 flex justify-end mb-2">
              <div className="border border-gray-300 p-1 bg-white mt-3">
                {applicationData.photo && !photoError ? (
                  <img
                    src={applicationData.photo && !applicationData.photo.startsWith('data:') 
                      ? `data:image/jpeg;base64,${applicationData.photo}`  
                      : applicationData.photo}
                    alt="Applicant Photo"
                    className="w-full h-auto object-cover"
                    style={{ height: "90px", maxWidth: "100%", width: "100%", objectFit: "cover" }} 
                    onLoad={() => {
                      console.log('Applicant photo loaded');
                      setPhotoLoaded(true);
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      console.warn("Failed to load applicant photo:", e);
                      setPhotoError(true);
                      setPhotoLoaded(true);
                    }}
                  />
                ) : (
                  <User 
                    className="w-full h-auto text-gray-400" 
                    style={{ height: "65px", width: "65px" }}
                  />
                )}
              </div>
            </div>
          </div>
          
          <p className="text-[16px] font-bold mb-0.5 text-center w-full">
            MIGRANT PASS
          </p>
          
          <div className="px-1">
            <p className="text-[12px] font-bold mb-0.5">
              CODE NO. <span className="ml-0.5 italic">{applicationData.id}</span> 
            </p>
          </div>
          
          {/* details */}
          <div className="ml-1">
            <p className="text-[13px] font-bold mb-0.5">
              Details
            </p>
          </div>
          
          <div className="p-1 pt-0 ml-2">
            <div className="space-y-0 text-[11px]">
              <Row label="Full Name:" value={applicationData.fullName} />
              <Row label="Nationality:" value={applicationData.nationality || "N/A"} />
              <Row 
                label="Physical Address:" 
                value={
                  applicationData.physicalAddress || 
                  (applicationData.ResidenceWardName || applicationData.ResidenceDistrictName || applicationData.ResidenceRegionName ? 
                    `${applicationData.ResidenceWardName || ""}, ${applicationData.ResidenceDistrictName || ""}, ${applicationData.ResidenceRegionName || ""}`  : 
                    "")
                } 
              />
              <Row
                label="The pass is issued for the period of"
                value="2YRS"
              />
              <Row
                label="From:"
                value={
                  <span>
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                    <span className="mx-2">to</span>
                    {(() => {
                      const futureDate = new Date();
                      futureDate.setFullYear(futureDate.getFullYear() + 2);
                      return futureDate.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      });
                    })()}
                  </span>
                }
              />
              
              <div className="text-[12px] font-bold italic">
                For the purpose of residing in the United Republic of Tanzania
              </div>
              
              <div className="">
                <p className="text-[12px] font-bold italic">
                  The holder of this pass is hereby permitted to remain in the United
                  Republic of Tanzania for the period stated herein.
                </p>
              </div>
              
              <div className="flex items-center text-[12px] gap-x-2 whitespace-nowrap overflow-x-auto">
                <span className="font-bold flex-shrink-0">Fee Paid:</span>
                <span className="font-bold italic px-1 flex-shrink-0">{applicationData.passportNo}</span>
                <span className="font-bold flex-shrink-0">
                  vide Control No <span className="italic">{applicationData.controlNo}</span> of{" "}
                  <span className="italic">
                    {new Date(applicationData.paymentDate || Date.now()).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>
              </div>

              <Row
                label="Issued at:"
                value={applicationData.passportNo}
              />
            </div>
          </div>

          {/* Contact address section */}
          <div className="ml-1">
            <p className="text-[13px] font-bold mb-0.5">
              Contact Address
            </p>
          </div>
          
          <div className="p-1 pt-0 ml-2">
            <div className="space-y-0 text-[11px]">
              <Row label="Name" value={applicationData.employerName || applicationData.fullName || ""} />
              <Row 
                label="Physical Address" 
                value={
                  applicationData.physicalAddress || 
                  applicationData.employerAddress || 
                  (applicationData.ResidenceWardName || applicationData.ResidenceDistrictName || applicationData.ResidenceRegionName ? 
                    `${applicationData.ResidenceWardName || ""}, ${applicationData.ResidenceDistrictName || ""}, ${applicationData.ResidenceRegionName || ""}`  : 
                    "")
                } 
              />
              <Row label="Telephone/Mobile" value={applicationData.phoneNo || applicationData.contactAddress || ""} />
              <Row label="Email" value="" />
              <Row label="Region of Application" value={applicationData.region || applicationData.ResidenceRegionName || ""}/>
            </div>
          </div>
          
          <div className="flex mt-0">
            <div className="flex flex-col items-center ml-auto">
              <p className="text-sm italic font-medium font-[cursive] text-center">
                {applicationData.signature ? (
                  <img
                    src={applicationData.signature}
                    alt="Signature"
                    className="mx-auto w-20 h-auto object-contain"
                    style={{ maxHeight: "40px" }}
                  />
                ) : (
                  <img
                    src="/assets/images/signature.png"
                    alt="Default Signature"
                    className="mx-auto w-20 h-auto object-contain"
                    style={{ maxHeight: "40px" }}
                  />
                )}
              </p>
              <p className="text-[12px] font-bold italic mt-0 text-center">
                Commissioner General of Immigration Services
              </p>
            </div>
          </div>

          {/* Dependants table */}
          <div className="p-0.5">
            <p className="text-center font-bold text-[14px] mb-0 pt-0">DEPENDANTS</p>
            <p className="text-center text-[12px] italic font-bold mb-0.5">(If any)</p>
            <div className="overflow-x-auto">
              <table className="border-collapse w-full max-w-[140mm] mx-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-1 py-0.5 text-[12px]">Name</th>
                    <th className="border border-gray-300 px-1 py-0.5 text-[12px]">Age</th>
                    <th className="border border-gray-300 px-1 py-0.5 text-[12px]">Relationship</th>
                    <th className="border border-gray-300 px-1 py-0.5 text-[12px]">Nationality</th>
                    <th className="border border-gray-300 px-1 py-0.5 text-[12px]">Registration No.</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationData.dependants && applicationData.dependants.length > 0 ? (
                    applicationData.dependants.slice(0, 4).map((dependant, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-1 py-0 text-[12px]">{dependant.name}</td>
                        <td className="border border-gray-300 px-1 py-0 text-[12px]">{dependant.age || 'N/A'}</td>
                        <td className="border border-gray-300 px-1 py-0 text-[12px]">{dependant.relationship}</td>
                        <td className="border border-gray-300 px-1 py-0 text-[12px]">
                          {dependant.nationality || dependant.issuedCountry || 'N/A'}
                        </td>
                        <td className="border border-gray-300 px-1 py-0 text-[12px]">
                          {dependant.documentNo ? dependant.documentNo : `DEP-${applicationData.id}-${index+1}`}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="border border-gray-300 px-1 py-0 text-[12px] text-center">No dependants</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Date and signature row at bottom */}
          <div className="p-1 mt-1">
            <div className="w-full flex justify-between items-end">
              {/* Date on the left */}
              <div className="flex flex-col">
                <p className="text-[12px] font-bold">
                  Date: {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Signature on the right */}
              <div className="flex flex-col items-center mt-2">
                <p className="text-sm italic font-medium font-[cursive] text-center">
                  {applicationData.signature ? (
                    <img
                      src={applicationData.signature}
                      alt="Signature"
                      className="mx-auto w-20 h-auto object-contain"
                      style={{ maxHeight: "40px" }}
                    />
                  ) : (
                    <img
                      src="/assets/images/signature.png"
                      alt="Default Signature"
                      className="mx-auto w-20 h-auto object-contain"
                      style={{ maxHeight: "40px" }}
                    />
                  )}
                </p>
                <p className="text-[12px] font-bold italic mt-0 text-center">
                  Commissioner General of Immigration Services
                </p>
              </div>
            </div>
          </div>
          
          {/* Horizontal gray border line at bottom - hidden in print */}
          <div className="border-t border-gray-400 mt-1 print:border-0 print:border-none"></div>
        </div>
      </div>
    </div>
  );
}
