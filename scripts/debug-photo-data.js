// Debug script for photo data processing
const fs = require('fs');
const path = require('path');

// Function to clean base64 string
function cleanBase64String(base64) {
  return base64.replace(/[^A-Za-z0-9+/=]/g, '');
}

// Function to validate base64
function isValidBase64(str) {
  try {
    // Check if string matches base64 pattern
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Pattern.test(str)) {
      return false;
    }
    
    // Try to decode to verify it's valid base64
    const decoded = Buffer.from(str, 'base64').toString('base64');
    // Try to encode back to verify roundtrip
    const encoded = Buffer.from(decoded).toString('base64');
    return encoded === str;
  } catch (error) {
    return false;
  }
}

// Image format signatures for base64 detection
const IMAGE_SIGNATURES = {
  JPEG: ['/9j/', 'FFD8'],
  PNG: ['iVBORw0KGgo'],
  GIF: ['R0lGODlh', 'R0lGODdh'],
  BMP: ['Qk0'],
  WEBP: ['UklGR'],
  TIFF: ['SUkq', 'TU0A'],
  ICO: ['AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAA==']
};

// Function to detect image format
function detectImageFormat(base64) {
  const cleanBase64 = cleanBase64String(base64);
  
  for (const [format, signatures] of Object.entries(IMAGE_SIGNATURES)) {
    for (const signature of signatures) {
      if (cleanBase64.startsWith(signature)) {
        return `image/${format.toLowerCase()}`;
      }
    }
  }
  
  return null;
}

// Function to convert base64 to data URL
function base64ToDataUrl(base64, defaultMimeType = 'image/jpeg') {
  if (!base64) return null;
  
  // If it's already a data URL, validate and clean it
  if (base64.startsWith('data:')) {
    const parts = base64.split(',');
    if (parts.length === 2) {
      const cleanedBase64 = cleanBase64String(parts[1]);
      if (isValidBase64(cleanedBase64)) {
        return `${parts[0]},${cleanedBase64}`;
      }
    }
    return null;
  }
  
  // Clean the base64 string
  const cleanedBase64 = cleanBase64String(base64);
  
  // Validate the cleaned base64
  if (!isValidBase64(cleanedBase64)) {
    return null;
  }
  
  // Detect image format
  const detectedMimeType = detectImageFormat(cleanedBase64);
  const mimeType = detectedMimeType || defaultMimeType;
  
  return `data:${mimeType};base64,${cleanedBase64}`;
}

// Main function to debug photo data
async function debugPhotoData() {
  try {
    // Check if a file path was provided
    const filePath = process.argv[2];
    if (!filePath) {
      console.error('Please provide a file path to the API response JSON');
      process.exit(1);
    }

    // Read the file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileData);

    console.log('API Response Structure:');
    console.log('- ackCode:', jsonData.ackCode);
    console.log('- ackMessage:', jsonData.ackMessage);
    
    if (!jsonData.jsonResult) {
      console.error('No jsonResult in the API response');
      process.exit(1);
    }

    // Check application details
    if (jsonData.jsonResult.applicationDetails && jsonData.jsonResult.applicationDetails.length > 0) {
      console.log('\nApplication Details:');
      const details = jsonData.jsonResult.applicationDetails[0];
      console.log('- applicationID:', details.applicationID);
      console.log('- fullName:', details.fullName);
    } else {
      console.log('No application details found');
    }

    // Check photo data
    if (jsonData.jsonResult.photo && jsonData.jsonResult.photo.length > 0) {
      console.log('\nPhoto Data:');
      jsonData.jsonResult.photo.forEach((photo, index) => {
        console.log(`\nPhoto ${index + 1}:`);
        console.log('- ApplicationID:', photo.ApplicationID);
        console.log('- AttachmentID:', photo.AttachmentID);
        
        if (photo.AttachmentImage) {
          const imageData = photo.AttachmentImage;
          console.log('- AttachmentImage length:', imageData.length);
          console.log('- Starts with "data:image":', imageData.startsWith('data:image'));
          
          // Check if it's valid base64
          const isBase64 = isValidBase64(imageData.startsWith('data:image') ? 
            imageData.split(',')[1] : imageData);
          console.log('- Is valid base64:', isBase64);
          
          // Try to detect format
          const format = detectImageFormat(imageData.startsWith('data:image') ? 
            imageData.split(',')[1] : imageData);
          console.log('- Detected format:', format || 'Unknown');
          
          // Try to convert to data URL
          const dataUrl = base64ToDataUrl(imageData);
          console.log('- Successfully converted to data URL:', !!dataUrl);
          
          // Save the image to a file for inspection
          if (dataUrl) {
            const base64Data = dataUrl.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const outputPath = path.join(path.dirname(filePath), `photo_${index + 1}.jpg`);
            fs.writeFileSync(outputPath, buffer);
            console.log(`- Saved image to: ${outputPath}`);
          }
        } else {
          console.log('- No AttachmentImage data');
        }
      });
    } else {
      console.log('No photo data found');
    }

  } catch (error) {
    console.error('Error debugging photo data:', error);
  }
}

// Run the debug function
debugPhotoData();
