import React from 'react';
import { format } from 'date-fns';
import QRCode from 'qrcode';
// Import base64 signature
import { signatureBase64 } from '../../lib/utils/signature-base64';
// Import base64 utilities
import { base64ToDataUrl, cleanBase64String, isValidBase64 } from '../../lib/utils/base64';
// Import StaticImageData type for proper type handling
import { StaticImageData } from 'next/image';

// Define types for the pass data
export interface PassData {
  id: string;
  fullName: string;
  nationality: string;
  physicalAddress?: string;
  dateOfBirth?: string;
  passportNo?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
  permitType?: string;
  permitNo?: string;
  validFrom?: string;
  validTo?: string;
  employerName?: string;
  employerAddress?: string;
  phoneNumber?: string;
  email?: string;
  dependants?: any[];
  photo?: string;
  signature?: string;
  qrCode?: string;
  ResidenceWardName?: string;
  ResidenceDistrictName?: string;
  ResidenceRegionName?: string;
  paidAmount?: string;
  ControlNumber?: string | number;
  passNumber?: string;
  stationName?: string;
  subjectID?: string;
}

// Helper function to convert image URL to base64
export const imageToBase64 = async (imgUrl: string): Promise<string> => {
  return new Promise<string>(resolve => {
    try {
      if (!imgUrl) {
        resolve('');
        return;
      }

      // Check if it's already a data URL
      if (imgUrl.startsWith('data:')) {
        resolve(imgUrl);
        return;
      }

      // Add cache-busting parameter to prevent caching issues
      const cacheBustedUrl = `${imgUrl}${imgUrl.includes('?') ? '&' : '?'}cacheBust=${Date.now()}`;
      
      const img = new Image();
      
      // Set a timeout to handle images that may hang
      const timeoutId = setTimeout(() => {
        resolve('');
      }, 5000);
      
      img.crossOrigin = 'Anonymous';
      
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
          resolve('');
        }
      };
      
      img.onerror = error => {
        clearTimeout(timeoutId);
        resolve('');
      };
      
      img.src = cacheBustedUrl;
    } catch (error) {
      resolve('');
    }
  });
};

// Helper function to generate QR code using qrcode library
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 300; // Larger size for better resolution
    canvas.height = 300;
    
    // Generate QR code directly to canvas with optimized settings for scanning
    await QRCode.toCanvas(canvas, text, {
      width: 300,
      margin: 4, // Increased margin for better scanning
      errorCorrectionLevel: 'H', // High error correction
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      scale: 8 // Increased scale for better definition
    });
    
    // Convert canvas to data URL with high quality
    return canvas.toDataURL('image/png', 1.0);
  } catch (err) {
    
    
    // Create a simple text-based fallback
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ID:', 150, 130);
      ctx.font = 'bold 32px Arial';
      ctx.fillText(text, 150, 170);
    }
    
    return canvas.toDataURL('image/png', 1.0);
  }
};

// Helper function to format dates
const formatDate = (date: string | undefined | null): string => {
  if (!date) return 'N/A';
  try {
    return date;
  } catch (error) {
    return 'N/A';
  }
};

