/**
 * API URL Helper Functions
 * 
 * This file contains utility functions for working with API URLs.
 */

/**
 * Get the production API URL
 * @returns The production API URL
 */
export const PRODUCTION_API_URL = 'https://migrantonline.immigration.go.tz/api';

/**
 * Gets the API URL from environment variables or uses the production URL as fallback
 * @returns The API URL to use
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL;
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
