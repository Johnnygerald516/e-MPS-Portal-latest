"use client";

import React, { useRef, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { openPDFInNewTab } from "@/lib/utils/pdf-generator";
import PassPreview from "./pass-preview";

interface ApplicationData {
  id: string;
  fullName: string;
  nationality: string;
  passportNo: string;
  paymentDate: string;
  [key: string]: any;
}

interface PassPDFGeneratorProps {
  applicationData: ApplicationData;
  onClose?: () => void;
}

// This is a hidden component that automatically generates and opens a PDF
export function PassPDFGenerator({ applicationData, onClose }: PassPDFGeneratorProps) {
  const passRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [coatOfArmsLoaded, setCoatOfArmsLoaded] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(true); // Default to true if no photo

  // Check when images are loaded
  useEffect(() => {
    if (coatOfArmsLoaded) {
      setImagesLoaded(true);
    }
  }, [coatOfArmsLoaded]);

  // Generate and open PDF immediately without waiting for images
  useEffect(() => {
    const generatePDF = async () => {
      if (!passRef.current) return;
      
      try {
        // Start generating PDF immediately
        // The PDF generation will capture whatever is rendered at the moment
        setTimeout(async () => {
          try {
            await openPDFInNewTab(passRef.current!, `Migrant_Pass_${applicationData.id}.pdf`);
            // Auto-close the generator after PDF is opened
            if (onClose) {
              setTimeout(() => {
                onClose();
              }, 1000);
            }
          } catch (error) {
            console.error("Error generating PDF:", error);
          } finally {
            setIsGenerating(false);
          }
        }, 500); // Short delay to ensure component is rendered
      } catch (error) {
        console.error("Error in PDF generation process:", error);
        setIsGenerating(false);
      }
    };

    // Generate PDF immediately
    generatePDF();
    
    // Force timeout after 5 seconds to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      setIsGenerating(false);
      if (onClose) {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [applicationData.id, onClose]);

  // Preload coat of arms image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setCoatOfArmsLoaded(true);
    img.onerror = () => {
      console.warn("Failed to load coat of arms image");
      setCoatOfArmsLoaded(true); // Continue even if image fails to load
    };
    img.src = "/assets/images/coat-of-arms.png";
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
          <h3 className="text-lg font-medium mb-2">Opening PDF</h3>
          <p className="text-gray-500 text-center mb-2">
            Your migrant pass is being prepared...
          </p>
          <p className="text-gray-400 text-sm text-center mb-4">
            The PDF will open in a new tab automatically
          </p>
          {onClose && (
            <button 
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {/* Hidden pass preview for PDF generation - simplified for faster rendering */}
      <div className="hidden">
        <div ref={passRef} className="pass-printable-area" style={{ width: "210mm", height: "297mm", padding: "20mm", backgroundColor: "white" }}>
          {/* Simplified pass content for faster rendering */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "10px" }}>THE UNITED REPUBLIC OF TANZANIA</h1>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>MIGRANT PASS</h2>
          </div>
          
          <div style={{ marginBottom: "30px" }}>
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>CODE NO: <span style={{ fontStyle: "italic" }}>{applicationData.id}</span></p>
          </div>
          
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px" }}>Details</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px", fontWeight: "bold", width: "30%" }}>Full Name:</td>
                  <td style={{ padding: "8px", fontStyle: "italic" }}>{applicationData.fullName}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>Nationality:</td>
                  <td style={{ padding: "8px", fontStyle: "italic" }}>{applicationData.nationality}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>Passport No:</td>
                  <td style={{ padding: "8px", fontStyle: "italic" }}>{applicationData.passportNo}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>Control No:</td>
                  <td style={{ padding: "8px", fontStyle: "italic" }}>{applicationData.controlNo || applicationData.id}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>Issue Date:</td>
                  <td style={{ padding: "8px", fontStyle: "italic" }}>{new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>Valid Until:</td>
                  <td style={{ padding: "8px", fontStyle: "italic" }}>{(() => {
                    const date = new Date();
                    date.setFullYear(date.getFullYear() + 2);
                    return date.toLocaleDateString();
                  })()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: "50px", textAlign: "center" }}>
            <p style={{ fontWeight: "bold", marginTop: "20px" }}>Commissioner General of Immigration Services</p>
          </div>
        </div>
      </div>
    </div>
  );
}
