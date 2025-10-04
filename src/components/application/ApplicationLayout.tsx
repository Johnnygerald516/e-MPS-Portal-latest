import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Home, Users, FileText, CheckSquare, CheckCircle, File } from "lucide-react";
import { useApplication } from "@/contexts/application-context";

interface ApplicationLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  applicationId?: string;
  currentStep: string;
  activeSection?: string;
  autoNavigateToNext?: boolean;
}

const navigationItems = [
  { id: 'habari-binafsi', label: 'Habari Binafsi', href: '/application/basic-info', icon: User },
  { id: 'anuwani-ya-makazi', label: 'Anuwani ya Makazi', href: '/application/residence-info', icon: Home },
  { id: 'habari-za-wazazi', label: 'Habari za Wazazi', href: '/application/parents-info', icon: Users },
  { id: 'habari-za-wategemezi', label: 'Habari za Wategemezi', href: '/application/dependant-info', icon: Users },
  { id: 'viambatanisho', label: 'Viambatanisho', href: '/application/documents', icon: File },
  { id: 'tamko-rasmi', label: 'Tamko Rasmi', href: '/application/declaration', icon: CheckSquare },
  { id: 'complete', label: 'Mafanikio', href: '/application/complete', icon: CheckCircle }
];

export default function ApplicationLayout({ children, title, subtitle, applicationId: propApplicationId, currentStep, activeSection, autoNavigateToNext = false }: ApplicationLayoutProps) {
  const router = useRouter();
  const { formData } = useApplication();
  const [isMounted, setIsMounted] = useState(false);
  
  // Use applicationId from context if available, otherwise use the prop
  const applicationId = formData.applicationId || propApplicationId;
  
  // Find the current step index in the navigation items
  const currentStepIndex = navigationItems.findIndex(item => item.id === currentStep);
  
  // Get the next step if it exists
  const nextStep = currentStepIndex >= 0 && currentStepIndex < navigationItems.length - 1 
    ? navigationItems[currentStepIndex + 1] 
    : null;
    
  // Set isMounted to true after component mounts to enable client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Store a reference to whether this is an initial render
  const isInitialRender = React.useRef(true);
    
  // Effect to handle automatic navigation to the next tab when autoNavigateToNext is true
  useEffect(() => {
    // Only navigate if:
    // 1. autoNavigateToNext is true
    // 2. We have a next step to navigate to
    // 3. The component is mounted
    // 4. This is NOT the initial render (prevents navigation on page refresh)
    if (autoNavigateToNext && nextStep && isMounted && !isInitialRender.current) {
      // Keep the loading state active during navigation
      // The loading state will be handled by the next page after navigation
      const timer = setTimeout(() => {
        router.push(nextStep.href);
      }, 300); // 300ms delay before navigation - faster response
      
      return () => clearTimeout(timer);
    }
    
    // After the first render, set isInitialRender to false
    isInitialRender.current = false;
  }, [autoNavigateToNext, nextStep, router, isMounted]);
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 border border-slate-200 rounded mt-2 bg-white mb-2">
      {/* Header - Only show when mounted and applicationId exists */}
      {/* {isMounted && applicationId && (
        <header className="border-b border-slate-200 p-2 flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Link href="/application" className="flex items-center px-4 py-1 text-blue-700 hover:text-blue-800">
              <Home className="h-4 w-4 mr-2" />
              Home 
            </Link>
          </div>
          <div className="text-right pr-4">
            <div className="flex items-center">
              <span className="text-xs font-medium text-slate-500 mr-2">Application ID:</span>
              <span className="text-sm font-medium bg-blue-50 text-blue-800 px-3 py-1 rounded border border-blue-200">{applicationId}</span>
            </div>
          </div>
        </header>
      )} */}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-55 bg-white border-r p-2">
          <div className="flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <div 
                  className={`px-4 py-3 text-sm rounded border transition-all duration-200 flex items-center ${currentStep === item.id 
                    ? 'bg-blue-50 text-blue-800 border-blue-300 font-medium' 
                    : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {React.createElement(item.icon, { className: `h-4 w-4 mr-2 ${currentStep === item.id ? 'text-blue-600' : 'text-gray-400'}` })}
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white">
          <div className="p-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-6">
              <div>
                <h1 className="text-lg font-semibold text-gray-600">{title}</h1>
                {/* {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>} */}
              </div>
              {/* Only render applicationId on client-side to prevent hydration errors */}
              {isMounted && applicationId && (
                <div className="bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                  <span className="text-xs font-medium text-gray-500">Application ID:</span>
                  <span className="text-sm font-medium text-blue-600 ml-1">{applicationId}</span>
                </div>
              )}
            </div>
              {children}
          </div>
        </main>
      </div>
    </div>
  );
}
