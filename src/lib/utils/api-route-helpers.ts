/**
 * API Route Helper Functions
 * 
 * This file contains helper functions for API routes to interact with external APIs.
 */

import { NextResponse } from "next/server";
import { ensureHttps, isLocalUrl } from "@/lib/config/api-config";

/**
 * Get the external API URL from environment variables
 * @returns The external API URL or throws an error if not configured
 */
export function getExternalApiUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (!rawUrl) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
  }
  // For local URLs, return as-is; for production, ensure HTTPS
  if (isLocalUrl(rawUrl)) {
    console.log('[api-route-helpers] Local URL detected:', rawUrl);
    return rawUrl;
  }
  return ensureHttps(rawUrl);
}

/**
 * Builds a correct API endpoint URL by combining the base URL with the endpoint path
 * @param endpoint The API endpoint path
 * @returns The complete API URL
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getExternalApiUrl();
  
  // Remove any leading slash from the endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // If the endpoint already contains 'applications', don't add it again
  if (cleanEndpoint.startsWith('applications/')) {
    return `${baseUrl}/${cleanEndpoint}`;
  }
  
  return `${baseUrl}/${cleanEndpoint}`;
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
    // Ensure the URL uses HTTPS
    const secureUrl = ensureHttps(url);

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    let response = await fetch(secureUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      redirect: 'manual' // Handle redirects manually to prevent protocol downgrades
    });
    
    clearTimeout(timeoutId);
    
    // Handle redirects manually to ensure HTTPS protocol
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        console.log('Redirect detected:', redirectUrl);
        const secureRedirectUrl = ensureHttps(redirectUrl);
        console.log('Following redirect with HTTPS:', secureRedirectUrl);
        
        const redirectController = new AbortController();
        const redirectTimeoutId = setTimeout(() => redirectController.abort(), 10000);
        
        response = await fetch(secureRedirectUrl, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: redirectController.signal
        });
        
        clearTimeout(redirectTimeoutId);
      }
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      
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
   return {
      success: true,
      data: responseData,
      status: response.status
    };
  } catch (error: any) {
    const isConnectionRefused = error instanceof Error && 
      (error.message.includes('ECONNREFUSED') || 
       error.message.includes('fetch failed') ||
       error.message.includes('network timeout') ||
       error.name === 'AbortError');
    
    if (isConnectionRefused) {
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
