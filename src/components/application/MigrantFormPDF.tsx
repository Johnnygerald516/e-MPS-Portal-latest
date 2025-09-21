import React from 'react';
import { format } from 'date-fns';
import JsBarcode from 'jsbarcode';

// Define types for the form data
export interface MigrantFormData {
  applicationId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  otherName?: string;
  maritalStatus?: string;
  dateOfBirth?: Date | null;
  gender?: string;
  countryOfBirth?: string;
  region?: string;
  mobileNumber?: string;
  occupationType?: string;
  occupation?: string;
  // Additional fields from API data
  nationality?: string;
  placeOfBirth?: string;
  passportNumber?: string;
  passportIssueDate?: Date | null;
  passportExpiryDate?: Date | null;
  // Residence information
  countryOfResidence?: string;
  residenceRegion?: string;
  district?: string;
  street?: string;
  permanentAddress?: string;
  dateOfEntry?: Date | null;
  // Parent information
  fatherName?: string;
  fatherDateOfBirth?: Date | null;
  fatherCountryOfBirth?: string;
  fatherRegion?: string;
  fatherNationality?: string;
  fatherCountryOfResidence?: string;
  motherName?: string;
  motherDateOfBirth?: Date | null;
  motherCountryOfBirth?: string;
  motherRegionOfBirth?: string;
  motherNationality?: string;
  motherCountryOfResidence?: string;
  // Dependant information
  dependantName?: string;
  dependantRelationship?: string;
  dependantNationality?: string; // Added nationality field
  dependantPassportNumber?: string;
  dependantIssueDate?: Date | null;
  dependantEndDate?: Date | null;
  // Arrays for multiple dependants and attachments
  dependants?: any[];
  attachments?: any[];
  // Declaration information
  agreeTerms?: boolean;
  declarationTimestamp?: Date | null;
  declarationText?: string;
  submissionDate?: string;
}


// Define the component props
interface MigrantFormPDFProps {
  formData: MigrantFormData;
  generatePDF: (formData: MigrantFormData) => void;
}

// Helper function to convert image to base64
export const imageToBase64 = (imgUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Check if the image URL is already a data URL
      if (imgUrl.startsWith('data:')) {
        resolve(imgUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      // Add cache-busting parameter to prevent caching issues
      const cacheBustedUrl = imgUrl.includes('?') ? 
        `${imgUrl}&cacheBust=${Date.now()}` : 
        `${imgUrl}?cacheBust=${Date.now()}`;
      
      // Add a timeout to handle cases where the image might hang
      const timeoutId = setTimeout(() => {
        console.error(`Timeout loading image from ${imgUrl}`);
        // Instead of rejecting, resolve with an empty string to prevent errors
        // This will trigger the fallback placeholder in the PDF generation
        resolve('');
      }, 10000); // 10 second timeout (increased from 5s)
      
      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.height = img.height;
          canvas.width = img.width;
          ctx?.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (canvasError) {
          console.error('Error creating canvas for image:', canvasError);
          // Resolve with empty string instead of rejecting
          resolve('');
        }
      };
      
      img.onerror = error => {
        clearTimeout(timeoutId);
        console.error(`Error loading image from ${imgUrl}:`, error);
        // Resolve with empty string instead of rejecting
        resolve('');
      };
      
      // Use the cache-busted URL to prevent caching issues
      img.src = cacheBustedUrl;
    } catch (error) {
      console.error('Unexpected error in imageToBase64:', error);
      // Resolve with empty string instead of rejecting
      resolve('');
    }
  });
};

// Helper function to generate barcode
export const generateBarcode = async (text: string): Promise<string> => {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    
    // Generate barcode on canvas with improved parameters
    JsBarcode(canvas, text, {
      format: 'CODE128',
      displayValue: true,
      fontSize: 14,       // Increased font size
      height: 50,         // Increased height
      width: 1,           // Increased bar width
      margin: 10,         // Increased margin
      background: '#ffffff',
      lineColor: '#000000',
      textMargin: 8       // Increased text margin
    });
    
    // Convert canvas to data URL with high quality
    return canvas.toDataURL('image/png', 1.0);
  } catch (err) {
    console.error('Error generating barcode:', err);
    return '';
  }
};

