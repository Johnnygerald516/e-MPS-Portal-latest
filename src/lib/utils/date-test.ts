/**
 * This file contains test functions for date handling in the application
 * It can be imported in any component to test date formatting and parsing
 */

/**
 * Format a date value to YYYY-MM-DD format for API
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
 * Test date formatting with different input formats
 */
export function testDateFormatting() {
  const testCases = [
    { input: '2023-01-15', expected: '2023-01-15' },
    { input: '15/01/2023', expected: '2023-01-15' },
    { input: 'January 15, 2023', expected: '2023-01-15' },
    { input: new Date(2023, 0, 15), expected: '2023-01-15' },
    { input: '', expected: '' },
    { input: undefined, expected: '' },
  ];
  
  console.log('=== Testing Date Formatting ===');
  testCases.forEach((testCase, index) => {
    const result = formatDateForApi(testCase.input);
    const passed = result === testCase.expected;
    console.log(`Test ${index + 1}: ${passed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Input: ${testCase.input}`);
    console.log(`  Result: ${result}`);
    console.log(`  Expected: ${testCase.expected}`);
  });
}

/**
 * Test localStorage date handling
 */
export function testLocalStorageDateHandling() {
  console.log('=== Testing localStorage Date Handling ===');
  
  // Get current values
  const currentValues = {
    formatted: localStorage.getItem('verification_dob_formatted'),
    raw: localStorage.getItem('verification_dob'),
    original: localStorage.getItem('verification_dob_raw')
  };
  
  console.log('Current localStorage values:');
  console.log(currentValues);
  
  // Test retrieving and formatting
  const formattedDob = currentValues.formatted || '';
  const rawDob = formatDateForApi(currentValues.raw || '');
  const originalDob = formatDateForApi(currentValues.original || '');
  
  console.log('Formatted values:');
  console.log({
    formattedDob,
    rawDob,
    originalDob
  });
  
  // Return the best value based on priority
  const bestValue = formattedDob || rawDob || originalDob;
  console.log('Best value to use:', bestValue);
  
  return bestValue;
}
