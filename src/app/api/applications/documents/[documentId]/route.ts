import { NextRequest, NextResponse } from 'next/server';
import { callExternalApi, getExternalApiUrl } from "../../../../../lib/utils/api-route-helpers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    
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

    console.log('Document delete request for document:', documentId);

    // Forward the request to the external API
    const externalApiUrl = `${apiUrl}/applications/documents/${documentId}`;
    console.log('Forwarding to external API:', externalApiUrl);

    const response = await fetch(externalApiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Error in document delete API route:', error);
    
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
