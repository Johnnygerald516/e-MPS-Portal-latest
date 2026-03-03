import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getApiUrlForRoute } from '@/lib/config/api-config';

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;

    // Validate required fields
    if (!applicationId) {
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "Application ID is required",
        jsonResult: null
      }, { status: 400 });
    }

    // Get the API URL with proper protocol handling
    const apiUrl = getApiUrlForRoute();

    // Log the request details for debugging
    console.log(`Fetching pass data for application ${applicationId}`);
    console.log(`API URL: ${apiUrl}`);
    console.log(`Full endpoint: ${apiUrl}/applications/${applicationId}/pass`);

    // Forward the request to the real backend API with timeout and headers
    const response = await axios.get(`${apiUrl}/applications/${applicationId}/pass`, {
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Log the response status
    console.log(`Response status: ${response.status}`);
    console.log(`Response data:`, response.data);

    // Process the response data before returning it
    const responseData = response.data;
    
    // Validate the response structure
    if (!responseData || typeof responseData !== 'object') {
      console.error('Invalid response format from backend API');
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "Invalid response format from backend API",
        jsonResult: null
      }, { status: 500 });
    }
    
    // Ensure photo data is properly formatted
    if (responseData.jsonResult?.photo && Array.isArray(responseData.jsonResult.photo)) {
      console.log(`Photo data found in response: ${responseData.jsonResult.photo.length} items`);
      
      // Check if photo data has the expected structure
      responseData.jsonResult.photo.forEach((photo: any, index: number) => {
        if (photo && photo.AttachmentImage) {
          console.log(`Photo ${index} has attachment image data, length: ${photo.AttachmentImage.length}`);
          
          // Log the first few characters to help debug
          console.log(`Photo ${index} data preview: ${photo.AttachmentImage.substring(0, 50)}...`);
          
          // Make sure the image data is properly formatted
          if (!photo.AttachmentImage.startsWith('data:image')) {
            console.log(`Photo ${index} needs data URL prefix, attempting to fix`);
            
            // Try to determine if it's valid base64
            try {
              // Simple validation - check if it can be decoded
              const testDecode = Buffer.from(photo.AttachmentImage, 'base64').toString('base64');
              if (testDecode) {
                console.log(`Photo ${index} appears to be valid base64, adding data URL prefix`);
                // Add data URL prefix for JPEG (most common format for photos)
                photo.AttachmentImage = `data:image/jpeg;base64,${photo.AttachmentImage}`;
              }
            } catch (error) {
              console.error(`Photo ${index} contains invalid base64 data:`, error);
            }
          }
        } else {
          console.log(`Photo ${index} is missing attachment image data`);
        }
      });
    } else {
      console.log('No photo data found in response');
    }
    
    // Return the processed response
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error(`Error fetching pass data for application ${params.applicationId}:`, error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        code: error.code,
        message: error.message,
        config: error.config,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      });

      // If the backend API returned an error response
      if (error.response) {
        console.error(`Backend API error response: ${error.response.status}`, error.response.data);
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
      
      // Network error or timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('Request timeout error');
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Request timeout. Please try again.",
          jsonResult: null
        }, { status: 504 });
      }
      
      // Connection error
      if (error.code === 'ECONNREFUSED') {
        console.error('Connection refused error');
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Failed to connect to the server. Please try again later.",
          jsonResult: null
        }, { status: 503 });
      }
    }
    
    // Generic error
    console.error('Generic error occurred:', error);
    return NextResponse.json({
      ackCode: 0,
      ackMessage: "An internal server error occurred. Please try again later.",
      jsonResult: null
    }, { status: 500 });
  }
}
