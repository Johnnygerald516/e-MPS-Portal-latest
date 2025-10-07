/**
 * Utility functions for date handling in the application
 */

/**
 * Format a date value to YYYY-MM-DD format for API
 * @param dateValue - Date value to format (string, Date, or undefined)
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForApi(dateValue: string | Date | undefined): string {
  if (!dateValue) return '';
  
  try {
    // If it's already a valid ISO string (YYYY-MM-DD), use it directly
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    
    // If it's a Date object or another format, convert to YYYY-MM-DD
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Error formatting date:', e);
  }
  
  return typeof dateValue === 'string' ? dateValue : '';
}

/**
 * Format a date value to DD/MM/YYYY format for display
 * @param dateValue - Date value to format (string, Date, or undefined)
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDateForDisplay(dateValue: string | Date | undefined): string {
  if (!dateValue) return '';
  
  try {
    // Convert to Date object
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    
    if (!isNaN(date.getTime())) {
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    console.error('Error formatting date for display:', e);
  }
  
  return typeof dateValue === 'string' ? dateValue : '';
}

/**
 * Parse a date string from various formats into a Date object
 * @param dateString - Date string to parse
 * @returns Date object or undefined if parsing fails
 */
export function parseDateString(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined;
  
  try {
    // Try to parse as ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      return isValidDate(date) ? date : undefined;
    }
    
    // Try to parse as DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return isValidDate(date) ? date : undefined;
    }
    
    // Try standard Date parsing as fallback
    const date = new Date(dateString);
    return isValidDate(date) ? date : undefined;
  } catch (e) {
    console.error('Error parsing date string:', e);
    return undefined;
  }
}

/**
 * Check if a date is valid
 * @param date - Date to check
 * @returns True if date is valid, false otherwise
 */
export function isValidDate(date: Date | undefined): boolean {
  return !!date && !isNaN(date.getTime());
}

/**
 * Get the best date value from multiple sources
 * @param sources - Array of date values to check
 * @returns The first valid date value found, or undefined if none are valid
 */
export function getBestDateValue(...sources: (string | Date | undefined)[]): string | undefined {
  for (const source of sources) {
    if (source) {
      const formatted = formatDateForApi(source);
      if (formatted) {
        return formatted;
      }
    }
  }
  
  return undefined;
}
