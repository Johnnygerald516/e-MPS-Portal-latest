import axios, { AxiosError } from 'axios';
import { PassData } from '@/components/application/PassPDF';

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
  subjectCategory: string;
  registrationNo: string;
  passNumber: string | null;
  ControlNumber: string | null;
  PassTypeCode: string | null;
  PassValidFrom: string;
  validUntil: string;
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
    console.error('Error fetching application pass data:', error);
    
    // Handle different types of errors
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
 * @param response The API response
 * @returns Formatted PassData object
 */
export const convertToPassData = (response: ApplicationPassResponse): PassData | null => {
  if (!response.jsonResult || !response.jsonResult.applicationDetails.length) {
    return null;
  }

  const details = response.jsonResult.applicationDetails[0];
  const photoData = response.jsonResult.photo.length > 0 ? response.jsonResult.photo[0] : null;
  
  // Map dependants data
  const dependants = response.jsonResult.dependants.map(dep => ({
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
    // Check if the image already has a data URL prefix
    if (photoData.AttachmentImage.startsWith('data:image')) {
      photoDataUrl = photoData.AttachmentImage;
    } else {
      // Add data URL prefix if it's just a base64 string
      photoDataUrl = `data:image/jpeg;base64,${photoData.AttachmentImage}`;
    }
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
    ResidenceRegionName: details.ResidenceRegionName
  };
};
