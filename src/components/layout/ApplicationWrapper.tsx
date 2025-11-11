"use client";

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApplication } from '@/contexts/application-context';
import { PageWrapper } from './page-wrapper';

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
    <PageWrapper variant="pop">
      {children}
    </PageWrapper>
  );
}
