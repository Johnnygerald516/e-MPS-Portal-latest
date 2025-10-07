"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface NavigationOptions {
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  delay?: number;
}

export function useNavigation() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const navigateTo = useCallback(
    async (path: string, options: NavigationOptions = {}) => {
      const { onStart, onComplete, onError, delay = 0 } = options;

      try {
        setIsNavigating(true);
        onStart?.();

        // Add a small delay for better UX if specified
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Create a promise that resolves when navigation is complete
        const navigationPromise = new Promise<void>((resolve) => {
          // Listen for route change complete event
          const handleRouteChangeComplete = () => {
            // Wait a bit for the new page to render
            setTimeout(() => {
              resolve();
            }, 300);
          };

          // Setup event listeners for navigation
          window.addEventListener('popstate', handleRouteChangeComplete);
          
          // Cleanup function
          setTimeout(() => {
            window.removeEventListener('popstate', handleRouteChangeComplete);
            resolve(); // Resolve anyway after timeout as fallback
          }, 2000); // 2 second timeout as fallback
        });

        // Perform navigation
        router.push(path);

        // Wait for navigation to complete
        await navigationPromise;

        onComplete?.();
      } catch (error) {
        onError?.(error as Error);
      } finally {
        // Ensure loading state is cleared after navigation
        // but with a small delay to ensure the new page is visible
        setTimeout(() => {
          setIsNavigating(false);
        }, 300);
      }
    },
    [router]
  );

  const navigateBack = useCallback(
    async (options: NavigationOptions = {}) => {
      const { onStart, onComplete, onError } = options;

      try {
        setIsNavigating(true);
        onStart?.();

        // Create a promise that resolves when navigation is complete
        const navigationPromise = new Promise<void>((resolve) => {
          // Listen for route change complete event
          const handleRouteChangeComplete = () => {
            setTimeout(() => {
              resolve();
            }, 300);
          };

          window.addEventListener('popstate', handleRouteChangeComplete);
          
          setTimeout(() => {
            window.removeEventListener('popstate', handleRouteChangeComplete);
            resolve(); // Resolve anyway after timeout
          }, 2000);
        });

        router.back();

        // Wait for navigation to complete
        await navigationPromise;

        onComplete?.();
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setTimeout(() => {
          setIsNavigating(false);
        }, 300);
      }
    },
    [router]
  );

  const navigateReplace = useCallback(
    async (path: string, options: NavigationOptions = {}) => {
      const { onStart, onComplete, onError, delay = 0 } = options;

      try {
        setIsNavigating(true);
        onStart?.();

        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Create a promise that resolves when navigation is complete
        const navigationPromise = new Promise<void>((resolve) => {
          // Listen for route change complete event
          const handleRouteChangeComplete = () => {
            setTimeout(() => {
              resolve();
            }, 300);
          };

          window.addEventListener('popstate', handleRouteChangeComplete);
          
          setTimeout(() => {
            window.removeEventListener('popstate', handleRouteChangeComplete);
            resolve(); // Resolve anyway after timeout
          }, 2000);
        });

        router.replace(path);

        // Wait for navigation to complete
        await navigationPromise;

        onComplete?.();
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setTimeout(() => {
          setIsNavigating(false);
        }, 300);
      }
    },
    [router]
  );

  return {
    navigateTo,
    navigateBack,
    navigateReplace,
    isNavigating,
  };
}
