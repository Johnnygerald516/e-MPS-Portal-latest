"use client";

import React, { forwardRef } from "react";

interface ApplicationData {
  id: string;
  fullName: string;
  nationality: string;
  passportNo: string;
  paymentDate: string;
  controlNo?: string;
  region?: string;
  [key: string]: any;
}

interface PassSimpleProps {
  applicationData: ApplicationData;
}

// This is a simplified pass component optimized for PDF rendering
function PassSimple({ applicationData }: PassSimpleProps) {
  // Calculate expiry date (2 years from now)
  const issueDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);

  return (
    <div 
      className="pass-printable-area bg-white"
      style={{ 
        width: "210mm", 
        height: "297mm", 
        padding: "20mm",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ width: "25%" }}>
          <div style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "#f9f9f9", textAlign: "center" }}>
            {/* QR Code placeholder */}
            <div style={{ backgroundColor: "#eee", height: "100px", width: "100px", margin: "0 auto" }}></div>
          </div>
          <p style={{ textAlign: "center", fontSize: "12px", marginTop: "5px" }}>MP No. {applicationData.id}</p>
        </div>
        
        <div style={{ textAlign: "center", flex: "1" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "5px" }}>
            THE UNITED REPUBLIC OF TANZANIA
          </h1>
          <p style={{ fontSize: "14px", margin: "0" }}>The Immigration Regulations 1977,</p>
          <p style={{ fontSize: "14px", fontStyle: "italic", margin: "0" }}>(Regulation 18(3)(a))</p>
        </div>
        
        <div style={{ width: "25%", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ border: "1px solid #ccc", padding: "10px", backgroundColor: "#f9f9f9" }}>
            {/* Photo placeholder */}
            <div style={{ backgroundColor: "#eee", height: "120px", width: "100px" }}></div>
          </div>
        </div>
      </div>
      
      {/* Title */}
      <h2 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
        MIGRANT PASS
      </h2>
      
      {/* Code Number */}
      <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "20px" }}>
        CODE NO. <span style={{ fontStyle: "italic" }}>{applicationData.id}</span>
      </p>
      
      {/* Details Section */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>
          Details
        </h3>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", width: "30%" }}>Full Name:</td>
              <td style={{ padding: "8px 0", fontStyle: "italic" }}>{applicationData.fullName}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Nationality:</td>
              <td style={{ padding: "8px 0", fontStyle: "italic" }}>{applicationData.nationality}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Passport No:</td>
              <td style={{ padding: "8px 0", fontStyle: "italic" }}>{applicationData.passportNo}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>The pass is issued for the period of:</td>
              <td style={{ padding: "8px 0", fontStyle: "italic" }}>2YRS</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>From:</td>
              <td style={{ padding: "8px 0", fontStyle: "italic" }}>
                {issueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                <span style={{ margin: "0 10px" }}>to</span>
                {expiryDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
              </td>
            </tr>
          </tbody>
        </table>
        
        <p style={{ fontSize: "14px", fontWeight: "bold", fontStyle: "italic", margin: "20px 0" }}>
          For the purpose of residing in the United Republic of Tanzania
        </p>
        
        <p style={{ fontSize: "14px", fontWeight: "bold", fontStyle: "italic" }}>
          The holder of this pass is hereby permitted to remain in the United Republic of Tanzania for the period stated herein.
        </p>
        
        <div style={{ display: "flex", alignItems: "center", marginTop: "20px", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold", marginRight: "5px" }}>Fee Paid:</span>
          <span style={{ fontWeight: "bold", fontStyle: "italic", marginRight: "10px" }}>{applicationData.passportNo}</span>
          <span style={{ fontWeight: "bold", marginRight: "5px" }}>
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
      </div>
      
      {/* Contact Address Section */}
      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>
          Contact Address
        </h3>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold", width: "30%" }}>Name:</td>
              <td style={{ padding: "8px 0", fontStyle: "italic" }}>{applicationData.fullName}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Physical Address:</td>
              <td style={{ padding: "8px 0", fontStyle: "italic" }}>{applicationData.region || "Dar es Salaam"}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontWeight: "bold" }}>Region of Application:</td>
              <td style={{ padding: "8px 0", fontStyle: "italic" }}>{applicationData.region || "Dar es Salaam"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Signature */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: "40px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ height: "40px", marginBottom: "5px", fontStyle: "italic" }}>
            {/* Signature placeholder */}
          </div>
          <p style={{ fontSize: "14px", fontWeight: "bold", fontStyle: "italic" }}>
            Commissioner General of Immigration Services
          </p>
        </div>
      </div>
      
      {/* Dependants Table */}
      <div style={{ marginTop: "40px" }}>
        <p style={{ fontSize: "16px", fontWeight: "bold", textAlign: "center", marginBottom: "5px" }}>DEPENDANTS</p>
        <p style={{ fontSize: "14px", fontStyle: "italic", fontWeight: "bold", textAlign: "center", marginBottom: "10px" }}>(If any)</p>
        
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
      
      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: "14px", fontWeight: "bold" }}>
            Date: {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        
        <div style={{ textAlign: "center" }}>
          <div style={{ height: "40px", marginBottom: "5px", fontStyle: "italic" }}>
            {/* Signature placeholder */}
          </div>
          <p style={{ fontSize: "14px", fontWeight: "bold", fontStyle: "italic" }}>
            Commissioner General of Immigration Services
          </p>
        </div>
      </div>
    </div>
  );
}

export default PassSimple;
