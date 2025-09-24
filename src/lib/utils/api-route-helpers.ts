/**
 * API Route Helper Functions
 * 
 * This file contains helper functions for API routes to interact with external APIs.
 */

import { NextResponse } from "next/server";

/**
 * Get the external API URL from environment variables
 * @returns The external API URL or throws an error if not configured
 */
export function getExternalApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
  }
  return apiUrl;
}

/**
 * Call an external API with error handling
 * @param url The URL to call
 * @param method The HTTP method to use
 * @param body The request body (optional)
 * @param headers Additional headers (optional)
 * @returns The response data or throws an error
 */
export async function callExternalApi(
  url: string,
  method: string = 'POST',
  body?: any,
  headers?: Record<string, string>
) {
  try {
    console.log(`Calling external API at: ${url}`);
    console.log(`Method: ${method}`);
    if (body) {
      console.log(`Request body:`, body);
    }

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`External API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      
      // Try to parse as JSON, fallback to plain text
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = {
          ackCode: 0,
          ackMessage: `External API error: ${response.status} ${response.statusText}`,
          jsonResult: null
        };
      }
      
      return {
        success: false,
        data: errorData,
        status: response.status
      };
    }
    
    // Parse and return the response
    const responseData = await response.json();
    console.log('External API response data:', responseData);
    
    return {
      success: true,
      data: responseData,
      status: response.status
    };
  } catch (error: any) {
    console.error('Error calling external API:', error);
    
    // Check if it's a connection refused error or timeout
    const isConnectionRefused = error instanceof Error && 
      (error.message.includes('ECONNREFUSED') || 
       error.message.includes('fetch failed') ||
       error.message.includes('network timeout') ||
       error.name === 'AbortError');
    
    if (isConnectionRefused) {
      console.log('Connection refused or timeout, returning fallback response');
      return {
        success: false,
        data: { 
          ackCode: 0, 
          ackMessage: "Failed to connect to external API: Connection refused or timeout",
          jsonResult: null
        },
        status: 503
      };
    }
    
    return {
      success: false,
      data: { 
        ackCode: 0, 
        ackMessage: `Server error: ${error.message}`,
        jsonResult: null
      },
      status: 500
    };
  }
}

/**
 * Helper function to create a standardized error response
 * @param message Error message
 * @param status HTTP status code
 * @returns NextResponse with error details
 */
export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { 
      ackCode: 0, 
      ackMessage: message,
      jsonResult: null
    },
    { status }
  );
}
