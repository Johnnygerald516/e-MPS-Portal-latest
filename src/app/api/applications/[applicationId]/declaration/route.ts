import { NextRequest, NextResponse } from "next/server";

export async function POST(
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
          ackMessage: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable."
        },
        { status: 500 }
      );
    }
    
    // Call the real external API endpoint
    const externalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/declaration`;
    
    try {
      const response = await fetch(externalApiUrl, {
        method: 'POST',
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
      
      // Return the external API response
      return NextResponse.json(externalData);
      
    } catch (externalError) {
      console.error('External API call failed:', externalError);
      
      return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "Failed to connect to external API",
          error: externalError instanceof Error ? externalError.message : "Network error"
        },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error("Error submitting declaration:", error);
    return NextResponse.json(
      { 
        ackCode: 0, 
        ackMessage: "Failed to submit declaration",
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
