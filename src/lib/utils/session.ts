/**
 * Session management utilities for eMPS Portal
 * Handles application session storage and verification
 */

// Session data interface
export interface ApplicationSession {
  applicationId: string;
  applicationType: string;
  verified: boolean;
  verificationDate: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  subjectId?: string;
  region?: string;
  currentStep?: number;
}

// Session storage keys
const SESSION_KEY = 'emps_application_session';
const SESSION_VERIFIED_KEY = 'emps_verification_status';

/**
 * Create a new application session after successful verification
 */
export function createApplicationSession(sessionData: Partial<ApplicationSession>): void {
  // Ensure required fields are present
  if (!sessionData.applicationId) {
   return;
  }

  // Create session with current timestamp
  const session: ApplicationSession = {
    applicationId: sessionData.applicationId,
    applicationType: sessionData.applicationType || 'new',
    verified: true,
    verificationDate: new Date().toISOString(),
    mobileNumber: sessionData.mobileNumber,
    dateOfBirth: sessionData.dateOfBirth,
    subjectId: sessionData.subjectId,
    region: sessionData.region
  };

  try {
    // Store session in localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_VERIFIED_KEY, 'true');
    
    // Set session expiration (24 hours)
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24);
    localStorage.setItem('emps_session_expiry', expirationTime.toISOString());
    
   
  } catch (error) {
   
  }
}

/**
 * Get the current application session
 */
export function getApplicationSession(): ApplicationSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    // Check session expiration
    const expiryTime = localStorage.getItem('emps_session_expiry');
    if (expiryTime && new Date(expiryTime) < new Date()) {
      // Session expired
      clearApplicationSession();
      return null;
    }
    
    return JSON.parse(sessionData) as ApplicationSession;
  } catch (error) {
    return null;
  }
}

/**
 * Check if the user has a verified application session
 */
export function isApplicationVerified(): boolean {
  try {
    const verified = localStorage.getItem(SESSION_VERIFIED_KEY);
    const session = getApplicationSession();
    const isValid = verified === 'true' && !!session;
    
    // Auto-extend session if it's valid
    if (isValid) {
      extendApplicationSession();
    }
    
    return isValid;
  } catch (error) {
    return false;
  }
}

/**
 * Check if the session is about to expire (within the next hour)
 */
export function isSessionAboutToExpire(): boolean {
  try {
    const expiryTime = localStorage.getItem('emps_session_expiry');
    if (!expiryTime) return true;
    
    const expiry = new Date(expiryTime);
    const now = new Date();
    
    // Check if session expires within the next hour
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return expiry < oneHourFromNow;
  } catch (error) {
    return true;
  }
}

/**
 * Update an existing application session
 */
export function updateApplicationSession(updates: Partial<ApplicationSession>): void {
  try {
    const currentSession = getApplicationSession();
    if (!currentSession) {
     return;
    }
    
    const updatedSession = { ...currentSession, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
   
  } catch (error) {
   
  }
}

/**
 * Clear the application session
 */
export function clearApplicationSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_VERIFIED_KEY);
    localStorage.removeItem('emps_session_expiry');
   
  } catch (error) {
   
  }
}

/**
 * Extend the current session expiration time
 */
export function extendApplicationSession(hoursToAdd: number = 24): void {
  try {
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + hoursToAdd);
    localStorage.setItem('emps_session_expiry', expirationTime.toISOString());
   
  } catch (error) {
   
  }
}