// Helper function to format dates - ensure it always returns a string
const formatDate = (date: Date | undefined | null): string => {
  if (!date) return 'N/A';
  try {
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

// PDF generation function that can be used with jsPDF
export const generateMigrantFormPDF = async (
  doc: any, 
  formData: MigrantFormData,
  applicantPhotoImage?: string
) => {
  try {
    // Set document properties
    doc.setProperties({
      title: 'Migrant Pass Application Form',
      subject: 'Application Form',
      author: 'Immigration Services Department',
      keywords: 'application, migrant, tanzania',
      creator: 'E-Migrant Portal'
    });

    // Keep text color as dull black for better readability
    doc.setTextColor(51, 51, 51);
    
   // Set border color to gray for all borders
doc.setDrawColor(128, 128, 128); // Gray color
doc.setLineWidth(0.2); // Thin border (~0.2px)

    // Generate barcode for the application ID
    const barcodeDataUrl = await generateBarcode(formData.applicationId || 'Application ID not available');
    
    // Add coat of arms image
    const coatOfArmsPath = '/images/coat_of_arm.png';

    try {
      if (coatOfArmsPath) {
        doc.addImage(coatOfArmsPath, 'PNG', 35, 15, 20, 20);
      } else {
        doc.addImage(coatOfArmsPath, 'PNG', 35, 15, 20, 20);
      }
    } catch (error) {
      doc.rect(35, 15, 20, 20);
      doc.setFontSize(8);
      doc.text('Coat of Arms', 45, 25, { align: 'center' });
    }
    
    // Add immigration logo image
    const logoPath = '/images/immigration_logo.png';
    try {
      if (logoPath) {
        doc.addImage(logoPath, 'PNG', 155, 15, 20, 20);
      } else {
        const logoPath = '/images/immigration_logo.png';
        doc.addImage(logoPath, 'PNG', 155, 15, 20, 20);
      }
    } catch (error) {
      doc.rect(155, 15, 20, 20);
      doc.setFontSize(8);
      doc.text('Immigration Logo', 165, 25, { align: 'center' });
    }
    
    // Add header text
    doc.setFont('serif', 'bold');
    doc.setFontSize(12);
    doc.text('THE UNITED REPUBLIC OF TANZANIA', 105, 15, { align: 'center' });
    doc.text('MINISTRY OF HOME AFFAIRS', 105, 20, { align: 'center' });
    doc.text('IMMIGRATION SERVICES DEPARTMENT', 105, 25, { align: 'center' });
    
    // Add form title
    doc.setFontSize(12);
    doc.text('MIGRANT PASS APPLICATION FORM', 105, 35, { align: 'center' });
    
    // Add horizontal line from QR code to profile picture
    // Note: We don't need to set color and width again as they're already set above
    doc.line(15, 45, 195, 45); // Draw horizontal line from left of QR code to right of profile picture
    
    // Add barcode image with increased size
    try {
      doc.addImage(barcodeDataUrl, 'PNG', 15, 45, 80, 30);
      console.log('Barcode added successfully');
    } catch (error) {
      console.error('Error adding barcode image:', error);
      // Use placeholder if image fails
      doc.rect(15, 45, 80, 30);
      doc.setFontSize(10);
      doc.text('BARCODE', 55, 60, { align: 'center' });
    }
    
    // Add applicant photo image
    try {
      if (applicantPhotoImage) {
        doc.addImage(applicantPhotoImage, 'PNG', 170, 45, 25, 35);
      } 
      else {
        // Fallback to default applicant photo
        const photoPath = '/images/immigration_logo.png';
        console.log('Adding applicant photo from path:', photoPath);
        doc.addImage(photoPath, 'JPG', 170, 45, 25, 35);
      }
    } catch (error) {
      console.error('Error adding applicant photo image:', error);
      // Use placeholder if image fails
      doc.rect(170, 45, 25, 35);
      doc.setFontSize(8);
      doc.text('PHOTO', 182.5, 62.5, { align: 'center' });
    }
    
    // Form number
    doc.setFontSize(8);
    doc.text('Fomu TIF23', 190, 15, { align: 'right' });
    
    // 1. APPLICATION DETAILS section
    doc.setFontSize(11);
    doc.setFont('serif', 'bold');
    doc.text('1. APPLICATION DETAILS:', 15, 80);
    
    // Create a table for application details
    let yPos = 85;
    const rowHeight = 8;
    const colWidth1 = 80;
    const colWidth2 = 95;
    const tableWidth = 180;
    const tableX = 15;
    
    // Helper function to draw a table row with borders
    const drawTableRow = (label: string, value: string) => {
      // Draw cell borders
      doc.rect(tableX, yPos, colWidth1, rowHeight); // Label cell
      doc.rect(tableX + colWidth1, yPos, tableWidth - colWidth1, rowHeight); // Value cell
      
      // Add text with padding
      doc.setFont('serif', 'bold');
      doc.setFontSize(9);
      doc.text(label, tableX + 2, yPos + 5.5);
      
      doc.setFont('serif', 'normal');
      doc.text(value, tableX + colWidth1 + 2, yPos + 5.5);
      
      // Move to next row
      yPos += rowHeight;
    };
    
    // Add basic information details
    drawTableRow('Application ID (namba ya ombi):', formData.applicationId);
    drawTableRow('Applicant Full Name (jina kamili):', `${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}`);
    drawTableRow('Former Name (Jina lingine):', formData.otherName || 'N/A');
    drawTableRow('Marital Status (Hali ya Ndoa):', formData.maritalStatus || 'N/A');
    drawTableRow('Date of Birth (Tarehe ya Kuzaliwa):', formatDate(formData.dateOfBirth));
    drawTableRow('Gender (Jinsi):', formData.gender?.toUpperCase() || 'N/A');
    drawTableRow('Country of Birth (Nchi ya Kuzaliwa):', formData.countryOfBirth?.toUpperCase() || 'N/A');
    drawTableRow('Region (Mkoa):', formData.region?.toUpperCase() || 'N/A');
    drawTableRow('Phone Number (Namba ya Simu):', formData.mobileNumber || 'N/A');
    drawTableRow('Nationality (Uraia):', formData.nationality || 'N/A');
    drawTableRow('Occupation Type (Aina ya Kazi):', formData.occupationType || 'N/A');
    drawTableRow('Occupation (Kazi):', formData.occupation || 'N/A');
    
    // 2.RESIDENCE INFORMATION section
    yPos += 10; // Add some space between sections
    doc.setFontSize(11);
    doc.setFont('serif', 'bold');
    doc.text('2. RESIDENCE INFORMATION:', 15, yPos);
    yPos += 10;
    
    // Add RESIDENCE INFORMATION
    drawTableRow('Country of Residence (Nchi ya Makazi):', formData.countryOfResidence || 'N/A');
    // drawTableRow('Region (Mkoa):', formData.residenceRegion || 'N/A');
    drawTableRow('District (Wilaya):', formData.district || 'N/A');
    drawTableRow('Street (Mtaa):', formData.street || 'N/A');
    drawTableRow('Date of Entry in Tz (Tarehe ya Kuingia Nchini):', formatDate(formData.dateOfEntry));
    
    // 3. PARENTS INFORMATION section
    // Check if we need to add a new page for parents information
    if (yPos > 230) {
      doc.addPage();
      yPos = 20; // Reset Y position for the new page
    }
    
    // Add parents information
    yPos += 10; // Add some space between sections
    doc.setFontSize(11);
    doc.setFont('serif', 'bold');
    doc.text('3. PARENTS INFORMATION:', 15, yPos);
    yPos += 10;

    // Father's information - check if we have enough space
    const fatherInfoHeight = 6 * 10; // Approximate height needed for father's info (6 rows * 10mm)
    if (yPos + fatherInfoHeight > 270) { // If not enough space on current page
      doc.addPage();
      yPos = 20; // Reset Y position for the new page
    }
    
    doc.setFontSize(10);
    doc.setFont('serif', 'bold');
    doc.text('Father Information:', 15, yPos);
    yPos += 5;
    doc.setFont('serif', 'normal');
    
    // Father's information
    drawTableRow('Father Name (Jina la Baba):', formData.fatherName || 'N/A');
    drawTableRow('Date of Birth (Tarehe ya Kuzaliwa):', formatDate(formData.fatherDateOfBirth));
    drawTableRow('Country of Birth (Nchi ya Kuzaliwa):', formData.fatherCountryOfBirth || 'N/A');
    drawTableRow('Region (Mkoa):', formData.fatherRegion || 'N/A');
    drawTableRow('Nationality (Taifa):', formData.fatherNationality || 'N/A');
    drawTableRow('Country of Residence (Nchi ya Makazi):', formData.fatherCountryOfResidence || 'N/A');
   
    // Check if we have enough space for mother's info
    const motherInfoHeight = 6 * 10; // Approximate height needed for mother's info (6 rows * 10mm)
    if (yPos + motherInfoHeight > 270) { // If not enough space on current page
      doc.addPage();
      yPos = 20; // Reset Y position for the new page
    }
    
    // Add some space before mother's information
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('serif', 'bold');
    doc.text('Mother Information:', 15, yPos);
    yPos += 5;
    doc.setFont('serif', 'normal');
    
    // Mother's information
    drawTableRow('Mother Name (Jina la Mama):', formData.motherName || 'N/A');
    drawTableRow('Date of Birth (Tarehe ya Kuzaliwa):', formatDate(formData.motherDateOfBirth));
    drawTableRow('Country of Birth (Nchi ya Kuzaliwa):', formData.motherCountryOfBirth || 'N/A');
    drawTableRow('Region (Mkoa):', formData.motherRegionOfBirth || 'N/A');
    drawTableRow('Nationality (Taifa):', formData.motherNationality || 'N/A');
    drawTableRow('Country of Residence (Nchi ya Makazi):', formData.motherCountryOfResidence || 'N/A');
   
    // Check if we need to add a new page for dependants information
    if (yPos > 230) {
      doc.addPage();
      yPos = 20; // Reset Y position for the new page
    }
    
    // Add dependents information
    yPos += 10; // Add some space between sections
    doc.setFontSize(11);
    doc.setFont('serif', 'bold');
    doc.text('4. DEPENDANTS INFORMATION:', 15, yPos);
    yPos += 10;
    
    // Create a table for dependants
    const dependantsTableX = 15;
    const dependantsTableY = yPos;
    const dependantsColWidths = [35, 25, 30, 30, 30, 30]; // Column widths with added nationality column
    const dependantsRowHeight = 10;
    
    // Draw table headers
    doc.setFillColor(240, 240, 240); // Light gray background
    doc.rect(dependantsTableX, dependantsTableY, sum(dependantsColWidths), dependantsRowHeight, 'F');
    
    doc.setFont('serif', 'bold');
    doc.setFontSize(9);
    
    let xOffset = dependantsTableX;
    ['Name (Jina)', 'Relationship', 'Nationality', 'Passport Number', 'Issue Date', 'Expiry Date'].forEach((header, i) => {
      doc.rect(xOffset, dependantsTableY, dependantsColWidths[i], dependantsRowHeight, 'S');
      doc.text(header, xOffset + 2, dependantsTableY + 7);
      xOffset += dependantsColWidths[i];
    });
    
    // Draw table rows for multiple dependants from API data
    doc.setFont('serif', 'normal');
    
    let currentRowY = dependantsTableY + dependantsRowHeight;
    
    if (formData.dependants && formData.dependants.length > 0) {
      // Loop through actual dependants from API
      formData.dependants.forEach((dependant: any, index: number) => {
        const dependantData = [
          String(dependant.dependantFullName || 'N/A'),
          String(dependant.dependantRelationType || 'N/A'),
          String(dependant.dependantNationality || 'N/A'),
          String(dependant.documentNumber || dependant.documentType || 'N/A'),
          dependant.issueDate || dependant.dependantIssueDate ? formatDate(new Date(dependant.issueDate || dependant.dependantIssueDate)) : 'N/A',
          dependant.expireDate || dependant.dependantEndDate ? formatDate(new Date(dependant.expireDate || dependant.dependantEndDate)) : 'N/A'
        ];
        
        let xOffset = dependantsTableX;
        dependantData.forEach((value, i) => {
          doc.rect(xOffset, currentRowY, dependantsColWidths[i], dependantsRowHeight, 'S');
          doc.text(value, xOffset + 2, currentRowY + 7);
          xOffset += dependantsColWidths[i];
        });
        
        currentRowY += dependantsRowHeight;
      });
    } else {
      // Fallback to single dependant data if no array available
      const dependantData = [
        String(formData.dependantName || 'N/A'),
        String(formData.dependantRelationship || 'N/A'),
        String(formData.dependantNationality || 'N/A'),
        String(formData.dependantPassportNumber || 'N/A'),
        String(formatDate(formData.dependantIssueDate)),
        String(formatDate(formData.dependantEndDate))
      ];
      
      let xOffset = dependantsTableX;
      dependantData.forEach((value, i) => {
        doc.rect(xOffset, currentRowY, dependantsColWidths[i], dependantsRowHeight, 'S');
        doc.text(value, xOffset + 2, currentRowY + 7);
        xOffset += dependantsColWidths[i];
      });
      
      currentRowY += dependantsRowHeight;
    }
    
    // Update yPos to after the table
    yPos = currentRowY + 5;
    
    // Helper function to sum an array
    function sum(arr: number[]): number {
      return arr.reduce((a, b) => a + b, 0);
    }
 
    // Add a new page for the declaration
    doc.addPage();
    
    // 5. MIGRANT DECLARATION section
    doc.setFontSize(11);
    doc.setFont('serif', 'bold');
    doc.text('5. MIGRANT DECLARATION', 15, 30);
    doc.setFont('serif', 'normal');
    doc.setFontSize(10);
    
    const migrantDeclaration = 'I __________________________________ declare that the information I have provided above is correct and I am ready to be held legally accountable for the information I have given.';
    
    const migrantDeclarationLines = doc.splitTextToSize(migrantDeclaration, 180);
    doc.text(migrantDeclarationLines, 15, 40);
    
    // Swahili version
    doc.setFontSize(9);
    doc.text('TAMKO LA MHAMIAJI', 15, 55);
    doc.text('Mimi __________________________________ ninathibitisha ya kwamba taarifa', 15, 65);
    doc.text('nilizozitoa hapo juu ni sahihi na nipo tayari kuwajibika kisheria kutokana na taarifa nilizozitoa.', 15, 70);
    
    // Signature fields
    doc.text('Signature (Sahihi): _______________________', 15, 90);
    doc.text('Date (Tarehe): _______________________', 120, 90);
    
    // Add official section
    doc.setFontSize(11);
    doc.setFont('serif', 'bold');
    doc.text('FOR OFFICIAL PURPOSES ONLY (KWA MATUMIZI YA OFISI)', 15, 130);
    doc.setFont('serif', 'normal');
    doc.setFontSize(10);
    
    doc.text('Action taken by Immigration Officer', 15, 145);
    doc.text('(Hatua iliyochukuliwa na Afisa Uhamiaji): _______________________', 15, 155);
    
    // Official signature fields
    doc.text('Signature (Sahihi): _______________________', 15, 175);
    doc.text('Date (Tarehe): _______________________', 120, 175);
    doc.text('Official Stamp: _______________________', 15, 195);
    
    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 190, 285);
    }
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Main component
const MigrantFormPDF: React.FC<MigrantFormPDFProps> = ({ formData, generatePDF }) => {
  return (
    <div className="hidden">
      {/* This component doesn't render anything visible */}
    </div>
  );
};

export default MigrantFormPDF;
