import { NextRequest, NextResponse } from "next/server";
import { callExternalApi, getExternalApiUrl, createErrorResponse } from "../../../../../lib/utils/api-route-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params;
    console.log(`Processing declaration request for application ID: ${applicationId}`);
    
    try {
      // Get the base API URL
      const apiUrl = getExternalApiUrl();
      
      // Get request body if any
      let body = {};
      try {
        body = await request.json();
        console.log('Request body:', body);
      } catch (e) {
        console.log('No request body or invalid JSON');
      }
      
      // Construct the full external API URL
      const externalApiUrl = `${apiUrl}/applications/${applicationId}/declaration`;
      console.log(`Calling external API at: ${externalApiUrl}`);
      
      // Call the external API using our helper
      const result = await callExternalApi(externalApiUrl, 'POST', body);
      
      if (!result.success) {
        // Return the error response from the external API
        return NextResponse.json(result.data, { status: result.status });
      }
      
      // Return the successful response
      return NextResponse.json(result.data);
      
    } catch (externalError) {
      console.error('External API call failed:', externalError);
      
      return createErrorResponse(
        `Failed to connect to external API: ${externalError instanceof Error ? externalError.message : "Network error"}`,
        503
      );
    }
    
  } catch (error) {
    console.error("Error submitting declaration:", error);
    return NextResponse.json(
      { 
        ackCode: 0, 
        ackMessage: "Failed to submit declaration",
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
