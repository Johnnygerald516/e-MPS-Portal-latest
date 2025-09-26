import { NextRequest, NextResponse } from "next/server";

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
    
    console.log('Raw request data received:', JSON.stringify(requestData));
    
    const { subjectId, dateOfBirth, phoneNumber, applicationTypeId } = requestData;
    
    console.log(`Verification request received: SubjectID: ${subjectId}, DOB: ${dateOfBirth}, Phone: ${phoneNumber}, Type: ${applicationTypeId}`);
    
    
    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not configured');
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
    
    // Call the external API
    const externalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/applications`;
    
    try {
      // Check if we have at least a subjectId or dateOfBirth
      if (!requestData.subjectId && !requestData.dateOfBirth) {
        console.error('Missing required fields: subjectId or dateOfBirth');
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
      
      // For debugging purposes, log what we're sending
      console.log('API Payload (stringified):', JSON.stringify(apiPayload));
      console.log('API Payload keys:', Object.keys(apiPayload));
      
      console.log('Sending to external API:', externalApiUrl);
      console.log('Payload:', JSON.stringify(apiPayload));
      
      const response = await fetch(externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(apiPayload),
      });
      
      if (!response.ok) {
        let errorText = '';
        let errorJson = null;
        
        try {
          // Try to parse as JSON first
          errorJson = await response.json();
          errorText = JSON.stringify(errorJson);
          console.error(`API error (JSON): ${response.status} ${response.statusText}`, errorJson);
        } catch (e) {
          // If not JSON, get as text
          try {
            errorText = await response.text();
            console.error(`API error (text): ${response.status} ${response.statusText}`, errorText);
          } catch (textError) {
            errorText = 'Could not read error response';
            console.error(`API error: ${response.status} ${response.statusText}`, 'Could not read error response');
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
      console.log('External API response:', apiResponse);
      
      // Return the response with CORS headers
      return NextResponse.json(apiResponse, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
      
    } catch (fetchError) {
      console.error('External API call failed:', fetchError);
      
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
    console.error("Error processing verification request:", error);
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
