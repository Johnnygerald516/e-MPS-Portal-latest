import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Home, Users, FileText, CheckSquare, CheckCircle, File } from "lucide-react";

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

export default function ApplicationLayout({ children, title, subtitle, applicationId, currentStep, activeSection, autoNavigateToNext = false }: ApplicationLayoutProps) {
  const router = useRouter();
  
  // Find the current step index in the navigation items
  const currentStepIndex = navigationItems.findIndex(item => item.id === currentStep);
  
  // Get the next step if it exists
  const nextStep = currentStepIndex >= 0 && currentStepIndex < navigationItems.length - 1 
    ? navigationItems[currentStepIndex + 1] 
    : null;
    
  // Effect to handle automatic navigation to the next tab when autoNavigateToNext is true
  useEffect(() => {
    if (autoNavigateToNext && nextStep && applicationId) {
      const timer = setTimeout(() => {
        router.push(`${nextStep.href}?applicationId=${applicationId}`);
      }, 1000); // 1 second delay before navigation
      
      return () => clearTimeout(timer);
    }
  }, [autoNavigateToNext, nextStep, applicationId, router]);
  
  return (
    <div className="container mx-auto py-8 px-4 border border-slate-200 rounded mt-2 bg-white mb-2">
      {/* Header */}
      {/* <header className="border-b border-zinc-200 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center px-4 py-1 bg-blue-700 hover:bg-blue-700 rounded ">
            <Home className="h-4 w-4 mr-2" />
            Home 
          </Link>
        </div>
        <div className="text-right pr-4">
          <span className="text-sm bg-white text-blue-800 px-2 py-1 rounded">{applicationId || '25PA-PG9H-GW04'}</span>
        </div>
      </header> */}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-55 bg-white border-r p-2">
          <div className="flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <div
                key={item.id} 
                className={`px-4 py-3 text-sm rounded border transition-all duration-200 flex items-center ${currentStep === item.id 
                  ? 'bg-blue-50 text-blue-800 border-blue-300 font-medium' 
                  : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {React.createElement(item.icon, { className: `h-4 w-4 mr-2 ${currentStep === item.id ? 'text-blue-600' : 'text-gray-400'}` })}
                {item.label}
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
              {applicationId && (
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
