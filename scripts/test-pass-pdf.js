// Test script for PDF generation with a known working image
const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

// Create a simple test image (1x1 transparent PNG)
const testImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// Create a mock pass data object
const mockPassData = {
  id: "TEST123456",
  fullName: "TEST USER",
  nationality: "Tanzania",
  physicalAddress: "Test Address, Dar es Salaam",
  dateOfBirth: "1990-01-01",
  passportNo: "AB123456",
  gender: "Male",
  maritalStatus: "Single",
  occupation: "Software Developer",
  permitType: "Residence",
  permitNo: "TEST123456",
  validFrom: "2023-01-01",
  validTo: "2025-01-01",
  phoneNumber: "0712345678",
  dependants: [],
  photo: testImageBase64,
  ResidenceWardName: "Test Ward",
  ResidenceDistrictName: "Test District",
  ResidenceRegionName: "Dar es Salaam",
  paidAmount: "100000",
  ControlNumber: "990001234567",
  passNumber: "MP12345"
};

// Function to generate a test PDF
async function generateTestPDF() {
  try {
    console.log("Starting PDF generation test...");
    
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add a simple page with text
    doc.setFontSize(16);
    doc.text("Test PDF with Image", 105, 20, { align: "center" });
    
    // Try to add the test image
    try {
      console.log("Adding test image to PDF...");
      doc.addImage(testImageBase64, "PNG", 75, 30, 60, 60);
      console.log("Test image added successfully");
    } catch (error) {
      console.error("Error adding test image:", error);
    }
    
    // Add some text after the image
    doc.setFontSize(12);
    doc.text("If you can see an image above, the basic image handling works", 105, 100, { align: "center" });
    
    // Save the PDF
    const outputPath = path.join(__dirname, "test-pdf-output.pdf");
    doc.save(outputPath);
    console.log(`Test PDF saved to: ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error("Error generating test PDF:", error);
    return false;
  }
}

// Run the test
generateTestPDF().then(success => {
  if (success) {
    console.log("Test completed successfully");
  } else {
    console.log("Test failed");
  }
});
