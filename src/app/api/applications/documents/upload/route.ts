import { NextRequest, NextResponse } from 'next/server';
import { callExternalApi, getExternalApiUrl } from "../../../../../lib/utils/api-route-helpers";
import { getApiUrlForRoute, isLocalUrl, ensureHttps } from '@/lib/config/api-config';

export async function POST(request: NextRequest) {
  try {
    // Get API URL with proper protocol handling
    const apiUrl = getApiUrlForRoute();

    // Get the form data
    const formData = await request.formData();
    console.log('Document upload request received');

    // Forward the request to the external API
    const externalApiUrl = `${apiUrl}/applications/documents/upload`;
    console.log('Forwarding to external API:', externalApiUrl);

    let response = await fetch(externalApiUrl, {
      method: 'POST',
      body: formData,
      redirect: 'manual'
    });

    // Handle redirects manually
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        const secureRedirectUrl = isLocalUrl(redirectUrl) ? redirectUrl : ensureHttps(redirectUrl);
        response = await fetch(secureRedirectUrl, {
          method: 'POST',
          body: formData
        });
      }
    }

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
