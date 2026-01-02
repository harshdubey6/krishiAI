'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Minus, Calculator, IndianRupee, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

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
  unit?: string;
  state?: string;
  trend?: string;
}

export default function MarketPricesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
        toast.error(data.message || 'Failed to fetch prices');
      }
    } catch (error) {
      console.error('Prices fetch error:', error);
      toast.error('Failed to fetch market prices');
    } finally {
      setLoading(false);
    }
  }, [searchCrop, searchState]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to access market prices');
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPrices();
    }
  }, [status, fetchPrices]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const calculateProfit = async () => {
    if (!calcCrop || !calcQuantity || !calcCost) {
      toast.error('Please fill all calculator fields');
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
        toast.success('Profit calculated successfully');
      } else {
        toast.error(data.message || 'Failed to calculate');
      }
    } catch (error) {
      console.error('Calculate error:', error);
      toast.error('Failed to calculate profit');
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
      return { icon: <TrendingUp className="w-5 h-5 text-green-600" />, color: 'text-green-600', text: 'High' };
    } else if (percentage < -2) {
      return { icon: <TrendingDown className="w-5 h-5 text-red-600" />, color: 'text-red-600', text: 'Low' };
    }
    return { icon: <Minus className="w-5 h-5 text-gray-600" />, color: 'text-gray-600', text: 'Stable' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            मंडी भाव / Market Prices
          </h1>
          <p className="text-gray-600">Live agricultural commodity prices across markets</p>
        </div>

        {/* Search & Calculator Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Crop / फसल खोजें
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
                State / राज्य
              </label>
              <input
                type="text"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                placeholder="e.g., Punjab"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && fetchPrices()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchPrices}
                disabled={loading}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
              >
                Search / खोजें
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculator
              </button>
            </div>
          </div>
        </div>

        {/* Profit Calculator */}
        {showCalculator && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calculator className="w-7 h-7" />
              Profit Calculator / लाभ कैलकुलेटर
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Crop Name</label>
                <input
                  type="text"
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  placeholder="e.g., Wheat"
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Quantity (Quintal)</label>
                <input
                  type="number"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">Cultivation Cost (₹)</label>
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
              Calculate Profit / लाभ की गणना करें
            </button>

            {calcResult && (
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <div className="text-sm text-blue-100 mb-1">Estimated Revenue</div>
                  <div className="text-2xl font-bold">₹{calcResult.estimatedRevenue?.toLocaleString('en-IN') || 0}</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <div className="text-sm text-blue-100 mb-1">Estimated Profit</div>
                  <div className={`text-2xl font-bold ${calcResult.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    ₹{calcResult.profit?.toLocaleString('en-IN') || 0}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <div className="text-sm text-blue-100 mb-1">Profit Margin</div>
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
                    <div className="text-sm text-gray-600 mb-1">Modal Price</div>
                    <div className="text-3xl font-bold text-orange-600 flex items-center gap-2">
                      <IndianRupee className="w-7 h-7" />
                      {Number(price?.modalPrice || 0)}
                    </div>
                    <div className="text-sm text-gray-600">per {String(price?.unit || '')}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Min Price</div>
                      <div className="text-lg font-semibold text-gray-900">₹{Number(price?.minPrice || 0)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Max Price</div>
                      <div className="text-lg font-semibold text-gray-900">₹{Number(price?.maxPrice || 0)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
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
