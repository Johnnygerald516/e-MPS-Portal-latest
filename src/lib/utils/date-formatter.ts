/**
 * Safely formats a date string to a localized format
 * @param dateString The date string to format
 * @param format The format to use (default: 'en-US')
 * @returns The formatted date string or a fallback message if invalid
 */
export function safeFormatDate(dateString?: string, format: string = 'en-US'): string {
  if (!dateString) return 'Not specified';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format the date
    return date.toLocaleDateString(format, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
}