// PDF generation function that can be used with jsPDF
export const generatePassPDF = async (
  doc: any, 
  passData: PassData,
  photoImage?: string,
  signatureImage?: string,
  qrCodeImage?: string
) => {
  try {
    
    // Set document properties
    doc.setProperties({
      title: 'Migrant Pass',
      subject: 'Official Migrant Pass',
      author: 'Immigration Services Department',
      keywords: 'migrant, pass, tanzania',
      creator: 'E-Migrant Portal'
    });
    

    // Set text color
    doc.setTextColor(51, 51, 51);
    
    // Set border color
    doc.setDrawColor(128, 128, 128);
    doc.setLineWidth(0.2);

    // Page layout based on the provided image
    // Set A4 page size and margins
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // Margin in mm
    
    // Add background with immigration logo as overlay
    try {
      const logoPath = await imageToBase64('/images/immigration_logo.png');
      
      // Save state before changing opacity
      doc.saveGraphicsState();
    
      // Apply opacity just for the logo
      const gState = doc.GState({ opacity: 0.05 });
      doc.setGState(gState);
    
      // Add watermark logo (centered)
      doc.addImage(
        logoPath,
        'PNG',
        pageWidth / 2 - 60,
        pageHeight / 2 - 60,
        120,
        120
      );
    
      // Restore normal state so text is not affected
      doc.restoreGraphicsState();
    
    } catch (error) {
      
    }
    
    
    // Top right corner - TIF 24
    doc.setFontSize(8);
    doc.setFont('Times New Roman', 'normal');
    doc.text('TIF 24', pageWidth - margin, 10, { align: 'right' });

    // QR Code on top left
    try {
      // Use provided QR code image or generate a new one
      let qrCodeDataUrl;
      if (qrCodeImage) {
        qrCodeDataUrl = qrCodeImage;
      } else {
        // Generate QR code with only passNumber for reliable scanning
        const qrText = passData.passNumber ? `${passData.passNumber}` : '';
        qrCodeDataUrl = await generateQRCode(qrText || 'No Pass Number');
      }
      
      // Add the QR code to the PDF with increased size for better scanning
      doc.addImage(qrCodeDataUrl, 'PNG', 15, 15, 40, 40);
    } catch (error) {
      
      // Fallback to a simple rectangle if QR code fails
      doc.rect(15, 15, 40, 40);
      doc.setFontSize(10);
      doc.text('ID: ' + passData.id, 35, 35, { align: 'center' });
    }

    // MP No. text under QR code
    doc.setFontSize(8);
    doc.setFont('Times New Roman', 'bold');
    doc.text(`MP No. ${passData.passNumber ||""}`, 35, 55, { align: 'center' });
    
    // Add coat of arms image in the center top
    const coatOfArmsPath = '/images/coat_of_arm.png';
    try {
      doc.addImage(coatOfArmsPath, 'PNG', 95, 15, 20, 20);
    } catch (error) {
      doc.rect(95, 15, 20, 20);
      doc.setFontSize(8);
      doc.text('Coat of Arms', 105, 25, { align: 'center' });
    }
    
    // Add header text
    doc.setFont('Times New Roman', 'bold');
    doc.setFontSize(12);
    doc.text('THE UNITED REPUBLIC OF TANZANIA', 105, 45, { align: 'center' });
    
    // Add regulation text
    doc.setFontSize(8);
    doc.setFont('Times New Roman', 'normal');
    doc.text('The Immigration Regulations 1977,', 105, 52, { align: 'center' });
    doc.setFont('Times New Roman', 'italic');
    doc.text('(Regulation 18(3)(a))', 105, 57, { align: 'center' });
    
    // Add applicant photo on top right
    if (photoImage || passData.photo) {
      try {
        // Use either the provided photoImage or the photo from passData
        let imageSource = photoImage || passData.photo;
        const fallbackImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        
        // Ensure the image source is a valid data URL
        if (imageSource && !imageSource.startsWith('data:')) {
          const dataUrl = base64ToDataUrl(imageSource);
          if (dataUrl) {
            imageSource = dataUrl;
          } else {
            imageSource = `data:image/jpeg;base64,${cleanBase64String(imageSource)}`;
          }
        }
        
        // Add the image to the PDF
        if (imageSource && imageSource.startsWith('data:')) {
          try {
            // Use PNG format instead of JPEG to preserve colors correctly
            doc.addImage(imageSource, 'PNG', 160, 20, 30, 35);
          } catch (imgError) {
            doc.addImage(fallbackImage, 'PNG', 160, 20, 30, 35);
          }
        } else {
          doc.addImage(fallbackImage, 'PNG', 160, 20, 30, 35);
        }
      } catch (error) {
        // Fallback to a placeholder rectangle if image fails
        doc.rect(160, 20, 30, 35);
        doc.setFontSize(8);
        doc.text('Photo', 175, 37, { align: 'center' });
      }
    } else {
      doc.rect(160, 20, 30, 35);
      doc.setFontSize(8);
      doc.text('Photo', 175, 37, { align: 'center' });
    }
    
    // Add MIGRANT PASS title
    doc.setFontSize(14);
    doc.setFont('Times New Roman', 'bold');
    doc.text('MIGRANT PASS', 105, 70, { align: 'center' });
    
    // Define consistent positions for labels and values
    const labelX = 20;
    const valueX = 80;
    
    // Add code number - aligned with other fields
    doc.setFontSize(10);
    doc.setFont('Times New Roman', 'normal');
    const label = "CODE NO:";
    doc.text(label, labelX, 76);


    const labelWidth = doc.getTextWidth(label);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text(`${passData.subjectID}`, labelX + labelWidth + 2, 76);
    
    // Add Details header
    doc.setFontSize(10);
    doc.setFont('Times New Roman', 'bold');
    doc.text('Details', 20, 90);
    
    // Personal details section with optimized spacing
    let y = 100;
    const lineHeight = 6; // Reduced line height for better fit
    
   
    
    // Calculate max dependants that can fit
    const maxDependants = 4; // Maximum number of dependants to show
    
    // Set up the details with bold labels and normal values - exactly as in the image
    doc.setFont('Times New Roman', 'normal');
    doc.setFontSize(9);
    doc.text('Full Name:', labelX, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text(passData.fullName.toUpperCase(), valueX, y);
    y += lineHeight;
    
    doc.setFont('Times New Roman', 'normal');
    doc.text('Nationality:', labelX, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text((passData.nationality || '').toUpperCase(), valueX, y);
    y += lineHeight;
    
    doc.setFont('Times New Roman', 'normal');
    doc.text('Physical Address:', labelX, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text((passData.physicalAddress || 
      (passData.ResidenceWardName || passData.ResidenceDistrictName || passData.ResidenceRegionName ? 
        `${passData.ResidenceWardName || ""}, ${passData.ResidenceDistrictName || ""}, ${passData.ResidenceRegionName || ""}` : '')).toUpperCase(), valueX, y);
    y += lineHeight;
    
    doc.setFont('Times New Roman', 'normal');
    doc.text('The pass is issued for the period of', labelX, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text('2YRS', valueX, y);
    y += lineHeight;
    
    // From and to dates - using API data
    doc.setFont('Times New Roman', 'normal');
    doc.text('From:', labelX, y);
    
    // Format dates from API response
    const formatApiDate = (dateString: string | undefined) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
      } catch (error) {
        return dateString || 'N/A'; // Return original string if parsing fails
      }
    };
    
    const fromDateFormatted = formatApiDate(passData.validFrom);
    const toDateFormatted = formatApiDate(passData.validTo);
    
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text(`${fromDateFormatted} to ${toDateFormatted}`, valueX, y);
    y += lineHeight; // Reduced from lineHeight * 2 to just lineHeight
    
    // Purpose statement in a box - reduced spacing
    // doc.setFillColor(240, 240, 250);
    // doc.rect(20, y, 170, 10, 'F');
    doc.setFont('Times New Roman', 'bolditalic');
    doc.setFontSize(9);
    doc.text('For the purpose of residing in the United Republic of Tanzania', 20,y);
    y += lineHeight * 1.5; // Reduced from lineHeight * 2 to lineHeight * 1.5
    
    // Holder permission statement
    doc.setFont('Times New Roman', 'bolditalic');
    doc.setFontSize(9);
    doc.text('The holder of this pass is hereby permitted to remain in the United Republic of Tanzania for the', 20, y);
    y += lineHeight;
    doc.text('period stated herein.', 20, y);
    y += lineHeight * 1.5;
    
    // Fee paid information
    doc.setFont('Times New Roman', 'normal');
    doc.text('Fee Paid:', 20, y);
    doc.setFont('Times New Roman', 'bolditalic');
    // Format amount with commas or show fallback
    const formattedAmount = passData.paidAmount 
      ? Number(passData.paidAmount).toLocaleString('en-US') 
      : 'N/A';
    doc.text(`${formattedAmount} TZS`, 50, y);
    
    doc.setFont('Times New Roman', 'normal');
    doc.text('vide Control No', 100, y);
    doc.setFont('Times New Roman', 'bolditalic');
    // Ensure ControlNumber is always a string
    doc.text(String(passData.ControlNumber || 'N/A'), 140, y);
    y += lineHeight;
    
    // Issued at
    doc.setFont('Times New Roman', 'normal');
    doc.text('Issued at:', 20, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text(passData.stationName || '', 50, y);
    y += lineHeight * 2;
    
    // Contact Address section
    doc.setFont('Times New Roman', 'bold');
    doc.setFontSize(10);
    doc.text('Contact Address', 20, y);
    y += lineHeight;
    
    // Contact details - exactly as in the image
    doc.setFontSize(9);
    doc.setFont('Times New Roman', 'normal');
    doc.text('Name:', labelX, y);

    doc.setFont('Times New Roman', 'bolditalic');
    doc.text((passData.fullName || '').toUpperCase(), valueX, y);
    y += lineHeight;
    
    doc.setFont('Times New Roman', 'normal');
    doc.text('Physical Address:', labelX, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text((passData.physicalAddress || 
      (passData.ResidenceWardName || passData.ResidenceDistrictName || passData.ResidenceRegionName ? 
        `${passData.ResidenceWardName || ""}, ${passData.ResidenceDistrictName || ""}, ${passData.ResidenceRegionName || ""}` : 
        '')).toUpperCase(), valueX, y);
    y += lineHeight;
    
    doc.setFont('Times New Roman', 'normal');
    doc.text('Telephone/Mobile:', labelX, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text(passData.phoneNumber || '', valueX, y);
    y += lineHeight;
    
    doc.setFont('Times New Roman', 'normal');
    doc.text('Email:', labelX, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text(passData.email || '', valueX, y);
    y += lineHeight;
    
    doc.setFont('Times New Roman', 'normal');
    doc.text('Region of Application:', labelX, y);
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text(passData.stationName || '', valueX, y);
    
    // Add first signature in the middle section as shown in the image
    // Use optimized spacing
    y += lineHeight * 2;
    
    // Use the base64 signature
    try {
      if (signatureImage) {
        doc.addImage(signatureImage, 'PNG', 125, y-12, 80, 16);
      } 
      else {
        doc.addImage(signatureBase64, 'PNG', 125, y-12, 80, 16);
      }
    } catch (error) {
      doc.line(150, y, 180, y);
    }
    
    // First Commissioner text under signature
    doc.setFontSize(8); // Smaller font size
    doc.setFont('Times New Roman', 'bolditalic');
    doc.text('For Commissioner General of Immigration Services', 165, y+4, { align: 'center' });
    y += lineHeight * 2; // Reduced spacing after the first signature
    
    // Dependants section - positioned after the first signature with optimized spacing
    doc.setFont('Times New Roman', 'bold');
    doc.setFontSize(11); // Slightly smaller font
    doc.text('DEPENDANTS', 105, y, { align: 'center' });
    y += 4; // Increased spacing between DEPENDANTS and (If any)
    doc.setFontSize(8); // Smaller font size
    doc.text('(If any)', 105, y, { align: 'center' });
    y += 8; // Increased spacing before table
    
    // Table headers with optimized spacing
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, 170, 7, 'F'); // Slightly increased height for better readability
    doc.setFont('Times New Roman', 'bold');
    // Adjust column positions to better fit their content
    doc.text('Name', 25, y+4); // Left-aligned in column
    doc.text('Age', 65, y+4); // Centered in column
    doc.text('Relationship', 85, y+4); // Shortened text and moved left to reduce column width
    doc.text('Nationality', 120, y+4); // Moved left to increase column width
    doc.text('Registration No.', 165, y+4); // Shortened text and moved right
    
    // Add vertical borders for header row - Increase name column width
    doc.line(60, y, 60, y+7); // Name column (increased from 50 to 60)
    doc.line(75, y, 75, y+7); // Age column
    doc.line(105, y, 105, y+7); // Relationship column (reduced width)
    doc.line(160, y, 160, y+7); // Nationality column (increased width)
    
    // Draw outer border for header
    doc.rect(20, y, 170, 7);
    
    y += 7; // Increased spacing
    
    // Table rows with optimized spacing
    doc.setFont('Times New Roman', 'normal');
    if (passData.dependants && passData.dependants.length > 0) {
      // Limit to maximum 4 dependants
      const dependantsToShow = passData.dependants.slice(0, maxDependants);
      
      dependantsToShow.forEach((dependant, index) => {
        // Handle long names with truncation and smaller font if needed
        const nameText = dependant.dependantFullName || 'N/A';
        if (nameText.length > 20) { // Increased from 15 to 20
          doc.setFontSize(7); // Smaller font for long names
          // Truncate if still too long - increased length
          const truncatedName = nameText.length > 30 ? nameText.substring(0, 27) + '...' : nameText;
          doc.text(truncatedName, 25, y+4); 
        } else {
          doc.text(nameText, 25, y+4); // Name column
        }
        doc.setFontSize(9); // Reset font size
        
        doc.text(dependant.age?.toString() || 'N/A', 65, y+4); // Age column
        
        // Handle relationship text
        const relationText = dependant.relationType || 'N/A';
        if (relationText.length > 10) {
          doc.setFontSize(7); // Smaller font for long values
        }
        doc.text(relationText, 85, y+4); // Relationship column
        doc.setFontSize(9); // Reset font size
        
        // Handle long nationality values
        const nationalityText = dependant.dependantNationality || 'N/A';
        if (nationalityText.length > 20) {
          doc.setFontSize(7); // Smaller font for long values
          // Truncate if still too long
          const truncatedNationality = nationalityText.length > 30 ? nationalityText.substring(0, 27) + '...' : nationalityText;
          doc.text(truncatedNationality, 120, y+4);
        } else {
          doc.text(nationalityText, 120, y+4); // Nationality column
        }
        doc.setFontSize(9); // Reset font size
        
        // Always display N/A for registration number
        doc.text('N/A', 165, y+4); // Registration No. column
        
        // Add complete grid of borders for each row
        // Draw outer border
        doc.rect(20, y, 170, 8); // Consistent height for all rows
        
        // Draw vertical borders - Increase name column width
        doc.line(60, y, 60, y+8); // Name column (increased from 50 to 60)
        doc.line(75, y, 75, y+8); // Age column
        doc.line(105, y, 105, y+8); // Relationship column (reduced width)
        doc.line(160, y, 160, y+8); // Nationality column (increased width)
        
        // Draw horizontal border for the next row
        if (index < dependantsToShow.length - 1) {
          doc.line(20, y+8, 190, y+8); // Horizontal line at bottom of row
        }
        
        y += 8; // Reduced row height
      });
    } else {
      // doc.text('No dependants', 105, y+4, { align: 'center' });
      
      // Draw complete border for empty table
      doc.rect(20, y, 170, 8); // Border for empty row
      
      // Add vertical borders for consistency - Increase name column width
      doc.line(60, y, 60, y+8); // Name column (increased from 50 to 60)
      doc.line(75, y, 75, y+8); // Age column
      doc.line(105, y, 105, y+8); // Relationship column (reduced width)
      doc.line(160, y, 160, y+8); // Nationality column (increased width)
      
      y += 8; // Spacing after table
    }
    
    // Add optimized space after the dependants table
    y += 12; // Reduced spacing
    
    // Date section at bottom left
    doc.setFont('Times New Roman', 'bold');
    doc.setFontSize(8); // Smaller font size
    doc.text(`Date: ${new Date().getDate()} Sept ${new Date().getFullYear()}`, 20,y);
    
    // Second signature at bottom right
    try {
      // First try to use the provided signature image parameter
      if (signatureImage) {
        // Position signature centered above the text with reduced gap
        doc.addImage(signatureImage, 'PNG', 125, y-12, 80, 16);
      } 
      // If not provided, use the base64 signature
      else {
        // Use the imported base64 signature directly
        // Position signature centered above the text with reduced gap
        doc.addImage(signatureBase64, 'PNG', 125, y-12, 80, 16);
      }
    } catch (error) {
      doc.line(150, y, 180, y);
    }
    
    // Second Commissioner text under signature
    doc.setFont('Times New Roman', 'bolditalic');
    doc.setFontSize(8); // Smaller font size
    doc.text('For Commissioner General of Immigration Services', 165, y+4, { align: 'center' });
    
    // Add safety check to ensure all content fits
    if (y + 10 > pageHeight - margin) {
    }

    
  } catch (error) {
    throw error;
  }
};
