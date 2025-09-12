import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

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
    
    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not configured');
      return NextResponse.json(
        { 
          ackCode: 0, 
          message: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable."
        },
        { status: 500 }
      );
    }
    
    // Call the real external API endpoint
    const externalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}`;
    
    try {
      const response = await fetch(externalApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers here
          // 'Authorization': 'Bearer your-token',
        },
      });

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      const externalData = await response.json();
      
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
