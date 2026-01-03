'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Home, Camera, Cloud, TrendingUp, BookOpen, LogOut, Leaf } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps = {}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/login' });
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="w-6 h-6" />,
    },
    {
      name: 'Crop Diagnosis',
      href: '/dashboard/diagnose',
      icon: <Camera className="w-6 h-6" />,
    },
    {
      name: 'Weather Forecast',
      href: '/dashboard/weather',
      icon: <Cloud className="w-6 h-6" />,
    },
    {
      name: 'Market Prices',
      href: '/dashboard/prices',
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      name: 'Farmer Guide',
      href: '/dashboard/guide',
      icon: <BookOpen className="w-6 h-6" />,
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-white border-r shadow-lg overflow-hidden">
      {/* Logo Section */}
      <div className="p-4 sm:p-6 border-b flex flex-col items-center bg-gradient-to-br from-green-50 to-white">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-600 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
          <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-green-600">KrishiAI</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Farmer&apos;s Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg transition-all touch-manipulation active:scale-95
                ${isActive
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-600 active:bg-green-100'
                }`}
            >
              <span className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">{item.icon}</span>
              <span className="font-medium text-sm sm:text-base">{item.name}</span>
              {item.badge && (
                <span className={`ml-auto px-2 py-0.5 text-xs rounded-full
                  ${isActive ? 'bg-white text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="border-t p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="mb-3 sm:mb-4 px-3 sm:px-4 py-2 bg-white rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100
            rounded-lg transition-all touch-manipulation active:scale-95"
        >
          <LogOut className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </div>
  );
}
