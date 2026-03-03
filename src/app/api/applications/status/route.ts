import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getApiUrlForRoute } from '@/lib/config/api-config';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { applicationId, phoneNumber } = body;

    // Validate required fields
    if (!applicationId && !phoneNumber) {
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "Tafadhali weka namba ya ombi au namba ya simu",
        jsonResult: null
      }, { status: 400 });
    }

    // Get the API URL from environment variables
    const apiUrl = getApiUrlForRoute();
    console.log('[API Route status] Using API URL:', apiUrl);

    // Forward the request to the real backend API
    const externalUrl = `${apiUrl}/applications/status`;
    console.log('[API Route] Forwarding request to external API:', externalUrl);
    console.log('[API Route] Request payload:', { applicationId, phoneNumber });
    
    const response = await axios.post(externalUrl, {
      applicationId,
      phoneNumber
    });

    // Return the response from the backend API
    return NextResponse.json(response.data);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // If the backend API returned an error response
      if (error.response) {
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
      
      // Network error or timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Muda wa kusubiri umekwisha. Tafadhali jaribu tena.",
          jsonResult: null
        }, { status: 504 });
      }
      
      // Connection error
      if (error.code === 'ECONNREFUSED') {
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Imeshindikana kuwasiliana na seva. Tafadhali jaribu tena baadae.",
          jsonResult: null
        }, { status: 503 });
      }
    }
    
    // Generic error
    return NextResponse.json({
      ackCode: 0,
      ackMessage: "An error occurred while processing your request",
      jsonResult: null
    }, { status: 500 });
  }
}
