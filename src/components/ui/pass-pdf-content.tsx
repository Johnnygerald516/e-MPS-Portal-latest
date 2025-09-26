"use client";

import React from "react";

interface ApplicationData {
  id: string;
  fullName: string;
  nationality: string;
  passportNo: string;
  paymentDate: string;
  controlNo?: string;
  region?: string;
}

interface PassPDFContentProps {
  applicationData: ApplicationData;
}

export default function PassPDFContent({ applicationData }: PassPDFContentProps) {
  // Calculate dates
  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);

  return (
    <div style={{
      width: "210mm",
      height: "297mm",
      padding: "20mm",
      backgroundColor: "white",
      fontFamily: "Arial, sans-serif",
      boxSizing: "border-box",
      position: "relative",
      color: "#000", // Ensure text is black for better contrast
      fontSize: "12pt", // Standard font size for documents
      lineHeight: "1.5", // Better line spacing
      textRendering: "optimizeLegibility" // Better text rendering
    }}>
      {/* Header with document info */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <div style={{ fontWeight: "bold", fontSize: "11px" }}>TIF 24</div>
      </div>

      {/* Main header with QR code and title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        {/* QR Code area */}
        <div style={{ width: "25%" }}>
          <div style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "#f9f9f9", textAlign: "center" }}>
            <div style={{ backgroundColor: "#eee", height: "100px", width: "100px", margin: "0 auto" }}></div>
          </div>
          <p style={{ textAlign: "center", fontSize: "10px", marginTop: "5px" }}>MP No. {applicationData.id}</p>
        </div>
        
        {/* Title area */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ height: "40px", marginBottom: "10px" }}>{/* Coat of arms placeholder */}</div>
          <p style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", margin: 0 }}>
            THE UNITED REPUBLIC OF TANZANIA
          </p>
          <p style={{ fontSize: "11px", margin: 0 }}>The Immigration Regulations 1977,</p>
          <p style={{ fontSize: "11px", fontStyle: "italic", margin: 0 }}>(Regulation 18(3)(a))</p>
        </div>
        
        {/* Photo area */}
        <div style={{ width: "25%", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ border: "1px solid #ccc", padding: "5px", backgroundColor: "#f9f9f9" }}>
            <div style={{ backgroundColor: "#eee", height: "90px", width: "75px" }}></div>
          </div>
        </div>
      </div>

      {/* Title */}
      <p style={{ fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "10px" }}>
        MIGRANT PASS
      </p>
      
      {/* Code Number */}
      <div style={{ marginBottom: "15px" }}>
        <p style={{ fontSize: "12px", fontWeight: "bold" }}>
          CODE NO. <span style={{ fontStyle: "italic", marginLeft: "5px" }}>{applicationData.id}</span>
        </p>
      </div>

      {/* Details Section */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Details</p>
        
        <div style={{ marginLeft: "10px" }}>
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>Full Name:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>{applicationData.fullName}</div>
          </div>
          
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>Nationality:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>{applicationData.nationality}</div>
          </div>
          
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>Physical Address:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>{applicationData.region || "Dar es Salaam"}</div>
          </div>
          
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>The pass is issued for the period of:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>2YRS</div>
          </div>
          
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>From:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>
              {issueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
              <span style={{ margin: "0 5px" }}>to</span>
              {expiryDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>
          
          <p style={{ fontSize: "12px", fontWeight: "bold", fontStyle: "italic", margin: "15px 0" }}>
            For the purpose of residing in the United Republic of Tanzania
          </p>
          
          <p style={{ fontSize: "12px", fontWeight: "bold", fontStyle: "italic", marginBottom: "15px" }}>
            The holder of this pass is hereby permitted to remain in the United Republic of Tanzania for the period stated herein.
          </p>
          
          <div style={{ display: "flex", fontSize: "12px", marginBottom: "10px" }}>
            <span style={{ fontWeight: "bold", marginRight: "5px" }}>Fee Paid:</span>
            <span style={{ fontWeight: "bold", fontStyle: "italic", marginRight: "10px" }}>{applicationData.passportNo}</span>
            <span style={{ fontWeight: "bold" }}>
              vide Control No <span style={{ fontStyle: "italic" }}>{applicationData.controlNo || applicationData.id}</span> of{" "}
              <span style={{ fontStyle: "italic" }}>
                {new Date(applicationData.paymentDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>
          
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>Issued at:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>{applicationData.passportNo}</div>
          </div>
        </div>
      </div>

      {/* Contact Address Section */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "5px" }}>Contact Address</p>
        
        <div style={{ marginLeft: "10px" }}>
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>Name:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>{applicationData.fullName}</div>
          </div>
          
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>Physical Address:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>{applicationData.region || "Dar es Salaam"}</div>
          </div>
          
          <div style={{ display: "flex", marginBottom: "5px" }}>
            <div style={{ width: "30%", fontWeight: "bold", fontSize: "11px" }}>Region of Application:</div>
            <div style={{ width: "70%", fontStyle: "italic", fontSize: "11px" }}>{applicationData.region || "Dar es Salaam"}</div>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div style={{ display: "flex", marginTop: "0" }}>
        <div style={{ marginLeft: "auto", textAlign: "center" }}>
          <div style={{ height: "40px", marginBottom: "5px" }}>
            {/* Signature placeholder */}
          </div>
          <p style={{ fontSize: "12px", fontWeight: "bold", fontStyle: "italic", margin: 0 }}>
            Commissioner General of Immigration Services
          </p>
        </div>
      </div>

      {/* Dependants Table */}
      <div style={{ marginTop: "30px" }}>
        <p style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", margin: 0 }}>DEPENDANTS</p>
        <p style={{ fontSize: "12px", fontStyle: "italic", fontWeight: "bold", textAlign: "center", marginBottom: "10px" }}>(If any)</p>
        
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px", fontSize: "12px" }}>Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", fontSize: "12px" }}>Age</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", fontSize: "12px" }}>Relationship</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", fontSize: "12px" }}>Nationality</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", fontSize: "12px" }}>Registration No.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} style={{ border: "1px solid #ddd", padding: "8px", fontSize: "12px", textAlign: "center" }}>
                No dependants
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Date and signature at bottom */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", alignItems: "flex-end" }}>
        {/* Date on the left */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: "bold", margin: 0 }}>
            Date: {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        
        {/* Signature on the right */}
        <div style={{ textAlign: "center" }}>
          <div style={{ height: "40px", marginBottom: "5px" }}>
            {/* Signature placeholder */}
          </div>
          <p style={{ fontSize: "12px", fontWeight: "bold", fontStyle: "italic", margin: 0 }}>
            Commissioner General of Immigration Services
          </p>
        </div>
      </div>
    </div>
  );
}
