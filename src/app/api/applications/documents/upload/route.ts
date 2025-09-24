import { NextRequest, NextResponse } from 'next/server';
import { callExternalApi, getExternalApiUrl } from "../../../../../lib/utils/api-route-helpers";

export async function POST(request: NextRequest) {
  try {
    // Check if API URL is configured
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL environment variable is not set');
      return NextResponse.json(
        { 
          ackCode: 500, 
          ackMessage: 'API configuration error: NEXT_PUBLIC_API_URL not set',
          jsonResult: null
        },
        { status: 500 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    console.log('Document upload request received');

    // Forward the request to the external API
    const externalApiUrl = `${apiUrl}/applications/documents/upload`;
    console.log('Forwarding to external API:', externalApiUrl);

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      body: formData, // Forward the FormData directly
    });

    console.log('External API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      
      // Try to parse as JSON, fallback to plain text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = {
          ackCode: response.status,
          ackMessage: `External API error: ${response.status} ${response.statusText}`,
          jsonResult: null
        };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    // Parse and return the response
    const responseData = await response.json();
    console.log('External API response data:', responseData);

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error in document upload API route:', error);
    
    return NextResponse.json(
      { 
        ackCode: 500, 
        ackMessage: `Server error: ${error.message}`,
        jsonResult: null
      },
      { status: 500 }
    );
  }
}
