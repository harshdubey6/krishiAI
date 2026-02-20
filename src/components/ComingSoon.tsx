'use client';

import Link from 'next/link';
import { Sprout, Clock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ComingSoonProps {
  title: string;
  titleHi: string;
  titleMr: string;
  description?: string;
  descriptionHi?: string;
  descriptionMr?: string;
  icon?: React.ReactNode;
}

export default function ComingSoon({
  title,
  titleHi,
  titleMr,
  description = "We're working hard to bring this feature to you. Sign up to be notified when it's ready.",
  descriptionHi = 'हम इस सुविधा को आपके लिए तैयार कर रहे हैं। तैयार होने पर सूचना पाने के लिए साइन अप करें।',
  descriptionMr = 'आम्ही ही सुविधा तुमच्यासाठी तयार करत आहोत। तयार झाल्यावर सूचना मिळण्यासाठी साइन अप करा.',
  icon,
}: ComingSoonProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-green-700 text-lg">KrishiAI</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'होम पर वापस', 'होम वर परत')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          {icon ?? <Clock className="w-10 h-10 text-green-600" />}
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          <Clock className="w-3.5 h-3.5" />
          {t('Coming Soon', 'जल्द आ रहा है', 'लवकरच येत आहे')}
        </span>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {t(title, titleHi, titleMr)}
        </h1>

        {/* Description */}
        <p className="text-gray-500 max-w-md text-base mb-10">
          {t(description, descriptionHi, descriptionMr)}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/?auth=register"
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Sprout className="w-4 h-4" />
            {t('Sign Up Free', 'मुफ़्त साइन अप करें', 'मोफत साइन अप करा')}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            {t('Explore Dashboard', 'डैशबोर्ड देखें', 'डॅशबोर्ड पहा')}
          </Link>
        </div>
      </main>

      {/* Footer note */}
      <footer className="text-center text-xs text-gray-400 py-6">
        {t(
          `© ${new Date().getFullYear()} KrishiAI – All rights reserved`,
          `© ${new Date().getFullYear()} KrishiAI – सर्वाधिकार सुरक्षित`,
          `© ${new Date().getFullYear()} KrishiAI – सर्व हक्क राखीव`,
        )}
      </footer>
    </div>
  );
}
