/**
 * Fix for duplicate keys in nationality dropdown
 * 
 * The issue is that there are duplicate nationality values in the API response,
 * specifically "DOMINICAN" appears twice with different IDs.
 * 
 * To fix this, we need to:
 * 1. Find the SelectItem components in the residence-info page that use nationalityOptions
 * 2. Update the key prop to use a combination of value and id
 * 
 * Find these lines in the page.tsx file:
 * 
 * nationalityOptions.map((option) => (
 *   <SelectItem key={option.id} value={option.value}>
 *     {option.label}
 *   </SelectItem>
 * ))
 * 
 * And replace them with:
 * 
 * nationalityOptions.map((option) => (
 *   <SelectItem key={`${option.value}_${option.id}`} value={option.value}>
 *     {option.label}
 *   </SelectItem>
 * ))
 * 
 * This ensures that each SelectItem has a unique key, even if the value is the same.
 */

// Example implementation for processNationalityOptions function
function processNationalityOptions(options) {
  return options.map(option => ({
    ...option,
    // Add a unique key for React
    key: `${option.value}_${option.id}`
  }));
}
