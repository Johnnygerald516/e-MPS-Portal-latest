# Session Management Implementation

This document describes the session management system implemented for the eMPS Portal application pages.

## Overview

The session management system ensures that:

1. Users can only access application pages after successful verification
2. Application progress is tracked across pages
3. Users are redirected to the appropriate page based on their progress
4. Sessions expire after a period of inactivity
5. Users are warned when their session is about to expire

## Components

### 1. Session Utilities (`src/lib/utils/session.ts`)

Core functions for session management:

- `createApplicationSession()`: Creates a new session after successful verification
- `getApplicationSession()`: Retrieves the current session
- `isApplicationVerified()`: Checks if the user has a verified session
- `updateApplicationSession()`: Updates an existing session
- `clearApplicationSession()`: Clears the session
- `extendApplicationSession()`: Extends the session expiration time
- `isSessionAboutToExpire()`: Checks if the session is about to expire

### 2. Session Protection Component (`src/components/application/SessionProtection.tsx`)

A wrapper component that:

- Verifies the user has an active session
- Redirects to the verification page if no session exists
- Ensures users can only access pages in the correct sequence
- Updates the application context with session data

### 3. Application Progress Utilities (`src/lib/utils/application-progress.ts`)

Functions to manage application progress:

- `canAccessStep()`: Checks if a user can access a specific step
- `getRouteForStep()`: Gets the route for a specific step
- `getStepForRoute()`: Gets the step for a specific route
- `getNextStep()`: Gets the next step in the application process
- `getPreviousStep()`: Gets the previous step in the application process

### 4. Session Expiry Warning Component (`src/components/application/SessionExpiryWarning.tsx`)

A component that:

- Monitors session expiration time
- Shows a warning when the session is about to expire
- Allows users to extend their session

### 5. Application Wrapper (`src/components/layout/ApplicationWrapper.tsx`)

A wrapper component that:

- Initializes the application context with session data
- Monitors session status
- Includes the SessionExpiryWarning component

## Implementation Details

### Step Progression

Each application page updates the `currentStep` property in the application context when navigating to the next page:

1. Verification (10) → Basic Info (20)
2. Basic Info (20) → Residence Info (30)
3. Residence Info (30) → Parents Info (40)
4. Parents Info (40) → Dependants Info (50)
5. Dependants Info (50) → Documents (60)
6. Documents (60) → Declaration (70)
7. Declaration (70) → Complete (80)

### Session Storage

Sessions are stored in localStorage with the following keys:

- `emps_application_session`: The session data
- `emps_verification_status`: Whether the session is verified
- `emps_session_expiry`: The session expiration time

## Testing

A test script (`test_session.js`) is provided to verify the session management system is working correctly.

## Security Considerations

- Sessions expire after 24 hours of inactivity
- Users are warned when their session is about to expire
- Sessions are tied to a specific application ID
- Sensitive data is not stored in the session

## Future Improvements

- Add server-side session validation
- Implement more robust session security measures
- Add session timeout configuration options
- Improve session recovery after browser refresh
