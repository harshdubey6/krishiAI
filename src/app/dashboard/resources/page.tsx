'use client';

import { useSession } from 'next-auth/react';
import { ExternalLink, Globe, Landmark, MapPin, CreditCard, Sun, ShoppingBasket, Umbrella, Users } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { MARKET_RESOURCES } from '@/lib/market-resources';

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  'Government Scheme': {
    icon: <Landmark className="w-5 h-5" />,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  'Land Records': {
    icon: <MapPin className="w-5 h-5" />,
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  'Farm Credit': {
    icon: <CreditCard className="w-5 h-5" />,
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  'Renewable Energy': {
    icon: <Sun className="w-5 h-5" />,
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  'Marketplace': {
    icon: <ShoppingBasket className="w-5 h-5" />,
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  'Crop Insurance': {
    icon: <Umbrella className="w-5 h-5" />,
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  'Agri Consulting': {
    icon: <Users className="w-5 h-5" />,
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
  },
};

const DEFAULT_STYLE = {
  icon: <Globe className="w-5 h-5" />,
  bg: 'bg-gray-100',
  text: 'text-gray-700',
  border: 'border-gray-200',
};

export default function MarketResourcesPage() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">{t('Loading...', 'लोड हो रहा है...', 'लोड होत आहे...')}</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-10">

      {/* Hero — matches dashboard welcome style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAwLTZzLTQgMi02IDBjLTItMiAwLTQtMi02cy00IDAtNi0yYy0yLTIgMC00LTItNnMtNC0yLTYgMGMtMiAyLTQgMC02IDJzMCA0LTIgNmMtMiAyLTQgMC02IDJzMCA0IDIgNmMyIDIgNCAyIDYgMHMyIDQgNiAyczQtMiA2IDBjMiAyIDQgMCA2LTJzMi00IDAtNnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
        <div className="relative px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow mb-1">
            {t('Market Resources', 'मार्केट संसाधन', 'मार्केट संसाधने')}
          </h1>
          <p className="text-green-100 text-sm max-w-xl">
            {t(
              'Trusted agri websites — open directly without searching on Google.',
              'विश्वसनीय कृषि वेबसाइटें — बिना गूगल खोज के सीधे खोलें।',
              'विश्वासार्ह कृषी वेबसाइट्स — Google शोधाशिवाय थेट उघडा.'
            )}
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {MARKET_RESOURCES.map((resource) => {
          const style = CATEGORY_STYLES[resource.category.en] ?? DEFAULT_STYLE;
          return (
            <article
              key={resource.name}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card icon header */}
              <div className={`${style.bg} px-5 pt-5 pb-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center ${style.text} shadow-sm`}>
                  {style.icon}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide ${style.text}`}>
                  {t(resource.category.en, resource.category.hi, resource.category.mr)}
                </span>
              </div>

              {/* Card body */}
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mb-2">
                  {resource.name}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-5">
                  {t(resource.famousFor.en, resource.famousFor.hi, resource.famousFor.mr)}
                </p>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm sm:text-base hover:bg-green-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <span>{t('Visit Website', 'वेबसाइट खोलें', 'वेबसाइट उघडा')}</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
