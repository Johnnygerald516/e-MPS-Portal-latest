/**
 * API Configuration - CENTRALIZED
 * 
 * This file is the SINGLE SOURCE OF TRUTH for API configuration.
 * All API URLs are read from the .env file via NEXT_PUBLIC_API_URL.
 * 
 * NO hardcoded URLs - everything comes from environment variables.
 * See env.example for required environment variables.
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
 * @returns The API URL from .env file (NEXT_PUBLIC_API_URL)
 * @throws Error if NEXT_PUBLIC_API_URL is not defined
 */
export function getApiUrl(): string {
  // Get API URL from environment variable - SINGLE SOURCE OF TRUTH
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined in .env file. Please set it before starting the application.');
  }
  
  // For local development URLs, don't force HTTPS
  if (isLocalUrl(apiUrl)) {
    return apiUrl;
  }
  
  // For production URLs, ensure HTTPS protocol
  if (apiUrl.startsWith('http://')) {
    apiUrl = apiUrl.replace('http://', 'https://');
  } else if (!apiUrl.startsWith('https://')) {
    apiUrl = 'https://' + apiUrl;
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
 * Ensure a URL uses https:// protocol (except for local development URLs)
 * @param url The URL to check and convert
 * @returns The URL with https:// protocol (or http:// for localhost/127.0.0.1)
 */
export function ensureHttps(url: string): string {
  if (!url) return url;
  
  // For local development URLs, don't force HTTPS
  if (isLocalUrl(url)) {
    // Ensure it has a protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'http://' + url;
    }
    return url;
  }
  
  // Convert http:// to https:// for production URLs
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // Add https:// if no protocol
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
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
 * @returns The API URL with correct protocol from .env file
 * @throws Error if NEXT_PUBLIC_API_URL is not defined
 */
export function getApiUrlForRoute(): string {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!rawUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined in .env file. Please set it before starting the application.');
  }
  
  // For local URLs, return as-is; for production, ensure HTTPS
  if (isLocalUrl(rawUrl)) {
    return rawUrl;
  }
  return ensureHttps(rawUrl);
}
