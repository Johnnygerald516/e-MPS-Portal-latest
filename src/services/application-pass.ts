import axios, { AxiosError } from 'axios';
import { PassData } from '@/components/application/PassPDF';
import { base64ToDataUrl, cleanBase64String, isValidBase64 } from '@/lib/utils/base64';

export interface ApplicationPassResponse {
  ackCode: number;
  ackMessage: string;
  jsonResult: {
    applicationDetails: ApplicationDetails[];
    photo: PhotoData[];
    dependants: DependantData[];
  } | null;
}

export interface ApplicationDetails {
  applicationID: string;
  fullName: string;
  subjectID: string;
  maritalStatus: string;
  nationality: string;
  occupationType: string;
  occupation: string;
  occupationDetail: string;
  ResidenceWardName: string;
  ResidenceDistrictName: string;
  ResidenceRegionName: string;
  ResidenceCountryName: string;
  phoneNo: string;
  plotNo: string;
  houseNumber: string;
  streetName: string;
  countryOfBirth: string;
  regionOfBirth: string;
  dateOfBirth: string;
  gender: string;
  stationName: string;
  subjectCategory: string;
  registrationNo: string;
  passNumber: string | null;
  ControlNumber: string | null;
  PassTypeCode: string | null;
  PassValidFrom: string;
  validUntil: string;
  paidAmount?: number;
}

export interface PhotoData {
  ApplicationID: string;
  AttachmentID: string;
  AttachmentImage: string;
}

export interface DependantData {
  dependantFullName: string;
  dependantNationality: string;
  documentType: string;
  documentNo: string;
  issuedCountry: string;
  expireDate: string;
  relationType: string;
}

/**
 * Fetches application pass data from the API
 * @param applicationId The application ID
 * @returns Application pass data
 */
export const getApplicationPass = async (applicationId: string): Promise<ApplicationPassResponse> => {
  try {
    // Validate input
    if (!applicationId) {
      return {
        ackCode: 0,
        ackMessage: "Application ID is required",
        jsonResult: null
      };
    }

    // Make API request
    const response = await axios.get(`/api/applications/${applicationId}/pass`);
    return response.data;
  } catch (error) {
     if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApplicationPassResponse>;
      
      // If the server returned an error response
      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
      
      // Network error
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return {
          ackCode: 0,
          ackMessage: "Request timeout. Please try again.",
          jsonResult: null
        };
      }
    }
    
    // Generic error
    return {
      ackCode: 0,
      ackMessage: "Failed to retrieve pass data. Please try again later.",
      jsonResult: null
    };
  }
};

/**
 * Converts API response data to PassData format
 * @param jsonResult The API response result object
 * @returns Formatted PassData object
 */
export const convertToPassData = (jsonResult: {
  applicationDetails: ApplicationDetails[];
  photo: PhotoData[];
  dependants: DependantData[];
}): PassData | null => {
  if (!jsonResult || !jsonResult.applicationDetails.length) {
    return null;
  }

  const details = jsonResult.applicationDetails[0];
  const photoData = jsonResult.photo.length > 0 ? jsonResult.photo[0] : null;
  
  // Map dependants data
  const dependants = jsonResult.dependants.map(dep => ({
    dependantFullName: dep.dependantFullName,
    dependantNationality: dep.dependantNationality,
    documentType: dep.documentType,
    documentNo: dep.documentNo,
    issuedCountry: dep.issuedCountry,
    expireDate: dep.expireDate,
    relationType: dep.relationType
  }));

  // Format physical address
  const physicalAddress = [
    details.streetName,
    details.ResidenceWardName,
    details.ResidenceDistrictName,
    details.ResidenceRegionName
  ].filter(Boolean).join(', ');

  // Process photo data - ensure it has proper data URL format
  let photoDataUrl: string | undefined = undefined;
  if (photoData?.AttachmentImage) {
    try {
      console.log("Processing photo data from API response");
      console.log("Photo data type:", typeof photoData.AttachmentImage);
      console.log("Photo data length:", photoData.AttachmentImage.length);
      console.log("Photo data preview:", photoData.AttachmentImage.substring(0, 50) + "...");
      
      // Check if it's already a data URL
      if (photoData.AttachmentImage.startsWith('data:image')) {
        console.log("Photo is already a data URL");
        photoDataUrl = photoData.AttachmentImage;
      } else {
        // Clean and validate the base64 string
        const cleanedBase64 = cleanBase64String(photoData.AttachmentImage);
        console.log("Cleaned base64 length:", cleanedBase64.length);
        
        if (isValidBase64(cleanedBase64)) {
          console.log("Base64 is valid");
          // Convert to proper data URL with format detection
          const dataUrl = base64ToDataUrl(cleanedBase64);
          if (dataUrl) {
            photoDataUrl = dataUrl;
            console.log("Photo data URL processed successfully:", dataUrl.substring(0, 50) + "...");
          } else {
            console.error("Failed to create data URL from valid base64");
            // Try direct construction as JPEG
            photoDataUrl = `data:image/jpeg;base64,${cleanedBase64}`;
            console.log("Created direct JPEG data URL");
          }
        } else {
          console.error("Invalid base64 data in photo attachment");
          // Try with the raw data as fallback
          const dataUrl = base64ToDataUrl(photoData.AttachmentImage);
          if (dataUrl) {
            photoDataUrl = dataUrl;
            console.log("Created data URL from raw attachment data");
          } else {
            console.error("All base64 conversion attempts failed");
            // Last resort: try direct construction with cleaned string
            photoDataUrl = `data:image/jpeg;base64,${cleanedBase64}`;
            console.log("Created last-resort JPEG data URL");
          }
        }
      }
    } catch (error) {
      console.error("Error processing photo data:", error);
    }
  } else {
    console.log("No photo data available in the response");
  }

  return {
    id: details.applicationID,
    fullName: details.fullName,
    nationality: details.nationality,
    physicalAddress: physicalAddress,
    dateOfBirth: details.dateOfBirth,
    passportNo: details.registrationNo,
    gender: details.gender === 'm' ? 'Male' : details.gender === 'f' ? 'Female' : details.gender,
    maritalStatus: details.maritalStatus,
    occupation: details.occupation,
    permitType: details.subjectCategory,
    permitNo: details.applicationID,
    validFrom: details.PassValidFrom,
    validTo: details.validUntil,
    phoneNumber: details.phoneNo,
    dependants: dependants,
    photo: photoDataUrl,
    ResidenceWardName: details.ResidenceWardName,
    ResidenceDistrictName: details.ResidenceDistrictName,
    ResidenceRegionName: details.ResidenceRegionName,
    // Add the missing properties
    paidAmount: details.paidAmount ? String(details.paidAmount) : undefined,
    ControlNumber: details.ControlNumber || '',
    passNumber: details.passNumber || '',
    // Map subjectID and stationName from API response
    subjectID: details.subjectID || '',
    stationName: details.stationName || ''
  };
};
