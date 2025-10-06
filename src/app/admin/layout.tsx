import { ReactNode } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin Dashboard - eMPS Portal',
  description: 'Administrative dashboard for the eMPS Portal',
}

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold">eMPS Admin</h1>
          <p className="text-sm text-slate-300">Management Dashboard</p>
        </div>
        
        <nav className="space-y-1">
          <Link 
            href="/admin" 
            className="block px-4 py-2 rounded hover:bg-slate-700"
          >
            Dashboard
          </Link>
          
          <div className="pt-2">
            <p className="px-4 text-xs text-slate-400 uppercase font-semibold">Chatbot</p>
            <Link 
              href="/admin/chatbot/feedback" 
              className="block px-4 py-2 rounded hover:bg-slate-700"
            >
              Feedback Analytics
            </Link>
            <Link 
              href="/admin/chatbot/qa" 
              className="block px-4 py-2 rounded hover:bg-slate-700"
            >
              Q&A Management
            </Link>
          </div>
          
          <div className="pt-2">
            <p className="px-4 text-xs text-slate-400 uppercase font-semibold">System</p>
            <Link 
              href="/admin/settings" 
              className="block px-4 py-2 rounded hover:bg-slate-700"
            >
              Settings
            </Link>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-slate-50">
        <header className="bg-white border-b h-16 flex items-center px-6 shadow-sm">
          <h2 className="text-lg font-medium">Admin Dashboard</h2>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
