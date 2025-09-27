import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;

    // Validate required fields
    if (!applicationId) {
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "Application ID is required",
        jsonResult: null
      }, { status: 400 });
    }

    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('API URL not configured in environment variables');
      return NextResponse.json({
        ackCode: 0,
        ackMessage: "Server configuration error",
        jsonResult: null
      }, { status: 500 });
    }

    // Forward the request to the real backend API
    const response = await axios.get(`${apiUrl}/applications/${applicationId}/pass`);

    // Return the response from the backend API
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error(`Error fetching pass data for application ${params.applicationId}:`, error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      // If the backend API returned an error response
      if (error.response) {
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
      
      // Network error or timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Request timeout. Please try again.",
          jsonResult: null
        }, { status: 504 });
      }
      
      // Connection error
      if (error.code === 'ECONNREFUSED') {
        return NextResponse.json({
          ackCode: 0,
          ackMessage: "Failed to connect to the server. Please try again later.",
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
