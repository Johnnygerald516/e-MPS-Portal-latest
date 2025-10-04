"use client";

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  isSessionAboutToExpire, 
  extendApplicationSession, 
  getApplicationSession 
} from "@/lib/utils/session";

export default function SessionExpiryWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    expiryTime: string | null;
    applicationId: string | null;
  }>({
    expiryTime: null,
    applicationId: null
  });

  // Check session expiry every minute
  useEffect(() => {
    const checkSessionExpiry = () => {
      try {
        const session = getApplicationSession();
        if (!session) return;
        
        const expiryTime = localStorage.getItem('emps_session_expiry');
        if (!expiryTime) return;
        
        setSessionInfo({
          expiryTime,
          applicationId: session.applicationId
        });
        
        // Show warning if session is about to expire
        setShowWarning(isSessionAboutToExpire());
      } catch (error) {
     }
    };
    
    // Check immediately on mount
    checkSessionExpiry();
    
    // Set up interval to check every minute
    const interval = setInterval(checkSessionExpiry, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle extending the session
  const handleExtendSession = () => {
    extendApplicationSession(24); // Extend by 24 hours
    setShowWarning(false);
  };
  
  // Calculate time remaining
  const getTimeRemaining = (): string => {
    if (!sessionInfo.expiryTime) return "Unknown";
    
    const expiry = new Date(sessionInfo.expiryTime);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
  };
  
  if (!showWarning) return null;
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-800 mb-1">Session Expiring Soon</h3>
          <p className="text-sm text-amber-700 mb-3">
            Your application session for ID <span className="font-mono font-medium">{sessionInfo.applicationId?.substring(0, 8)}...</span> will expire in {getTimeRemaining()}. Would you like to extend your session?
          </p>
          <Button 
            size="sm"
            variant="outline"
            className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
            onClick={handleExtendSession}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Extend Session
          </Button>
        </div>
      </div>
    </div>
  );
}
