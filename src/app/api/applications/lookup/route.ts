import { NextRequest, NextResponse } from "next/server";

// Define the lookup request interface
interface LookupRequest {
  operationType: string;
  argument1: number;
  argument2: number; 
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData: LookupRequest = await request.json();
    const { operationType, argument1, argument2 } = requestData;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
     return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.",
          jsonResult: []
        },
        { status: 500 }
      );
    }
    
    const externalApiUrl = `${apiUrl}/applications/lookup`;
    
    try {
      let currentUrl;
      try {
        currentUrl = new URL(externalApiUrl);
      } catch (error) {
        return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: `Invalid API URL format: ${externalApiUrl}`,
            jsonResult: []
          },
          { status: 500 }
        );
      }
      const isSelfCall = currentUrl.hostname === '10.6.0.164' || 
                         currentUrl.hostname === '10.6.0.165' || 
                         currentUrl.hostname === 'localhost';
      
      if (isSelfCall) {
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Cannot call API recursively",
          jsonResult: []
        }, { status: 400 });
      }
      
      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
       return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: `API error: ${response.status} ${response.statusText}`,
            error: errorText,
            jsonResult: []
          },
          { status: response.status }
        );
      }
      
      // Try to parse the response as JSON, with error handling
      try {
        const responseText = await response.text();
        
        // Check if response is empty
        if (!responseText || responseText.trim() === '') {
          return NextResponse.json(
            { 
              ackCode: 0, 
              ackMessage: "Empty response from external API",
              jsonResult: []
            },
            { status: 500 }
          );
        }
        
        // Try to parse the response as JSON
        let apiResponse;
        try {
          apiResponse = JSON.parse(responseText);
        } catch (parseError) {
          return NextResponse.json(
            { 
              ackCode: 0, 
              ackMessage: "Invalid JSON response from API",
              error: responseText.substring(0, 200), // Include part of the response for debugging
              jsonResult: []
            },
            { status: 500 }
          );
        }
    
        return NextResponse.json(apiResponse);
      } catch (textError) {
        return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: "Error reading API response",
            error: textError instanceof Error ? textError.message : "Unknown error",
            jsonResult: []
          },
          { status: 500 }
        );
      }
      
    } catch (fetchError) {
      // Return error with empty results for any connection issues
      return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "Failed to connect to external API",
          error: fetchError instanceof Error ? fetchError.message : "Network error",
          jsonResult: []
        },
        { status: 503 }
      );
    }
    
  } catch (error) {
    return NextResponse.json(
      { 
        ackCode: 0, 
        ackMessage: "Failed to process lookup request",
        error: error instanceof Error ? error.message : "Unknown error",
        jsonResult: []
      },
      { status: 500 }
    );
  }
}

// Fallback data has been removed - API will return empty results if the external API is unavailable

