/**
 * Helper functions for safe dropdown operations
 */

/**
 * Safe string comparison that handles null/undefined values
 */
export const safeStringCompare = (a: any, b: any): boolean => {
  if (a === undefined || a === null || b === undefined || b === null) {
    return false;
  }
  try {
    return String(a).toLowerCase() === String(b).toLowerCase();
  } catch (error) {
   return false;
  }
};

/**
 * Safely find an option by value in a dropdown options array
 */
export const findOptionByValue = <T extends { value: string; id: number; label: string }>(
  options: T[], 
  value: string
): T | undefined => {
  if (!value || !options || !options.length) {
    return undefined;
  }
  
  return options.find(opt => opt && opt.value && safeStringCompare(opt.value, value));
};

/**
 * Handle dropdown selection change with safe value handling
 */
export const handleDropdownChange = <T extends { value: string; id: number; label: string }>(
  value: string,
  options: T[],
  onChangeField: (value: string) => void,
  setIdField: (id: number) => void,
  setNameField: (name: string) => void,
  onSelect?: (option: T) => void
): void => {
  if (!value) {
    onChangeField('');
    setIdField(0);
    setNameField('');
    return;
  }
  
  const selectedOption = findOptionByValue(options, value);
  
  if (selectedOption) {
    onChangeField(value);
    setIdField(selectedOption.id);
    setNameField(selectedOption.value);
    
    if (onSelect) {
      onSelect(selectedOption);
    }
  } else {
    onChangeField(value);
    setIdField(0);
    setNameField('');
  }
};
