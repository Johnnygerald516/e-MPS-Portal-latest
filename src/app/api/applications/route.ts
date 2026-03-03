import { NextRequest, NextResponse } from "next/server";
import { getApiUrlForRoute, isLocalUrl, ensureHttps } from "@/lib/config/api-config";

// Define the verification request interface
interface VerificationRequest {
  subjectId: string;
  dateOfBirth: string;
  phoneNumber?: string;
  applicationTypeId?: number;
}

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

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData: VerificationRequest = await request.json();
   const { subjectId, dateOfBirth, phoneNumber, applicationTypeId } = requestData;
    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.",
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
    
    // The NEXT_PUBLIC_API_URL already contains the full path
    // We need to add 'applications' to the path
    const apiUrl = getApiUrlForRoute();
    const externalApiUrl = `${apiUrl}/applications`;
    
    try {
      // Check if we have at least a subjectId or dateOfBirth
      if (!requestData.subjectId && !requestData.dateOfBirth) {
        return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: "Missing required fields: subjectId or dateOfBirth",
            jsonResult: null
          },
          { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          }
        );
      }
      
      // Pass through the request data directly without modification
      // This ensures we're using exactly the same field names and values
      const apiPayload = requestData;
      let response = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiPayload),
        redirect: 'manual' // Handle redirects manually to prevent protocol downgrades
      });
      
      // Handle redirects manually
      if (response.status >= 300 && response.status < 400) {
        const redirectUrl = response.headers.get('location');
        if (redirectUrl) {
          // Only force HTTPS for non-local URLs
          const secureRedirectUrl = isLocalUrl(redirectUrl) ? redirectUrl : ensureHttps(redirectUrl);
       response = await fetch(secureRedirectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(apiPayload),
          });
        }
      }
      
      if (!response.ok) {
        let errorText = '';
        let errorJson = null;
        
        try {
          // Try to parse as JSON first
          errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
         } catch (e) {
          // If not JSON, get as text
          try {
            errorText = await response.text();
          } catch (textError) {
            errorText = 'Could not read error response';
          }
        }
        
        return NextResponse.json(
          { 
            ackCode: 0, 
            ackMessage: `API error: ${response.status} ${response.statusText}`,
            error: errorText,
            errorDetails: errorJson,
            jsonResult: null
          },
          { 
            status: response.status,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          }
        );
      }
      
      const apiResponse = await response.json();
      // Return the response with CORS headers
      return NextResponse.json(apiResponse, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
      
    } catch (fetchError) {
     return NextResponse.json(
        { 
          ackCode: 0, 
          ackMessage: "Failed to connect to external API",
          error: fetchError instanceof Error ? fetchError.message : "Network error",
          jsonResult: null
        },
        { 
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
    
  } catch (error) {
     return NextResponse.json(
      { 
        ackCode: 0, 
        ackMessage: "Failed to process verification request",
        error: error instanceof Error ? error.message : "Unknown error",
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
