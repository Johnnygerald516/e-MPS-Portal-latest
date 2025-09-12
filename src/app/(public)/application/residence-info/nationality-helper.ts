/**
 * Helper functions for handling nationality data
 */

/**
 * Interface for nationality option objects
 */
export interface NationalityOption {
  value: string;
  label: string;
  id: number;
  key?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Process nationality options to ensure each has a unique value and key
 * This solves the React duplicate key error by modifying the value for duplicates
 * @param options The original nationality options from API
 * @returns Processed options with unique values and keys
 */
export const processNationalityOptions = (options: NationalityOption[]): NationalityOption[] => {
  // First, filter out any invalid entries
  const validOptions = options.filter(option => 
    option && typeof option === 'object' && option.value && option.id
  );
  
  // Track values we've seen to identify duplicates
  const valueCount = new Map<string, number>();
  
  // First pass: count occurrences of each value
  validOptions.forEach(option => {
    const value = option.value;
    valueCount.set(value, (valueCount.get(value) || 0) + 1);
  });
  
  // Second pass: create unique options
  const result: NationalityOption[] = [];
  const processedValues = new Map<string, number>();
  
  validOptions.forEach(option => {
    const originalValue = option.value;
    const count = valueCount.get(originalValue) || 0;
    
    // Only modify values that have duplicates
    if (count > 1) {
      // Track how many times we've seen this value
      const occurrence = (processedValues.get(originalValue) || 0) + 1;
      processedValues.set(originalValue, occurrence);
      
      // Create a unique value for dropdown selection
      // But keep the original label for display
      const uniqueValue = `${originalValue}_${option.id}`;
      
      result.push({
        ...option,
        value: uniqueValue,  // Unique value for selection
        label: originalValue, // Original value for display
        key: uniqueValue     // Unique key for React
      });
    } else {
      // No duplicates, keep as is but add a key
      result.push({
        ...option,
        key: `${originalValue}_${option.id}`
      });
    }
  });
  
  return result;
};
