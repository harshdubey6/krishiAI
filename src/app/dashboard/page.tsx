'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sprout, CloudSun, TrendingUp, BookOpen, AlertCircle, ArrowRight, Sparkles, Target, Shield, Clock } from 'lucide-react';

// Define proper type for diagnosis history items
interface DiagnosisItem {
  id: string;
  cropType?: string;
  plantType?: string;
  severity?: string;
  confidence?: number;
  diagnosis?: string;
  createdAt: string;
  estimatedCost?: number;
}

export default function DashboardPage() {
  const { session, isAuthenticated, isLoading } = useAuth();
  const [recent, setRecent] = useState<DiagnosisItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/diagnose/history');
        const data = await res.json();
        if (res.ok) setRecent(data.items.slice(0, 3));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, isLoading]);

  // Show nothing while auth is being checked - middleware handles redirect
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const features = [
    {
      title: 'फसल निदान',
      titleEn: 'Crop Diagnosis',
      description: 'AI-powered disease detection & treatment',
      icon: <Sprout className="w-10 h-10" />,
      href: '/dashboard/diagnose',
      gradient: 'from-emerald-400 via-green-500 to-green-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      hoverGradient: 'hover:from-emerald-500 hover:via-green-600 hover:to-green-700'
    },
    {
      title: 'मौसम पूर्वानुमान',
      titleEn: 'Weather Forecast',
      description: '7-day forecast & farming advisory',
      icon: <CloudSun className="w-10 h-10" />,
      href: '/dashboard/weather',
      gradient: 'from-sky-400 via-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverGradient: 'hover:from-sky-500 hover:via-blue-600 hover:to-blue-700'
    },
    {
      title: 'मंडी भाव',
      titleEn: 'Market Prices',
      description: 'Live rates & profit calculator',
      icon: <TrendingUp className="w-10 h-10" />,
      href: '/dashboard/prices',
      gradient: 'from-orange-400 via-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      hoverGradient: 'hover:from-orange-500 hover:via-orange-600 hover:to-red-600'
    },
    {
      title: 'कृषि मार्गदर्शिका',
      titleEn: 'Farmer Guide',
      description: 'Complete crop cultivation guides',
      icon: <BookOpen className="w-10 h-10" />,
      href: '/dashboard/guide',
      gradient: 'from-purple-400 via-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      hoverGradient: 'hover:from-purple-500 hover:via-purple-600 hover:to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-12">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAwLTZzLTQgMi02IDBjLTItMiAwLTQtMi02cy00IDAtNi0yYy0yLTIgMC00LTItNnMtNC0yLTYgMGMtMiAyLTQgMC02IDJzMCA0LTIgNmMtMiAyLTQgMC02IDJzMCA0IDIgNmMyIDIgNCAyIDYgMHMyIDQgNiAyczQtMiA2IDBjMiAyIDQgMCA2LTJzMi00IDAtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                <span className="text-white text-xs sm:text-sm font-medium">KrishiAI Platform</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 text-white drop-shadow-lg break-words">
                नमस्ते, <span className="text-yellow-300">{session?.user?.name?.split(' ')[0] || 'किसान भाई'}</span>!
              </h1>
              <p className="text-green-50 text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2">
                Welcome to your farming dashboard
              </p>
              <p className="text-green-100 text-xs sm:text-sm">
                अपने कृषि डैशबोर्ड में आपका स्वागत है
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/30">
                <div className="text-white/80 text-xs font-medium mb-1">Total Scans</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{recent.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid - Enhanced Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {features.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            className="group relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent active:scale-95 sm:hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${feature.gradient.split(' ').join(', ')})` }}></div>

            <div className="relative p-5 sm:p-8">
              <div className={`inline-flex ${feature.iconBg} rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md`}>
                <div className={`${feature.iconColor} group-hover:text-white transition-colors`}>
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base font-semibold text-gray-600 mb-2 sm:mb-3 group-hover:text-white/90 transition-colors">
                {feature.titleEn}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 group-hover:text-white/80 transition-colors">
                {feature.description}
              </p>

              <div className="flex items-center gap-2 text-green-600 group-hover:text-white font-semibold transition-colors text-sm sm:text-base">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-500 rounded-xl shadow-lg">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Accuracy</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">95%+</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">AI-powered crop disease detection</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Protection</p>
              <p className="text-2xl font-bold text-gray-900">24/7</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Weather monitoring & alerts</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Response</p>
              <p className="text-2xl font-bold text-gray-900">Instant</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Real-time market price updates</p>
        </div>
      </div>

      {/* Recent Diagnoses - Modern Design */}
      {recent.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Recent Activity</h2>
              <p className="text-xs sm:text-sm text-gray-500">हालिया निदान / Your latest crop scans</p>
            </div>
            <Link
              href="/dashboard/diagnose"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.map((d) => (
                <div
                  key={d.id}
                  className="group p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                          <h3 className="font-bold text-base sm:text-lg text-gray-900">{d.cropType || d.plantType}</h3>
                        </div>
                        {d.severity && (
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${d.severity === 'severe' ? 'bg-red-500 text-white' :
                            d.severity === 'moderate' ? 'bg-yellow-500 text-white' :
                              'bg-green-500 text-white'
                            }`}>
                            {d.severity.toUpperCase()}
                          </span>
                        )}
                        {d.confidence && (
                          <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                            {Math.round(d.confidence)}% confident
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                        {d.diagnosis?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(d.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {d.estimatedCost && (
                          <span className="flex items-center gap-1 font-medium text-green-600">
                            ₹{d.estimatedCost.toLocaleString('en-IN')} est. cost
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State for New Users */}
      {!loading && recent.length === 0 && (
        <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 rounded-3xl shadow-xl border-2 border-dashed border-green-200 p-12 text-center mb-8">
          <div className="max-w-md mx-auto">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
              <Sprout className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your First Diagnosis</h3>
            <p className="text-gray-600 mb-6">
              Upload a photo of your crop to get AI-powered disease detection and treatment recommendations.
            </p>
            <Link
              href="/dashboard/diagnose"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sprout className="w-5 h-5" />
              <span>Diagnose Crop Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Farming Tips - Enhanced Design */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Smart Farming Tips</h3>
              <p className="text-blue-100 text-sm">कृषि सुझाव / Expert recommendations</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-400 rounded-lg mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Weather-Based Planning</p>
                  <p className="text-blue-100 text-sm">Check forecast before spraying pesticides to maximize effectiveness</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-400 rounded-lg mt-1">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Market Intelligence</p>
                  <p className="text-blue-100 text-sm">Monitor prices daily to sell at peak rates and maximize profits</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-400 rounded-lg mt-1">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Early Detection</p>
                  <p className="text-blue-100 text-sm">Identify diseases early to prevent spread and save entire crops</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-400 rounded-lg mt-1">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Sustainable Practices</p>
                  <p className="text-blue-100 text-sm">Use organic methods for better soil health and long-term yields</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
