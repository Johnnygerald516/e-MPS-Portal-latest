import { NextRequest, NextResponse } from 'next/server';
import { getApiUrlForRoute, isLocalUrl, ensureHttps } from '@/lib/config/api-config';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Handle GET requests
export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;
    
    // Get API URL with proper protocol handling
    const apiUrl = getApiUrlForRoute();
    const externalApiUrl = `${apiUrl}/applications/${applicationId}/residence-info`;
    console.log('Forwarding GET request to external API:', externalApiUrl);

    let response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'manual'
    });

    // Handle redirects manually
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        const secureRedirectUrl = isLocalUrl(redirectUrl) ? redirectUrl : ensureHttps(redirectUrl);
        response = await fetch(secureRedirectUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
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

      return NextResponse.json(errorData, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Parse and return the response
    const responseData = await response.json();
    console.log('External API response data:', responseData);

    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error: any) {
    console.error('Error in residence-info GET API route:', error);
    
    return NextResponse.json(
      { 
        ackCode: 500, 
        ackMessage: `Server error: ${error.message}`,
        jsonResult: null
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;
    
    // Get API URL with proper protocol handling
    const apiUrl = getApiUrlForRoute();

    // Get the request body
    const body = await request.json();
    console.log('Residence info request for application:', applicationId);
    console.log('Raw request body:', body);
    console.log('dateOfEntry from client:', body.dateOfEntry);
    console.log('dateOfEntry type:', typeof body.dateOfEntry);
    
    // Transform the payload to match what the API expects
    const transformedBody = {
      wardResidenceId: body.wardResidenceId || 0,
      streetName: body.streetName || '',
      phoneNo: body.phoneNo || '',
      houseNo: body.houseNo || '',
      plotNo: body.plotNo || '',
      countryOfOriginId: body.countryOfOriginId || 0,
      nationalityId: body.nationalityId || 0,
      dateOfEntry: body.dateOfEntry || ''
    };
    
    // Log the transformed payload
    console.log('Transformed dateOfEntry:', transformedBody.dateOfEntry);
    console.log('Transformed dateOfEntry type:', typeof transformedBody.dateOfEntry);
    console.log('Full transformed body:', JSON.stringify(transformedBody, null, 2));

    // Forward the request to the external API
    const externalApiUrl = `${apiUrl}/applications/${applicationId}/residence-info`;
    console.log('Forwarding to external API:', externalApiUrl);

    let response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedBody),
      redirect: 'manual'
    });

    // Handle redirects manually
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        const secureRedirectUrl = isLocalUrl(redirectUrl) ? redirectUrl : ensureHttps(redirectUrl);
        response = await fetch(secureRedirectUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transformedBody)
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

      return NextResponse.json(errorData, { 
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Parse and return the response
    const responseData = await response.json();
    console.log('External API response data:', responseData);

    return NextResponse.json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error: any) {
    console.error('Error in residence-info API route:', error);
    
    return NextResponse.json(
      { 
        ackCode: 500, 
        ackMessage: `Server error: ${error.message}`,
        jsonResult: null
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}
