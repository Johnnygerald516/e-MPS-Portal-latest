import { NextRequest, NextResponse } from 'next/server';

// Use the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string; nextStageId: string } }
) {
  try {
    // Get the application ID and nextStageId from the route parameters
    const { applicationId, nextStageId } = params;
    
    console.log(`Proceeding to next stage for application ID: ${applicationId}, nextStageId: ${nextStageId}`);
    
    // Check if API URL is configured
    if (!API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not configured');
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.",
        jsonResult: null
      }, { status: 500 });
    }
    
    // Forward the request to the actual API
    console.log(`Sending request to: ${API_URL}/applications/${applicationId}/attachments/${nextStageId}`);
    
    let response;
    try {
      response = await fetch(`${API_URL}/applications/${applicationId}/attachments/${nextStageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      const fetchError = error as Error;
      console.error('Fetch operation failed:', fetchError);
      
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "Failed to connect to external API",
        error: fetchError.message,
        jsonResult: null
      }, { status: 503 });
    }
      // Check if the response is OK
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      let errorMessage = `Error from API: ${response.statusText}`;
      
      try {
        // Try to parse the error response as JSON
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        // Try to extract a more specific error message if available
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (parseError) {
          // If we can't parse the error as JSON, use the text as is
          if (errorText && errorText.length < 100) {
            errorMessage = errorText;
          }
        }
      } catch (readError) {
        console.error('Failed to read error response:', readError);
      }
      
      return NextResponse.json({
        ackCode: 0,
        ackMessage: errorMessage,
        error: errorMessage,
        jsonResult: null
      }, { status: response.status });
    }
    
    // Check content type to determine how to handle the response
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // Get the response data as JSON
      const data = await response.json();
      console.log('API response data:', data);
      
      // Return the JSON response
      return NextResponse.json(data, {
        status: response.status,
      });
    } else {
      // Handle non-JSON response
      const textResponse = await response.text();
      console.log('Non-JSON response:', textResponse);
      
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "API returned non-JSON response",
        error: "Expected JSON response from API",
        jsonResult: null
      }, { status: 502 });
    }
  } catch (error: any) {
    console.error('API proxy error:', error);
    
    // Get the application ID and nextStageId from the params to fix TypeScript errors
    const { applicationId, nextStageId } = params;
    
    return NextResponse.json(
      { 
        ackCode: 0, 
        ackMessage: "Internal server error",
        error: error.message || "Unknown error",
        jsonResult: null
      },
      { status: 500 }
    );
  }
}
