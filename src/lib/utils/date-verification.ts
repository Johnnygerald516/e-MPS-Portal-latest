/**
 * This file contains verification functions for date handling between verification dialog and basic-info page
 */

import { formatDateForApi, formatDateForDisplay, parseDateString, getBestDateValue } from './date-utils';

/**
 * Verify that the date of birth is properly passed from verification dialog to basic-info page
 * 
 * This function should be called in the browser console to test the data flow
 */
export function verifyDateOfBirthFlow(): void {
  console.group('Date of Birth Verification');
  
  // Check application context
  console.log('Checking application context...');
  try {
    // @ts-ignore - Access window.__NEXT_DATA__ to get application context
    const state = window.__NEXT_DATA__?.props?.pageProps?.state;
    if (state?.formData) {
      console.log('Found formData in application context:', {
        dateOfBirth: state.formData.dateOfBirth,
        formattedDateOfBirth: state.formData.formattedDateOfBirth,
        displayDateOfBirth: state.formData.displayDateOfBirth
      });
    } else {
      console.warn('No formData found in application context');
    }
  } catch (e) {
    console.error('Error accessing application context:', e);
  }
  
  // Check localStorage
  console.log('Checking localStorage...');
  try {
    const rawDob = localStorage.getItem('verification_dob_raw');
    const formattedDob = localStorage.getItem('verification_dob_formatted');
    const displayDob = localStorage.getItem('verification_dob_display');
    const simpleDob = localStorage.getItem('verification_dob');
    const allFormatsJson = localStorage.getItem('verification_dob_all');
    
    console.log('localStorage values:', {
      raw: rawDob,
      formatted: formattedDob,
      display: displayDob,
      simple: simpleDob,
      all: allFormatsJson ? JSON.parse(allFormatsJson) : null
    });
    
    // Test formatDateForApi with each value
    console.log('Testing formatDateForApi with each value:');
    if (rawDob) console.log('Raw DOB formatted:', formatDateForApi(rawDob));
    if (formattedDob) console.log('Formatted DOB formatted:', formatDateForApi(formattedDob));
    if (displayDob) console.log('Display DOB formatted:', formatDateForApi(displayDob));
    if (simpleDob) console.log('Simple DOB formatted:', formatDateForApi(simpleDob));
    
    // Get best value
    const bestValue = getBestDateValue(
      formattedDob || '',
      simpleDob || '',
      rawDob || ''
    );
    console.log('Best value from localStorage:', bestValue);
    
  } catch (e) {
    console.error('Error checking localStorage:', e);
  }
  
  // Check form value in basic-info page
  console.log('Checking form value in basic-info page...');
  try {
    // Find the date of birth input
    const dateInput = document.querySelector('input[id*="dateOfBirth"]') as HTMLInputElement;
    if (dateInput) {
      console.log('Date input value:', dateInput.value);
    } else {
      console.warn('Date input not found in the page');
    }
  } catch (e) {
    console.error('Error checking form value:', e);
  }
  
  console.groupEnd();
}

/**
 * Test the date utility functions with various input formats
 */
export function testDateUtilityFunctions(): void {
  console.group('Date Utility Functions Test');
  
  const testCases = [
    { input: '2023-01-15', label: 'ISO format (YYYY-MM-DD)' },
    { input: '15/01/2023', label: 'DD/MM/YYYY format' },
    { input: 'January 15, 2023', label: 'Month DD, YYYY format' },
    { input: new Date(2023, 0, 15), label: 'Date object' },
    { input: '15-01-2023', label: 'DD-MM-YYYY format' },
    { input: '2023/01/15', label: 'YYYY/MM/DD format' },
  ];
  
  console.log('Testing formatDateForApi:');
  testCases.forEach(testCase => {
    const result = formatDateForApi(testCase.input);
    console.log(`${testCase.label}: ${testCase.input} → ${result}`);
  });
  
  console.log('\nTesting formatDateForDisplay:');
  testCases.forEach(testCase => {
    const result = formatDateForDisplay(testCase.input);
    console.log(`${testCase.label}: ${testCase.input} → ${result}`);
  });
  
  console.log('\nTesting parseDateString:');
  testCases.forEach(testCase => {
    if (typeof testCase.input === 'string') {
      const result = parseDateString(testCase.input);
      console.log(`${testCase.label}: ${testCase.input} → ${result}`);
    }
  });
  
  console.groupEnd();
}

/**
 * Instructions for testing the date of birth flow
 */
export function showTestingInstructions(): void {
  console.group('Testing Instructions');
  console.log(`
To test the date of birth flow:

1. Open the browser console (F12 or right-click > Inspect > Console)
2. Import the verification functions:
   import { verifyDateOfBirthFlow, testDateUtilityFunctions } from '@/lib/utils/date-verification';

3. Go to the home page and start a new application
4. In the verification dialog, enter a date of birth
5. After successful verification, run the verification function:
   verifyDateOfBirthFlow();

6. Check the console output to see if the date of birth is properly passed

You can also test the date utility functions:
   testDateUtilityFunctions();
`);
  console.groupEnd();
}

// Export a default function for easy access
export default function verifyDateFlow(): void {
  showTestingInstructions();
  verifyDateOfBirthFlow();
  testDateUtilityFunctions();
}
