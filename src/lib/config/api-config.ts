/**
 * API Configuration
 * 
 * This file centralizes all API configuration settings.
 * All API URLs should be derived from environment variables defined here.
 */

/**
 * Get the main API URL from environment variables
 * @returns The API URL with fallback to development URL
 */
export function getApiUrl(): string {
  // Use environment variable with fallback
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const fallbackUrl = process.env.NEXT_PUBLIC_API_URL_FALLBACK || '';
  
  // Log the API URL for debugging
  console.log('[api-config] NEXT_PUBLIC_API_URL:', apiUrl);
  console.log('[api-config] NEXT_PUBLIC_API_URL_FALLBACK:', fallbackUrl);
  
  if (!apiUrl) {
    console.warn('[api-config] NEXT_PUBLIC_API_URL is not defined in environment variables');
    
    // Use fallback if available
    if (fallbackUrl) {
      console.log('[api-config] Using fallback API URL:', fallbackUrl);
      return fallbackUrl;
    }
    
    // Return empty string to trigger fallback in consuming code
    return '';
  }
  
  return apiUrl;
}

/**
 * Get the API key from environment variables
 * @returns The API key with fallback to development key
 */
export function getApiKey(): string {
  return process.env.NEXT_PUBLIC_API_KEY || '';
}

/**
 * Check if a URL is valid
 * @param url The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * API configuration object
 */
export const apiConfig = {
  baseUrl: getApiUrl(),
  apiKey: getApiKey(),
  timeout: 30000, // 30 seconds
  withCredentials: true,
};

/**
 * List of trusted hostnames to prevent recursive API calls
 * These hostnames are used to prevent recursive API calls
 * Add any additional trusted hostnames to this list
 */
export const trustedHostnames = [
  'localhost',
  '10.6.0.168',
  // Read additional trusted hostnames from environment variables if available
  ...(process.env.NEXT_PUBLIC_TRUSTED_HOSTNAMES?.split(',') || [])
];
