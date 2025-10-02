/**
 * Converts a number to its word representation
 * @param num The number to convert to words
 * @returns The word representation of the number
 */
export function numberToWords(num: number | string): string {
  if (num === undefined || num === null) return '';
  
  // Convert to number if string
  const amount = typeof num === 'string' ? parseFloat(num) : num;
  
  // Handle invalid input
  if (isNaN(amount)) return '';
  
  // Split into whole and decimal parts
  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);
  
  // Convert whole part to words
  const wholeWords = convertWholeNumber(wholePart);
  
  // If there's a decimal part, add it
  if (decimalPart > 0) {
    return `${wholeWords} and ${decimalPart}/100`;
  }
  
  return wholeWords;
}

/**
 * Helper function to convert whole numbers to words
 */
function convertWholeNumber(num: number): string {
  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 
                'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  // Handle zero
  if (num === 0) return 'zero';
  
  // Function to convert numbers less than 1000
  function convertLessThanOneThousand(n: number): string {
    if (n < 20) {
      return units[n];
    }
    
    const digit = n % 10;
    const ten = Math.floor(n / 10) % 10;
    const hundred = Math.floor(n / 100) % 10;
    
    let result = '';
    
    if (hundred > 0) {
      result += units[hundred] + ' hundred';
      if (ten > 0 || digit > 0) {
        result += ' and ';
      }
    }
    
    if (ten > 1) {
      result += tens[ten];
      if (digit > 0) {
        result += '-' + units[digit];
      }
    } else if (ten === 1) {
      result += units[10 + digit];
    } else if (digit > 0) {
      result += units[digit];
    }
    
    return result;
  }
  
  // Handle numbers in different ranges
  if (num < 1000) {
    return convertLessThanOneThousand(num);
  }
  
  const trillion = Math.floor(num / 1000000000000);
  const billion = Math.floor((num % 1000000000000) / 1000000000);
  const million = Math.floor((num % 1000000000) / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;
  
  let result = '';
  
  if (trillion > 0) {
    result += convertLessThanOneThousand(trillion) + ' trillion ';
  }
  
  if (billion > 0) {
    result += convertLessThanOneThousand(billion) + ' billion ';
  }
  
  if (million > 0) {
    result += convertLessThanOneThousand(million) + ' million ';
  }
  
  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + ' thousand ';
  }
  
  if (remainder > 0) {
    // Add 'and' only if there's a remainder and some higher denomination
    if (trillion > 0 || billion > 0 || million > 0 || thousand > 0) {
      result += 'and ';
    }
    result += convertLessThanOneThousand(remainder);
  }
  
  return result.trim();
}
