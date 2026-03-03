/**
 * API Configuration
 * 
 * This file centralizes all API configuration settings.
 * All API URLs should be derived from environment variables defined here.
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
 * Get the main API URL from environment variables
 * @returns The API URL with fallback to development URL
 */
export function getApiUrl(): string {
  // Always use the production API URL as fallback
  const productionApiUrl = 'https://migrantonline.immigration.go.tz/api';
  
  // Use environment variable with fallback to production URL
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Log the API URL for debugging
  console.log('[api-config] NEXT_PUBLIC_API_URL:', apiUrl);
  console.log('[api-config] Production API URL:', productionApiUrl);
  
  if (!apiUrl) {
    console.warn('[api-config] NEXT_PUBLIC_API_URL is not defined in environment variables');
    // Return production API URL as final fallback
    return productionApiUrl;
  }
  
  // For local development URLs, don't force HTTPS
  if (isLocalUrl(apiUrl)) {
    console.log('[api-config] Local development URL detected, keeping as-is:', apiUrl);
    return apiUrl;
  }
  
  // For production URLs, ensure HTTPS protocol
  if (apiUrl.startsWith('http://')) {
    console.warn('[api-config] Converting http:// to https://');
    apiUrl = apiUrl.replace('http://', 'https://');
  } else if (!apiUrl.startsWith('https://')) {
    console.warn('[api-config] Adding https:// protocol to URL');
    apiUrl = 'https://' + apiUrl;
  }
  
  console.log('[api-config] Final API URL:', apiUrl);
  
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
 * Ensure a URL uses https:// protocol (except for local development URLs)
 * @param url The URL to check and convert
 * @returns The URL with https:// protocol (or http:// for localhost/127.0.0.1)
 */
export function ensureHttps(url: string): string {
  if (!url) return url;
  
  // For local development URLs, don't force HTTPS
  if (isLocalUrl(url)) {
    console.log('[ensureHttps] Local URL detected, keeping protocol as-is:', url);
    // Ensure it has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'http://' + url;
    }
    return url;
  }
  
  // Convert http:// to https:// for production URLs
  if (url.startsWith('http://')) {
    console.warn('[ensureHttps] Converting http:// to https://');
    return url.replace('http://', 'https://');
  }
  
  // Add https:// if no protocol
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    console.warn('[ensureHttps] Adding https:// protocol');
    return 'https://' + url;
  }
  
  return url;
}

/**
 * Build a complete API URL with guaranteed https:// protocol
 * @param path The API path (e.g., '/applications/lookup')
 * @returns Complete API URL with https:// protocol
 */
export function buildApiUrl(path: string): string {
  const baseUrl = ensureHttps(apiConfig.baseUrl);
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * API configuration object
 */
export const apiConfig = {
  baseUrl: getApiUrl(), // getApiUrl already handles protocol correctly
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
  '127.0.0.1',
  // Read additional trusted hostnames from environment variables if available
  ...(process.env.NEXT_PUBLIC_TRUSTED_HOSTNAMES?.split(',') || [])
];

/**
 * Get the API URL for use in API routes
 * Handles local development URLs (keeps HTTP) vs production URLs (ensures HTTPS)
 * @param fallback Optional fallback URL if env variable is not set
 * @returns The API URL with correct protocol
 */
export function getApiUrlForRoute(fallback: string = 'https://migrantonline.immigration.go.tz/api'): string {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || fallback;
  // For local URLs, return as-is; for production, ensure HTTPS
  if (isLocalUrl(rawUrl)) {
    console.log('[getApiUrlForRoute] Local URL detected:', rawUrl);
    return rawUrl;
  }
  return ensureHttps(rawUrl);
}
