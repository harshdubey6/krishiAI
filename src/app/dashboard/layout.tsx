'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading state with a nice animation
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  // Middleware handles authentication redirect
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-md">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-green-600">KrishiAI</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Farmer&apos;s Platform</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 sm:w-72 lg:w-64 flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>
      <main className="flex-1 overflow-auto pt-16 lg:pt-0 px-3 py-4 sm:px-4 sm:py-5 lg:p-8 bg-gray-50 relative z-10">
        {children}
      </main>
    </div>
  );
}
