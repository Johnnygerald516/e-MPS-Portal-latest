/**
 * API URL Helper Functions
 * 
 * This file contains utility functions for working with API URLs.
 * All URLs come from .env file - NO hardcoded fallbacks.
 */

/**
 * Check if a URL is a local development URL
 * @param url The URL to check
 * @returns True if the URL is for localhost or 127.0.0.1
 */
export function isLocalUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/**
 * Gets the API URL from environment variables
 * @returns The API URL from .env file
 * @throws Error if NEXT_PUBLIC_API_URL is not defined
 */
export function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined in .env file. Please set it before starting the application.');
  }
  console.log('[api-url-helper] Using NEXT_PUBLIC_API_URL:', envUrl);
  return envUrl;
}

/**
 * Builds a proper API endpoint URL by combining the base API URL with the endpoint path
 * @param endpoint The API endpoint path (e.g., 'applications/lookup')
 * @returns The complete API URL
 */
export function buildApiEndpointUrl(endpoint: string): string {
  const baseUrl = getApiUrl();
  
  // Remove any leading slash from the endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  return `${baseUrl}/${cleanEndpoint}`;
}
