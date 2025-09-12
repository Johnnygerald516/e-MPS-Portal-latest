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
    
    console.log(`Lookup request received: ${operationType}, arg1: ${argument1}, arg2: ${argument2}`);
    
    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not configured');
      return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.",
          jsonResult: []
        },
        { status: 500 }
      );
    }
    
    // Call the external API
    const externalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/applications/lookup`;
    
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
          console.error('Empty response from external API');
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
          console.error('Failed to parse API response as JSON:', responseText);
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
        
        console.log('External API response:', apiResponse);
        return NextResponse.json(apiResponse);
      } catch (textError) {
        console.error('Error reading response text:', textError);
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
      console.error('External API call failed:', fetchError);
      
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
    console.error("Error processing lookup request:", error);
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

