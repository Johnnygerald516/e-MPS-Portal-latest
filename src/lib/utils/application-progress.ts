/**
 * Application progress utilities
 * Helps determine if a user can access specific application pages based on their progress
 */

import { ApplicationStep } from "@/contexts/application-context";

// Define the order of application steps
const applicationStepOrder: ApplicationStep[] = [
  10, // uthibitisho
  20, // basic-info
  30, // residence-info
  40, // parents-info
  50, // dependants-info
  60, // documents
  70, // declaration
  80  // complete
];

// Map step IDs to route paths
const stepRouteMap: Record<ApplicationStep, string> = {
  10: "/application", // Changed from verification to main application page
  20: "/application/basic-info",
  30: "/application/residence-info",
  40: "/application/parents-info",
  50: "/application/dependant-info", // Fixed path to match directory name
  60: "/application/documents",
  70: "/application/declaration",
  80: "/application/complete"
};

// Map route paths to step IDs
const routeStepMap: Record<string, ApplicationStep> = {
  "/application": 10, // Changed from verification to main application page
  "/application/basic-info": 20,
  "/application/residence-info": 30,
  "/application/parents-info": 40,
  "/application/dependant-info": 50, // Fixed path to match directory name
  "/application/documents": 60,
  "/application/declaration": 70,
  "/application/complete": 80
};

/**
 * Check if a user can access a specific application page based on their current step
 * @param currentStep The user's current application step
 * @param targetStep The step the user is trying to access
 * @returns boolean indicating if the user can access the target step
 */
export function canAccessStep(currentStep: ApplicationStep, targetStep: ApplicationStep): boolean {
  // Always allow access to verification step
  if (targetStep === 10) return true;
  
  // Get the indices of the current and target steps in the order array
  const currentIndex = applicationStepOrder.indexOf(currentStep);
  const targetIndex = applicationStepOrder.indexOf(targetStep);
  
  // If either step is not found in the order array, deny access
  if (currentIndex === -1 || targetIndex === -1) return false;
  
  // Allow access if the target step is the verification step, the current step, or any previous step
  return targetIndex <= currentIndex + 1;
}

/**
 * Get the route path for a specific application step
 * @param step The application step
 * @returns The route path for the step
 */
export function getRouteForStep(step: ApplicationStep): string {
  return stepRouteMap[step] || "/application";
}

/**
 * Get the application step for a specific route path
 * @param route The route path
 * @returns The application step for the route
 */
export function getStepForRoute(route: string): ApplicationStep {
  return routeStepMap[route] || 10;
}

/**
 * Get the next step in the application process
 * @param currentStep The current application step
 * @returns The next application step, or null if there is no next step
 */
export function getNextStep(currentStep: ApplicationStep): ApplicationStep | null {
  const currentIndex = applicationStepOrder.indexOf(currentStep);
  
  // If the current step is not found or is the last step, there is no next step
  if (currentIndex === -1 || currentIndex === applicationStepOrder.length - 1) {
    return null;
  }
  
  // Return the next step in the order array
  return applicationStepOrder[currentIndex + 1];
}

/**
 * Get the previous step in the application process
 * @param currentStep The current application step
 * @returns The previous application step, or null if there is no previous step
 */
export function getPreviousStep(currentStep: ApplicationStep): ApplicationStep | null {
  const currentIndex = applicationStepOrder.indexOf(currentStep);
  
  // If the current step is not found or is the first step, there is no previous step
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }
  
  // Return the previous step in the order array
  return applicationStepOrder[currentIndex - 1];
}
