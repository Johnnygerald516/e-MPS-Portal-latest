import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getApiUrlForRoute, isLocalUrl, ensureHttps } from "@/lib/config/api-config";

// Helper function to check if a file exists
function fileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to read a file as base64
function readFileAsBase64(filePath: string): string | null {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString("base64");
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;
    console.log(`API route: Fetching application data for ID: ${applicationId}`);
    
    // Get API URL with proper protocol handling
    const apiUrl = getApiUrlForRoute();
    console.log('[API Route applicationId] Using API URL:', apiUrl);
    
    // Call the real external API endpoint
    const externalApiUrl = `${apiUrl}/applications/${applicationId}`;
    try {
      let response = await fetch(externalApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
        next: { revalidate: 0 },
        redirect: 'manual'
      });
      
      // Handle redirects manually
      if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.get('location');
        if (redirectUrl) {
          const secureRedirectUrl = isLocalUrl(redirectUrl) ? redirectUrl : ensureHttps(redirectUrl);
          response = await fetch(secureRedirectUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            cache: 'no-store'
          });
        }
      }

      if (!response.ok) {
        console.error(`External API error: ${response.status} ${response.statusText}`);
        try {
          // Try to parse error response
          const errorData = await response.text();
          console.error('Error response:', errorData);
        } catch (e) {
          // Ignore parsing error
        }
        throw new Error(`External API error: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw API response:', responseText.substring(0, 200) + '...');
      
      let externalData;
      try {
        externalData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse API response as JSON:', parseError);
        return NextResponse.json(
          { 
            ackCode: 0, 
            message: "Invalid JSON response from API",
            rawResponse: responseText.substring(0, 500) // Include part of the raw response for debugging
          },
          { status: 500 }
        );
      }
      
      // Log the structure of the response for debugging
      console.log('API response structure:', Object.keys(externalData));
      if (externalData.jsonResult) {
        console.log('jsonResult structure:', Object.keys(externalData.jsonResult));
      }
      
      // Return the external API response directly without transformation
      // This preserves the original structure with ApplicationDetails, applicantPhoto, applicationAttachment, applicationdependants
      return NextResponse.json(externalData);
      
    } catch (externalError) {
      console.error('External API call failed:', externalError);
      
      return NextResponse.json(
        { 
          ackCode: 0, 
          message: "Failed to connect to external API",
          error: externalError instanceof Error ? externalError.message : "Network error"
        },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error("Error fetching application data:", error);
    return NextResponse.json(
      { 
        ackCode: 0, 
        message: "Failed to fetch application data",
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
