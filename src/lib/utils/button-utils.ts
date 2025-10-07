/**
 * Button utilities for consistent behavior across the application
 */

/**
 * Returns loading button props with extended spin time for "Hifadhi na Endelea" buttons
 * 
 * @param text The button text or loading text
 * @param isLoading Whether the button is loading
 * @returns Props object for LoadingButton component
 */
export function getExtendedSpinTimeProps(text?: string, isLoading = false) {
  const isHifadhiButton = 
    text === "Hifadhi na Endelea" || 
    text?.includes("Hifadhi") ||
    text?.includes("Save and Continue");
    
  return {
    extendedSpinTime: isHifadhiButton,
    loadingText: text?.includes("Hifadhi") ? 
      "Inahifadhi..." : 
      "Loading...",
    isLoading,
    // Ensure consistent width for better UX
    className: isHifadhiButton ? "min-w-[180px]" : ""
  };
}

/**
 * Returns navigation delay for "Hifadhi na Endelea" buttons
 * This ensures the spinner shows for a reasonable time before navigation
 * 
 * @param text The button text
 * @returns Navigation delay in milliseconds
 */
export function getNavigationDelay(text?: string) {
  const isHifadhiButton = 
    text === "Hifadhi na Endelea" || 
    text?.includes("Hifadhi") ||
    text?.includes("Save and Continue");
    
  return isHifadhiButton ? 1500 : 300;
}
