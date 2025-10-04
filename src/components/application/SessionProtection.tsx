"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApplication, ApplicationStep } from "@/contexts/application-context";
import { canAccessStep, getStepForRoute, getRouteForStep } from "@/lib/utils/application-progress";
import { Loader2 } from "lucide-react";

interface SessionProtectionProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function SessionProtection({ 
  children, 
  redirectTo = "/application" 
}: SessionProtectionProps) {
  const router = useRouter();
  const { formData } = useApplication();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const pathname = usePathname();

  // Store the last navigation path to prevent infinite redirects
  const lastNavigationPathRef = React.useRef<string | null>(null);

  // Store whether this is an initial render (page refresh)
  const isInitialRender = React.useRef(true);

  // Add a special effect that runs only once on mount to detect page refreshes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance && window.performance.navigation) {
   }
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      try {
       if (!formData.applicationId) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // Skip step validation on page refresh
        if (isInitialRender.current) {
          isInitialRender.current = false;
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // Check if user can access this page based on their progress
        const currentStep = formData.currentStep || 20; // Default to basic-info if not set
        const currentRoute = pathname;
        const targetStep = getStepForRoute(currentRoute);
        
        // Only enforce step order if not in verification page
        if (targetStep !== 10 && !canAccessStep(currentStep as ApplicationStep, targetStep)) {
         const appropriateRoute = getRouteForStep(currentStep as ApplicationStep);
          
          // Prevent infinite redirects
          if (lastNavigationPathRef.current !== appropriateRoute) {
            lastNavigationPathRef.current = appropriateRoute;
            router.push(appropriateRoute);
          }
          return;
        }
        
        // User can access this page
        setIsAuthorized(true);
      } catch (error) {
       if (lastNavigationPathRef.current !== redirectTo) {
          lastNavigationPathRef.current = redirectTo;
          router.push(redirectTo);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [router, redirectTo, formData.applicationId, formData.currentStep, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 text-lg">Inapakia taarifa zako...</p>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
