'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CloudSun, Droplets, Wind, Thermometer, AlertTriangle, Calendar, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';

interface WeatherAlert {
  headline: string;
  description: string;
}

interface WeatherData {
  location?: string;
  current?: {
    location?: string;
    temperature?: number;
    feelsLike?: number;
    humidity?: number;
    windSpeed?: number;
    condition?: string;
  };
  forecast?: Array<{
    date?: string;
    high?: number;
    low?: number;
    condition?: string;
    rainChance?: number;
  }>;
  alerts?: WeatherAlert[];
  advice?: {
    irrigation?: string;
    spraying?: string;
    cropSpecific?: string[];
  };
}

export default function WeatherPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [crop, setCrop] = useState('');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to access weather information');
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const fetchWeather = async () => {
    if (!location.trim()) {
      toast.error('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        location: location.trim(),
        ...(crop && { crop: crop.trim() })
      });

      const response = await fetch(`/api/weather?${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setWeatherData(data.data);
        toast.success('Weather data loaded successfully');
      } else {
        toast.error(data.message || 'Failed to fetch weather');
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast.error('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            मौसम पूर्वानुमान / Weather Forecast
          </h1>
          <p className="text-gray-600">Get weather updates and crop-specific advisory</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location / स्थान <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Ludhiana, Punjab"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Crop (Optional) / फसल
              </label>
              <input
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g., Wheat, Rice"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchWeather}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Get Weather / मौसम देखें'}
              </button>
            </div>
          </div>
        </div>

        {weatherData && (
          <div className="space-y-8">
            {/* Current Weather */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{String(weatherData?.current?.location || '')}</h2>
                  <p className="text-blue-100">Current Weather</p>
                </div>
                <CloudSun className="w-16 h-16" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-5 h-5" />
                    <span className="text-sm text-blue-100">Temperature</span>
                  </div>
                  <div className="text-3xl font-bold">{Number(weatherData?.current?.temperature || 0)}°C</div>
                  <div className="text-sm text-blue-100">Feels like {Number(weatherData?.current?.feelsLike || 0)}°C</div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5" />
                    <span className="text-sm text-blue-100">Humidity</span>
                  </div>
                  <div className="text-3xl font-bold">{Number(weatherData?.current?.humidity || 0)}%</div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-5 h-5" />
                    <span className="text-sm text-blue-100">Wind Speed</span>
                  </div>
                  <div className="text-3xl font-bold">{Number(weatherData?.current?.windSpeed || 0)}</div>
                  <div className="text-sm text-blue-100">km/h</div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CloudSun className="w-5 h-5" />
                    <span className="text-sm text-blue-100">Condition</span>
                  </div>
                  <div className="text-lg font-semibold">{String(weatherData?.current?.condition || '')}</div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {weatherData?.alerts && weatherData.alerts.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-red-900">Weather Alerts / मौसम चेतावनी</h3>
                </div>
                <div className="space-y-3">
                  {weatherData.alerts.map((alert, index) => (
                    <div key={index} className="bg-white rounded-lg p-4">
                      <div className="font-semibold text-red-900 mb-1">{alert.headline}</div>
                      <div className="text-sm text-gray-700">{alert.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farming Advisory */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sprout className="w-7 h-7 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">Farming Advisory / कृषि सलाह</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Irrigation */}
                <div className="bg-blue-50 rounded-xl p-5">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    Irrigation / सिंचाई
                  </h4>
                  <p className="text-gray-700">{String(weatherData?.advice?.irrigation || '')}</p>
                </div>

                {/* Spraying */}
                <div className="bg-green-50 rounded-xl p-5">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <Sprout className="w-5 h-5" />
                    Spraying / छिड़काव
                  </h4>
                  <p className="text-gray-700">{String(weatherData?.advice?.spraying || '')}</p>
                </div>
              </div>

              {/* Crop Specific Advice */}
              {weatherData?.advice?.cropSpecific && weatherData.advice.cropSpecific.length > 0 && (
                <div className="mt-6 bg-yellow-50 rounded-xl p-5">
                  <h4 className="font-semibold text-yellow-900 mb-3">Crop-Specific Advice</h4>
                  <ul className="space-y-2">
                    {weatherData.advice.cropSpecific.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 7-Day Forecast */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-7 h-7 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">7-Day Forecast / 7 दिन का पूर्वानुमान</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {(weatherData?.forecast as Array<{date: string; maxTemp: number; minTemp: number; condition: string; chanceOfRain: number}> || []).map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {day.maxTemp}°
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{day.minTemp}°</div>
                    <div className="text-xs text-gray-600">{day.condition}</div>
                    {day.chanceOfRain > 30 && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-blue-600">
                        <Droplets className="w-3 h-3" />
                        <span className="text-xs">{day.chanceOfRain}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!weatherData && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <CloudSun className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Enter your location to get weather forecast
            </h3>
            <p className="text-gray-500">
              Get real-time weather updates and farming advisory
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
