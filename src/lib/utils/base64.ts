/**
 * Base64 utility functions for handling image data
 * Provides robust validation, cleaning, and conversion of base64 image data
 */

/**
 * Clean base64 string by removing invalid characters
 * @param base64 - Raw base64 string
 * @returns Cleaned base64 string
 */
export const cleanBase64String = (base64: string): string => {
  // Remove any whitespace, newlines, or invalid characters
  return base64.replace(/[^A-Za-z0-9+/=]/g, '');
};

/**
 * Validate if a string is valid base64
 * @param str - String to validate
 * @returns True if valid base64, false otherwise
 */
export const isValidBase64 = (str: string): boolean => {
  try {
    // Check if string matches base64 pattern
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Pattern.test(str)) {
      return false;
    }
    
    // Try to decode to verify it's valid base64
    const decoded = atob(str);
    // Try to encode back to verify roundtrip
    const encoded = btoa(decoded);
    return encoded === str;
  } catch (error) {
    return false;
  }
};

/**
 * Image format signatures for base64 detection
 */
const IMAGE_SIGNATURES = {
  JPEG: ['/9j/', 'FFD8'],
  PNG: ['iVBORw0KGgo'],
  GIF: ['R0lGODlh', 'R0lGODdh'],
  BMP: ['Qk0'],
  WEBP: ['UklGR'],
  TIFF: ['SUkq', 'TU0A'],
  ICO: ['AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAA==']
} as const;

/**
 * Detect image format from base64 data
 * @param base64 - Base64 string (without data URL prefix)
 * @returns MIME type or null if unknown
 */
export const detectImageFormat = (base64: string): string | null => {
  const cleanBase64 = cleanBase64String(base64);
  
  for (const [format, signatures] of Object.entries(IMAGE_SIGNATURES)) {
    for (const signature of signatures) {
      if (cleanBase64.startsWith(signature)) {
        return `image/${format.toLowerCase()}`;
      }
    }
  }
  
  return null;
};

/**
 * Convert base64 string to data URL with proper MIME type detection
 * @param base64 - Raw base64 string
 * @param defaultMimeType - Default MIME type if detection fails
 * @returns Data URL string or null if invalid
 */
export const base64ToDataUrl = (base64: string, defaultMimeType: string = 'image/jpeg'): string | null => {
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
    console.error('Invalid base64 data detected');
    return null;
  }
  
  // Detect image format
  const detectedMimeType = detectImageFormat(cleanedBase64);
  const mimeType = detectedMimeType || defaultMimeType;
  
  return `data:${mimeType};base64,${cleanedBase64}`;
};

/**
 * Convert File to base64 string with validation
 * @param file - File object to convert
 * @returns Promise that resolves to base64 string (without data URL prefix)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      try {
        const base64String = reader.result as string;
        
        if (!base64String || !base64String.includes(',')) {
          reject(new Error('Invalid file data'));
          return;
        }
        
        // Remove the data URL prefix
        const base64 = base64String.split(',')[1];
        
        // Clean and validate the base64 string
        const cleanedBase64 = cleanBase64String(base64);
        
        if (!isValidBase64(cleanedBase64)) {
          reject(new Error('Invalid base64 data generated from file'));
          return;
        }
        
        resolve(cleanedBase64);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validate and process image data from API response
 * @param photoItem - Photo item from API response
 * @returns Data URL string or null if invalid
 */
export const processApiImageData = (photoItem: any): string | null => {
  if (!photoItem) return null;
  
  const base64 = photoItem.attachmentType;
  if (!base64) return null;
  
  return base64ToDataUrl(base64);
};

/**
 * Create a fallback image data URL for testing
 * @returns Minimal valid PNG data URL
 */
export const createFallbackImage = (): string => {
  // 1x1 transparent PNG
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
};

/**
 * Log detailed information about base64 image data for debugging
 * @param base64Data - Base64 data to analyze
 * @param label - Label for the log entry
 */
export const debugBase64Image = (base64Data: string | null, label: string = 'Image'): void => {
  if (!base64Data) {
    console.log(`📸 ${label}: No data available`);
    return;
  }
  
  const isDataUrl = base64Data.startsWith('data:');
  const mimeType = isDataUrl ? base64Data.split(';')[0] : 'Unknown';
  const hasBase64Marker = base64Data.includes('base64,');
  const base64Part = hasBase64Marker ? base64Data.split('base64,')[1] : base64Data;
  const cleanedBase64 = cleanBase64String(base64Part);
  
  console.log(`📸 ${label} Analysis:`, {
    hasData: !!base64Data,
    dataLength: base64Data.length,
    dataType: typeof base64Data,
    isDataUrl,
    mimeType,
    hasBase64Marker,
    base64Length: base64Part.length,
    base64Preview: base64Part.substring(0, 30) + '...',
    isValidBase64: isValidBase64(cleanedBase64),
    detectedFormat: detectImageFormat(cleanedBase64),
    isValidFormat: isDataUrl && hasBase64Marker && isValidBase64(cleanedBase64)
  });
};
