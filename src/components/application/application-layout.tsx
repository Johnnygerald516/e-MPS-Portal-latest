"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

export function ApplicationLayout({ children }: ApplicationLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-xl border-none rounded-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col min-h-[600px]">
              {/* Header with back link */}
              <div className="bg-blue-100/80 p-4 text-slate-800 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Ombi la kibali cha Mlowezi</h2>
                  <Link href="/" className="flex items-center text-slate-600 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Rudi Mwanzo
                  </Link>
                </div>
              </div>
              
              {/* Main content */}
              <div className="w-full p-6">
                <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow-md">
                  {/* Page content */}
                  {children}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
