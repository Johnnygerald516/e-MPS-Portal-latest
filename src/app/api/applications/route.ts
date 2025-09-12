import { NextRequest, NextResponse } from "next/server";

// Define the verification request interface
interface VerificationRequest {
  subjectId: string;
  dateOfBirth: string;
  phoneNumber: string;
  applicationTypeId: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData: VerificationRequest = await request.json();
    const { subjectId, dateOfBirth, phoneNumber, applicationTypeId } = requestData;
    
    console.log(`Verification request received: ${subjectId}, DOB: ${dateOfBirth}, Phone: ${phoneNumber}, Type: ${applicationTypeId}`);
    
    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not configured');
      return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.",
          jsonResult: null
        },
        { status: 500 }
      );
    }
    
    // Call the external API
    const externalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/applications`;
    
    try {
      const response = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} ${response.statusText}`, errorText);
        
        return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: `API error: ${response.status} ${response.statusText}`,
            error: errorText,
            jsonResult: null
          },
          { status: response.status }
        );
      }
      
      const apiResponse = await response.json();
      console.log('External API response:', apiResponse);
      return NextResponse.json(apiResponse);
      
    } catch (fetchError) {
      console.error('External API call failed:', fetchError);
      
      return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "Failed to connect to external API",
          error: fetchError instanceof Error ? fetchError.message : "Network error",
          jsonResult: null
        },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error("Error processing verification request:", error);
    return NextResponse.json(
      { 
        ackCode: 0, 
        ackMessage: "Failed to process verification request",
        error: error instanceof Error ? error.message : "Unknown error",
        jsonResult: null
      },
      { status: 500 }
    );
  }
}
