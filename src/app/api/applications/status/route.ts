import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

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

    // Get the API URL from environment variables or use the production URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://migrantonline.immigration.go.tz/api';
    if (!apiUrl) {
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "Server configuration error",
        jsonResult: null
      }, { status: 500 });
    }

    // Forward the request to the real backend API
    // The apiUrl already contains the full path: https://migrantonline.immigration.go.tz/api
    const response = await axios.post(`${apiUrl}/applications/status`, {
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
