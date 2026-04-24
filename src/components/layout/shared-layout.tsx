"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sun, Moon, Globe, LogIn, Home } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { PDFViewer } from "../ui/pdf-viewer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface SharedLayoutProps {
  children: React.ReactNode;
}

export function SharedLayout({ children }: SharedLayoutProps) {
  const { language, setLanguage } = useLanguage();
  
  // Scroll animations
  const { scrollY } = useScroll();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Header with centered title and logos on both sides */}
      <motion.header 
        initial="hidden"
        animate="visible"
        // style={{ opacity: headerOpacity }}
        className="text-white w-full sticky top-0 z-50 max-w-[100vw] overflow-x-hidden">
        {/* Upper header with logos and title - with radial gradient */}
        <div className="w-full bg-gradient-to-r from-[#1a4a78] via-[#2a6095] to-[#1a4a78] border-b border-[#3a70a5]/30 shadow-md">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-2 px-4">
            {/* Left logo - with consistent spacing */}
            <div className="flex-shrink-0 mb-1 md:mb-0 w-[120px] flex justify-center">
              <Image 
                src="/images/coat_of_arm.png" 
                alt="Tanzania Logo" 
                width={60} 
                height={38}
                className="object-contain"
              />
            </div>
            
            {/* Center title - wizara-header - responsive text sizes */}
            <div className="wizara-header text-center flex-grow max-w-2xl">
              {/* <h1 className="text-base md:text-xl font-bold text-white leading-tight tracking-wide">The United Republic of Tanzania</h1>
              <p className="text-sm md:text-base text-[#f0e7c3] leading-tight font-medium mt-0.5">Ministry of Home Affairs</p>
              <p className="text-sm text-gray-100 leading-tight">Immigration Services Department</p> */}

               <h1 className="text-base md:text-xl font-bold text-white leading-tight tracking-wide">Jamhuri ya Muungano wa Tanzania</h1>
              <p className="text-sm md:text-base text-[#f0e7c3] leading-tight font-medium mt-0.5">Wizara ya Mambo ya Ndani ya Nchi</p>
              <p className="text-sm text-gray-100 leading-tight">Idara ya Uhamiaji</p>
            </div>
            
            {/* Right logo - with consistent spacing */}
            <div className="flex-shrink-0 mt-1 md:mt-0 w-[120px] flex justify-center">
              <Image 
                src="/images/immigration_logo.png" 
                alt="Immigration Logo" 
                width={60} 
                height={38}
                className="object-contain"
              />
            </div>
          </div>
        </div>
        
        {/* Lower thin professional navigation bar - with radial gradient */}
        <div className="w-full bg-gradient-to-r from-[#2a5a88] via-[#3a6a98] to-[#2a5a88] border-b border-[#3a70a5]/20 shadow-sm">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center py-1 px-4">
            {/* Left nav links - responsive layout */}
            <div className="flex items-center space-x-2 sm:space-x-4 mb-1 sm:mb-0 overflow-x-auto w-full sm:w-auto">
              <Link 
                href="/" 
                className="text-xs whitespace-nowrap text-white hover:text-[#f0e7c3] transition-colors duration-200 flex items-center gap-1"
                onClick={() => {
                  // Clear all session storage when clicking the home link
                  if (typeof window !== 'undefined') {
                    sessionStorage.clear();
                    localStorage.clear();
                  }
                }}
              >
                <Home className="h-3 w-3 mr-1" />
                Nyumbani
              </Link>
              
              <PDFViewer 
                pdfPath="/assets/MUONGOZO_WA_KIBALI_CHA_WALOWEZI_NEW.pdf"
                buttonText="Soma Muongozo wa Kibali cha Mlowezi"
                title="Muongozo wa Kibali cha Mlowezi"
                variant="ghost"
                className="text-xs whitespace-nowrap text-white hover:text-[#f0e7c3] transition-colors duration-200 px-2 py-1 h-auto font-normal"
              />
            </div>
            
            {/* Right controls: theme, login, language - responsive spacing */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-white hover:text-[#f0e7c3] transition-colors duration-200" aria-label="Toggle theme">
                    <Sun className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-24 bg-[#2a6095] border-[#3a70a5]/30">
                  <DropdownMenuItem onClick={() => document.documentElement.classList.remove('dark')} className="text-xs py-1 text-white hover:bg-[#3a6a98] hover:text-[#f0e7c3]">
                    <Sun className="mr-1 h-3 w-3" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => document.documentElement.classList.add('dark')} className="text-xs py-1 text-white hover:bg-[#3a6a98] hover:text-[#f0e7c3]">
                    <Moon className="mr-1 h-3 w-3" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            
              {/* Language switcher */}
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-5 p-0 flex items-center gap-0.5 text-xs text-white hover:text-[#f0e7c3] transition-colors duration-200">
                    <Globe className="h-3 w-3" />
                    <span>{language === 'en' ? 'EN' : 'SW'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-20 bg-[#2a6095] border-[#3a70a5]/30">
                  <DropdownMenuItem onClick={() => setLanguage('en')} className="text-xs py-1 text-white hover:bg-[#3a6a98] hover:text-[#f0e7c3]">
                    <span>English</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('sw')} className="text-xs py-1 text-white hover:bg-[#3a6a98] hover:text-[#f0e7c3]">
                    <span>Swahili</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            
              {/* Home link */}
              {/* <Link href="/" className="flex items-center gap-1 text-xs text-white hover:text-[#f0e7c3] transition-colors duration-200">
                <Home className="h-3 w-3" />
              </Link> */}
            </div>
          </div>
        </div>
      </motion.header>
      
      {/* Main content area */}
      <main className="flex-grow bg-slate-50 page-transition">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.3, 
            ease: "easeInOut",
            type: "tween"
          }}
          className="min-h-[calc(100vh-200px)]"
        >
          {children}
        </motion.div>
      </main>
      
      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="border-t py-8 text-muted-foreground bg-slate-100"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto px-4"
        >
          <motion.div 
            className="pt-6 border-t border-slate-200 text-center space-y-2"
          >
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.5 }}
              className="text-slate-500"
            >
              © {new Date().getFullYear()} Immigration Services Department. All Rights Reserved.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xs text-slate-400"
            >
              {process.env.NEXT_PUBLIC_APP_NAME || 'eMPS Portal'} v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
              {process.env.NEXT_PUBLIC_BUILD_DATE && ` • Build: ${process.env.NEXT_PUBLIC_BUILD_DATE}`}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.footer>
    </div>
  );
}
