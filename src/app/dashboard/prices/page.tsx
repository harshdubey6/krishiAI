'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { TrendingUp, TrendingDown, Minus, Calculator, IndianRupee, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface CalcResult {
  estimatedRevenue: number;
  profit: number;
  profitMargin: number;
}

interface PriceItem {
  cropName?: string;
  market?: string;
  currentPrice?: number;
  previousPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  unit?: string;
  state?: string;
  district?: string;
  trend?: string;
}

export default function MarketPricesPage() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCrop, setSearchCrop] = useState('');
  const [searchState, setSearchState] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Calculator states
  const [calcCrop, setCalcCrop] = useState('');
  const [calcQuantity, setCalcQuantity] = useState('');
  const [calcCost, setCalcCost] = useState('');
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'list',
        ...(searchCrop && { crop: searchCrop }),
        ...(searchState && { state: searchState })
      });

      const response = await fetch(`/api/market-prices?${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setPrices(data.data);
      } else {
        toast.error(data.message || t('Failed to fetch prices', 'भाव प्राप्त करने में विफल'));
      }
    } catch (error) {
      console.error('Prices fetch error:', error);
      toast.error(t('Failed to fetch market prices', 'मंडी भाव प्राप्त करने में विफल'));
    } finally {
      setLoading(false);
    }
  }, [searchCrop, searchState, t]);

  // Auth redirect is handled by dashboard layout and middleware

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPrices();
    }
  }, [status, fetchPrices]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">{t('Loading...', 'लोड हो रहा है...')}</p>
      </div>
    );
  }

  if (!session) return null;

  const calculateProfit = async () => {
    if (!calcCrop || !calcQuantity || !calcCost) {
      toast.error(t('Please fill all calculator fields', 'कृपया कैलकुलेटर के सभी फ़ील्ड भरें'));
      return;
    }

    try {
      const params = new URLSearchParams({
        action: 'calculate',
        crop: calcCrop,
        quantity: calcQuantity,
        cost: calcCost
      });

      const response = await fetch(`/api/market-prices?${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setCalcResult(data.data);
        toast.success(t('Profit calculated successfully', 'लाभ सफलतापूर्वक गणना किया गया'));
      } else {
        toast.error(data.message || t('Failed to calculate', 'गणना विफल रही'));
      }
    } catch (error) {
      console.error('Calculate error:', error);
      toast.error(t('Failed to calculate profit', 'लाभ की गणना विफल रही'));
    }
  };

  const getPriceIndicator = (price: PriceItem) => {
    const minPrice = price.minPrice || 0;
    const maxPrice = price.maxPrice || 0;
    const currentPrice = price.currentPrice || 0;
    const avgPrice = (minPrice + maxPrice) / 2;
    const diff = currentPrice - avgPrice;
    const percentage = avgPrice > 0 ? (diff / avgPrice) * 100 : 0;

    if (percentage > 2) {
      return { icon: <TrendingUp className="w-5 h-5 text-green-600" />, color: 'text-green-600', text: t('High', 'ऊँचा') };
    } else if (percentage < -2) {
      return { icon: <TrendingDown className="w-5 h-5 text-red-600" />, color: 'text-red-600', text: t('Low', 'कम') };
    }
    return { icon: <Minus className="w-5 h-5 text-gray-600" />, color: 'text-gray-600', text: t('Stable', 'स्थिर') };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t('Market Prices', 'मंडी भाव')}
          </h1>
          <p className="text-gray-600">{t('Live agricultural commodity prices across markets', 'विभिन्न बाजारों में कृषि उत्पादों के लाइव भाव')}</p>
        </div>

        {/* Search & Calculator Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Search Crop', 'फसल खोजें')}
              </label>
              <input
                type="text"
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                placeholder="e.g., Wheat, Rice"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && fetchPrices()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('State', 'राज्य')}
              </label>
              <input
                type="text"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                placeholder="e.g., Punjab"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && fetchPrices()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchPrices}
                disabled={loading}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
              >
                {t('Search', 'खोजें')}
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                {t('Calculator', 'कैलकुलेटर')}
              </button>
            </div>
          </div>
        </div>

        {/* Profit Calculator */}
        {showCalculator && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calculator className="w-7 h-7" />
              {t('Profit Calculator', 'लाभ कैलकुलेटर')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">{t('Crop Name', 'फसल का नाम')}</label>
                <input
                  type="text"
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  placeholder="e.g., Wheat"
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">{t('Quantity (Quintal)', 'मात्रा (क्विंटल)')}</label>
                <input
                  type="number"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">{t('Cultivation Cost (₹)', 'खेती लागत (₹)')}</label>
                <input
                  type="number"
                  value={calcCost}
                  onChange={(e) => setCalcCost(e.target.value)}
                  placeholder="e.g., 150000"
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={calculateProfit}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              {t('Calculate Profit', 'लाभ की गणना करें')}
            </button>

            {calcResult && (
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <div className="text-sm text-blue-100 mb-1">{t('Estimated Revenue', 'अनुमानित राजस्व')}</div>
                  <div className="text-2xl font-bold">₹{calcResult.estimatedRevenue?.toLocaleString('en-IN') || 0}</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <div className="text-sm text-blue-100 mb-1">{t('Estimated Profit', 'अनुमानित लाभ')}</div>
                  <div className={`text-2xl font-bold ${calcResult.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    ₹{calcResult.profit?.toLocaleString('en-IN') || 0}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <div className="text-sm text-blue-100 mb-1">{t('Profit Margin', 'लाभ मार्जिन')}</div>
                  <div className={`text-2xl font-bold ${calcResult.profitMargin >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {calcResult.profitMargin || 0}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prices Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : prices.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prices.map((price, index) => {
              const indicator = getPriceIndicator(price);
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{String(price?.cropName || '')}</h3>
                      <p className="text-sm text-gray-600">{String(price?.market || '')}</p>
                      <p className="text-xs text-gray-500">{String(price?.district || '')}, {String(price?.state || '')}</p>
                    </div>
                    {indicator.icon}
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-1">{t('Modal Price', 'मॉडल भाव')}</div>
                    <div className="text-3xl font-bold text-orange-600 flex items-center gap-2">
                      <IndianRupee className="w-7 h-7" />
                      {Number(price?.modalPrice || 0)}
                    </div>
                    <div className="text-sm text-gray-600">{t('per', 'प्रति')} {String(price?.unit || '')}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">{t('Min Price', 'न्यूनतम भाव')}</div>
                      <div className="text-lg font-semibold text-gray-900">₹{Number(price?.minPrice || 0)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">{t('Max Price', 'अधिकतम भाव')}</div>
                      <div className="text-lg font-semibold text-gray-900">₹{Number(price?.maxPrice || 0)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('Status:', 'स्थिति:')}</span>
                    <span className={`font-semibold ${indicator.color}`}>{indicator.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BarChart3 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No market prices found
            </h3>
            <p className="text-gray-500">
              Try searching for different crops or states
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">About Market Prices</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Prices are updated daily from government mandis (markets)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Modal price is the most common trading price</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Use the calculator to estimate your profit before selling</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Prices may vary based on quality and season</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
