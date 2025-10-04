"use client";

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApplication } from '@/contexts/application-context';

interface ApplicationWrapperProps {
  children: ReactNode;
}

/**
 * ApplicationWrapper component
 * 
 * This component wraps all application pages and provides navigation based on the current step
 */
export default function ApplicationWrapper({ children }: ApplicationWrapperProps) {
  const { formData } = useApplication();
  const router = useRouter();

  // Store the last navigation path to prevent infinite redirects
  const lastNavigationPathRef = React.useRef<string | null>(null);

  // Store the previous step to detect changes
  const prevStepRef = React.useRef<number | undefined>(formData.currentStep);
  
  // DISABLED: Automatic navigation based on current step
  // This was causing issues with page refreshes redirecting to /application
  // Now we rely on explicit navigation after form submissions instead
  
  // For debugging purposes only - log the current path and step
  React.useEffect(() => {
    const currentPath = window.location.pathname;
     if (typeof window !== 'undefined' && window.performance && window.performance.navigation) {
    }
  }, [formData.applicationId, formData.currentStep]);
  
  // Add a special effect that runs only once on mount to detect page refreshes
  React.useEffect(() => {
   if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      localStorage.setItem('lastPath', currentPath);
    }
  }, []);
  
  return (
    <>
      {children}
    </>
  );
}
