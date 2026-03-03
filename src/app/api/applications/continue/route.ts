import { NextRequest, NextResponse } from 'next/server';
import { ensureHttps } from '@/lib/config/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, phoneNumber } = body;

    // Validate required fields
    if (!applicationId || !phoneNumber) {
      return NextResponse.json(
        {
          ackCode: 0,
          ackMessage: 'Application ID and phone number are required',
          jsonResult: null
        },
        { status: 400 }
      );
    }

    // Get API URL and ensure HTTPS
    const apiUrl = ensureHttps(process.env.NEXT_PUBLIC_API_URL || '');
    
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

    const externalApiUrl = `${apiUrl}/applications/continue`;
    console.log('Calling external API:', externalApiUrl);

    // Call the external API
    let response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        applicationId,
        phoneNumber
      }),
      redirect: 'manual'
    });

    // Handle redirects manually to ensure HTTPS
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        console.log('Redirect detected:', redirectUrl);
        const secureRedirectUrl = ensureHttps(redirectUrl);
        console.log('Following redirect with HTTPS:', secureRedirectUrl);
        
        response = await fetch(secureRedirectUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            applicationId,
            phoneNumber
          })
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        {
          ackCode: response.status,
          ackMessage: `External API error: ${response.statusText}`,
          jsonResult: null
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('External API response:', data);

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in continue application API:', error);
    return NextResponse.json(
      {
        ackCode: 500,
        ackMessage: error instanceof Error ? error.message : 'Internal server error',
        jsonResult: null
      },
      { status: 500 }
    );
  }
}
