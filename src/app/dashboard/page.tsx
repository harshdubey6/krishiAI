'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sprout, CloudSun, TrendingUp, BookOpen, AlertCircle, ArrowRight, Sparkles, Shield, Clock, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

// Define proper type for diagnosis history items
interface DiagnosisItem {
  id: string;
  cropType?: string;
  plantType?: string;
  severity?: string;
  confidence?: number;
  diagnosis?: string;
  symptoms?: string;
  causes?: string[];
  treatment?: string[];
  prevention?: string[];
  createdAt: string;
  estimatedCost?: number;
}

export default function DashboardPage() {
  const { session, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [recent, setRecent] = useState<DiagnosisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisItem | null>(null);

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

  // Show loading spinner while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">{t('Loading dashboard...', 'डैशबोर्ड लोड हो रहा है...')}</p>
      </div>
    );
  }

  // Middleware handles authentication redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">{t('Redirecting...', 'रीडायरेक्ट हो रहा है...')}</p>
      </div>
    );
  }

  const features = [
    {
      title: t('Crop Diagnosis', 'फसल निदान'),
      description: t('AI-powered disease detection & treatment', 'AI आधारित रोग पहचान और उपचार'),
      icon: <Sprout className="w-10 h-10" />,
      href: '/dashboard/diagnose',
      gradient: 'from-emerald-400 via-green-500 to-green-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      hoverGradient: 'hover:from-emerald-500 hover:via-green-600 hover:to-green-700'
    },
    {
      title: t('Weather Forecast', 'मौसम पूर्वानुमान'),
      description: t('7-day forecast & farming advisory', '7 दिन का पूर्वानुमान और कृषि सलाह'),
      icon: <CloudSun className="w-10 h-10" />,
      href: '/dashboard/weather',
      gradient: 'from-sky-400 via-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      hoverGradient: 'hover:from-sky-500 hover:via-blue-600 hover:to-blue-700'
    },
    {
      title: t('Market Prices', 'मंडी भाव'),
      description: t('Live rates & profit calculator', 'लाइव भाव और लाभ कैलकुलेटर'),
      icon: <TrendingUp className="w-10 h-10" />,
      href: '/dashboard/prices',
      gradient: 'from-orange-400 via-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      hoverGradient: 'hover:from-orange-500 hover:via-orange-600 hover:to-red-600'
    },
    {
      title: t('Farmer Guide', 'कृषि मार्गदर्शिका'),
      description: t('Complete crop cultivation guides', 'संपूर्ण फसल खेती मार्गदर्शिका'),
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
                {t('Hello,', 'नमस्ते,')} <span className="text-yellow-300">{session?.user?.name?.split(' ')[0] || t('Farmer', 'किसान भाई')}</span>!
              </h1>
              <p className="text-green-50 text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2">
                {t('Welcome to your farming dashboard', 'अपने कृषि डैशबोर्ड में आपका स्वागत है')}
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

      {/* Recent Diagnoses - Modern Design */}
      {recent.length > 0 && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Recent Activity</h2>
              <p className="text-xs sm:text-sm text-gray-500">{t('Your latest crop scans', 'आपके हालिया फसल स्कैन')}</p>
            </div>
            <Link
              href="/dashboard/diagnose"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg text-sm sm:text-base whitespace-nowrap"
            >
              <span>{t('View All', 'सभी देखें')}</span>
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
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDiagnosis(d)}
                  className="group w-full text-left p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200"
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
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Grid - Enhanced Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {features.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            className="group relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent active:scale-95 sm:hover:-translate-y-2"
          >
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.gradient}`}></div>

            <div className="relative p-5 sm:p-8">
              <div className={`inline-flex ${feature.iconBg} rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md`}>
                <div className={`${feature.iconColor} group-hover:text-white transition-colors`}>
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 group-hover:text-white/80 transition-colors">
                {feature.description}
              </p>

              <div className="flex items-center gap-2 text-green-600 group-hover:text-white font-semibold transition-colors text-sm sm:text-base">
                <span>{t('Get Started', 'शुरू करें')}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {selectedDiagnosis && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedDiagnosis(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedDiagnosis.cropType || selectedDiagnosis.plantType || t('Crop', 'फसल')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedDiagnosis.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDiagnosis(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {selectedDiagnosis.severity && (
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${selectedDiagnosis.severity === 'severe' ? 'bg-red-500 text-white' :
                    selectedDiagnosis.severity === 'moderate' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                    {selectedDiagnosis.severity.toUpperCase()}
                  </span>
                )}
                {typeof selectedDiagnosis.confidence === 'number' && (
                  <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                    {Math.round(selectedDiagnosis.confidence)}% {t('confident', 'विश्वास')}
                  </span>
                )}
                {typeof selectedDiagnosis.estimatedCost === 'number' && (
                  <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-semibold">
                    ₹{selectedDiagnosis.estimatedCost.toLocaleString('en-IN')} {t('est. cost', 'अनुमानित लागत')}
                  </span>
                )}
              </div>

              {selectedDiagnosis.symptoms && (
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('Symptoms', 'लक्षण')}</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedDiagnosis.symptoms}</p>
                </div>
              )}

              <div className="rounded-xl border border-green-200 p-4 bg-green-50">
                <h4 className="text-sm font-semibold text-green-900 mb-2">{t('Diagnosis', 'निदान')}</h4>
                <p className="text-green-800 whitespace-pre-wrap">{selectedDiagnosis.diagnosis || t('No diagnosis available', 'निदान उपलब्ध नहीं है')}</p>
              </div>

              {Array.isArray(selectedDiagnosis.causes) && selectedDiagnosis.causes.length > 0 && (
                <div className="rounded-xl border border-gray-200 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('Causes', 'कारण')}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {selectedDiagnosis.causes.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(selectedDiagnosis.treatment) && selectedDiagnosis.treatment.length > 0 && (
                <div className="rounded-xl border border-gray-200 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('Treatment', 'उपचार')}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {selectedDiagnosis.treatment.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(selectedDiagnosis.prevention) && selectedDiagnosis.prevention.length > 0 && (
                <div className="rounded-xl border border-gray-200 p-4 bg-white">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('Prevention', 'रोकथाम')}</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {selectedDiagnosis.prevention.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
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
              {t('Upload a photo of your crop to get AI-powered disease detection and treatment recommendations.', 'AI आधारित रोग पहचान और उपचार सलाह पाने के लिए अपनी फसल की फोटो अपलोड करें।')}
            </p>
            <Link
              href="/dashboard/diagnose"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sprout className="w-5 h-5" />
              <span>{t('Diagnose Crop Now', 'अभी फसल निदान करें')}</span>
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
              <p className="text-blue-100 text-sm">{t('Expert recommendations', 'विशेषज्ञ सुझाव')}</p>
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
