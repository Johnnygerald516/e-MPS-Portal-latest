// This script simulates a user session to test the session management system

// Import the necessary modules
const fs = require('fs');
const path = require('path');

// Function to simulate localStorage
const localStorage = {
  _data: {},
  setItem: function(key, value) {
    this._data[key] = value;
  },
  getItem: function(key) {
    return this._data[key] || null;
  },
  removeItem: function(key) {
    delete this._data[key];
  },
  clear: function() {
    this._data = {};
  }
};

// Simulate the session management functions
function createApplicationSession(sessionData) {
  // Ensure required fields are present
  if (!sessionData.applicationId) {
    console.error('Cannot create session: applicationId is required');
    return;
  }

  // Create session with current timestamp
  const session = {
    applicationId: sessionData.applicationId,
    applicationType: sessionData.applicationType || 'new',
    verified: true,
    verificationDate: new Date().toISOString(),
    mobileNumber: sessionData.mobileNumber,
    dateOfBirth: sessionData.dateOfBirth,
    subjectId: sessionData.subjectId,
    region: sessionData.region,
    currentStep: sessionData.currentStep || 20
  };

  // Store session in localStorage
  localStorage.setItem('emps_application_session', JSON.stringify(session));
  localStorage.setItem('emps_verification_status', 'true');
  
  // Set session expiration (24 hours)
  const expirationTime = new Date();
  expirationTime.setHours(expirationTime.getHours() + 24);
  localStorage.setItem('emps_session_expiry', expirationTime.toISOString());
  
  console.log('Application session created successfully');
  return session;
}

function getApplicationSession() {
  try {
    const sessionData = localStorage.getItem('emps_application_session');
    if (!sessionData) return null;
    
    // Check session expiration
    const expiryTime = localStorage.getItem('emps_session_expiry');
    if (expiryTime && new Date(expiryTime) < new Date()) {
      // Session expired
      clearApplicationSession();
      return null;
    }
    
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Failed to retrieve application session:', error);
    return null;
  }
}

function isApplicationVerified() {
  try {
    const verified = localStorage.getItem('emps_verification_status');
    const session = getApplicationSession();
    return verified === 'true' && !!session;
  } catch (error) {
    return false;
  }
}

function updateApplicationSession(updates) {
  try {
    const currentSession = getApplicationSession();
    if (!currentSession) {
      console.error('Cannot update: No active application session');
      return;
    }
    
    const updatedSession = { ...currentSession, ...updates };
    localStorage.setItem('emps_application_session', JSON.stringify(updatedSession));
    console.log('Application session updated successfully');
    return updatedSession;
  } catch (error) {
    console.error('Failed to update application session:', error);
  }
}

// Test the session management system
console.log('Starting session management test...');

// Step 1: Create a new session after verification
console.log('\nStep 1: Create a new session after verification');
const initialSession = createApplicationSession({
  applicationId: 'TEST-APP-123',
  applicationType: 'new',
  mobileNumber: '0712345678',
  dateOfBirth: '1990-01-01',
  subjectId: 'ABC123',
  region: 'dar_es_salaam',
  currentStep: 20
});
console.log('Initial session:', initialSession);

// Step 2: Verify the session is active
console.log('\nStep 2: Verify the session is active');
console.log('Is application verified:', isApplicationVerified());
console.log('Current session:', getApplicationSession());

// Step 3: Update the session as user progresses through the application
console.log('\nStep 3: Update session as user progresses');
const steps = [
  { step: 30, name: 'residence-info' },
  { step: 40, name: 'parents-info' },
  { step: 50, name: 'dependants-info' },
  { step: 60, name: 'documents' },
  { step: 70, name: 'declaration' },
  { step: 80, name: 'complete' }
];

for (const { step, name } of steps) {
  console.log(`\nUpdating to step ${step} (${name})`);
  const updatedSession = updateApplicationSession({ currentStep: step });
  console.log('Updated session:', updatedSession);
}

console.log('\nSession management test completed successfully!');
