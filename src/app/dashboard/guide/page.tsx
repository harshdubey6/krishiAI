'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BookOpen, Search, Sprout, CloudSun, Droplets, Leaf, Bug, AlertTriangle, Scissors, TrendingUp, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Define proper types for crop guide data
interface CropGuide {
  id: string;
  cropName: string;
  overview?: string;
  climate?: string;
  soilType?: string;
  sowing?: string;
  irrigation?: string;
  fertilizer?: string;
  pests?: string;
  diseases?: string;
  harvesting?: string;
  yield?: string;
  videoUrls?: string[];
}

export default function FarmerGuidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    overview: true,
    climate: false,
    soilType: false,
    sowing: false,
    irrigation: false,
    fertilizer: false,
    pests: false,
    diseases: false,
    harvesting: false,
    yield: false
  });

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to access farmer guide / कृपया साइन इन करें');
      router.replace('/login');
    }
  }, [status, router]);

  // Load crop guides
  useEffect(() => {
    if (status === 'authenticated') {
      loadGuides();
    }
  }, [status]);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crop-guide');
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setGuides(data.data);
      } else {
        toast.error('Failed to load crop guides');
      }
    } catch (error) {
      console.error('Error loading guides:', error);
      toast.error('Failed to load crop guides');
    } finally {
      setLoading(false);
    }
  };

  const loadCropDetail = async (cropName: string) => {
    setLoadingDetail(true);
    // Expand all sections when loading new crop
    setExpandedSections({
      overview: true,
      climate: true,
      soilType: true,
      sowing: true,
      irrigation: true,
      fertilizer: true,
      pests: true,
      diseases: true,
      harvesting: true,
      yield: true
    });
    try {
      const response = await fetch(`/api/crop-guide?crop=${encodeURIComponent(cropName)}`);
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setSelectedCrop(data.data);
        if (data.source === 'ai') {
          toast.success('Guide generated using AI / AI द्वारा गाइड बनाया गया');
        }
      } else {
        toast.error(data.message || 'Failed to load crop details');
      }
    } catch (error) {
      console.error('Error loading crop detail:', error);
      toast.error('Failed to load crop details / फसल विवरण लोड करने में विफल');
    } finally {
      setLoadingDetail(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter guides based on search
  const filteredGuides = guides.filter(g => 
    g.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Loading... / लोड हो रहा है...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-green-800">
            Farmer Guide <span className="text-lg sm:text-2xl text-gray-600">/ कृषि मार्गदर्शिका</span>
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Complete cultivation guides for various crops. Learn best practices from sowing to harvesting.
        </p>
        <p className="text-gray-600 text-sm">
          विभिन्न फसलों के लिए संपूर्ण खेती गाइड। बुवाई से कटाई तक सर्वोत्तम प्रथाओं को सीखें।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crop List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Select Crop / फसल चुनें
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crops... / फसल खोजें..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Crop List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : filteredGuides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No crops found</p>
                  <p className="text-sm">कोई फसल नहीं मिली</p>
                </div>
              ) : (
                filteredGuides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => loadCropDetail(guide.cropName)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      selectedCrop?.cropName === guide.cropName
                        ? 'bg-green-50 border-2 border-green-500 text-green-900'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{guide.cropName}</div>
                    {'yield' in guide && typeof guide.yield === 'string' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Yield: {guide.yield}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Crop Detail Section */}
        <div className="lg:col-span-2">
          {!selectedCrop ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select a Crop to View Guide
              </h3>
              <p className="text-gray-500">
                गाइड देखने के लिए एक फसल चुनें
              </p>
            </div>
          ) : loadingDetail ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
              <p className="text-center text-gray-600 mt-4">Loading guide... / गाइड लोड हो रहा है...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Crop Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{String(selectedCrop.cropName || '')}</h2>
                {'yield' in selectedCrop && typeof selectedCrop.yield === 'string' && (
                  <div className="flex items-center gap-2 text-green-100">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Expected Yield: {String(selectedCrop.yield)}</span>
                  </div>
                )}
              </div>

              {/* Guide Sections */}
              <div className="space-y-3">
                {/* Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('overview')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-green-600"><BookOpen className="w-5 h-5" /></div>
                      <h3 className="text-lg font-semibold text-gray-800">Overview / अवलोकन</h3>
                    </div>
                    {expandedSections.overview ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.overview && (
                    <div className="px-4 pb-4">
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {String(selectedCrop.overview || '')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Climate */}
                {selectedCrop.climate && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('climate')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-green-600"><CloudSun className="w-5 h-5" /></div>
                        <h3 className="text-lg font-semibold text-gray-800">Climate / जलवायु</h3>
                      </div>
                      {expandedSections.climate ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.climate && (
                      <div className="px-4 pb-4">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {String(selectedCrop.climate || '')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Soil Type */}
                {selectedCrop.soilType && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('soilType')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-green-600"><Leaf className="w-5 h-5" /></div>
                        <h3 className="text-lg font-semibold text-gray-800">Soil Type / मिट्टी का प्रकार</h3>
                      </div>
                      {expandedSections.soilType ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.soilType && (
                      <div className="px-4 pb-4">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {String(selectedCrop.soilType || '')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sowing */}
                {selectedCrop.sowing && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('sowing')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-green-600"><Sprout className="w-5 h-5" /></div>
                        <h3 className="text-lg font-semibold text-gray-800">Sowing / बुवाई</h3>
                      </div>
                      {expandedSections.sowing ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.sowing && (
                      <div className="px-4 pb-4">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {String(selectedCrop.sowing || '')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Irrigation */}
                {selectedCrop.irrigation && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('irrigation')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-green-600"><Droplets className="w-5 h-5" /></div>
                        <h3 className="text-lg font-semibold text-gray-800">Irrigation / सिंचाई</h3>
                      </div>
                      {expandedSections.irrigation ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.irrigation && (
                      <div className="px-4 pb-4">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {String(selectedCrop.irrigation || '')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Fertilizer */}
                {selectedCrop.fertilizer && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('fertilizer')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-green-600"><Leaf className="w-5 h-5" /></div>
                        <h3 className="text-lg font-semibold text-gray-800">Fertilizer / उर्वरक</h3>
                      </div>
                      {expandedSections.fertilizer ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.fertilizer && (
                      <div className="px-4 pb-4">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {String(selectedCrop.fertilizer || '')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pests */}
                {selectedCrop.pests && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('pests')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-green-600"><Bug className="w-5 h-5" /></div>
                        <h3 className="text-lg font-semibold text-gray-800">Pest Management / कीट प्रबंधन</h3>
                      </div>
                      {expandedSections.pests ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.pests && (
                      <div className="px-4 pb-4">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {String(selectedCrop.pests || '')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Diseases */}
                {selectedCrop.diseases && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('diseases')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-green-600"><AlertTriangle className="w-5 h-5" /></div>
                        <h3 className="text-lg font-semibold text-gray-800">Disease Management / रोग प्रबंधन</h3>
                      </div>
                      {expandedSections.diseases ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.diseases && (
                      <div className="px-4 pb-4">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {String(selectedCrop.diseases || '')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Harvesting */}
                {selectedCrop.harvesting && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('harvesting')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-green-600"><Scissors className="w-5 h-5" /></div>
                        <h3 className="text-lg font-semibold text-gray-800">Harvesting / कटाई</h3>
                      </div>
                      {expandedSections.harvesting ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.harvesting && (
                      <div className="px-4 pb-4">
                        <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {String(selectedCrop.harvesting || '')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Video Resources */}
                {selectedCrop?.videoUrls && selectedCrop.videoUrls.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <PlayCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Video Resources / वीडियो संसाधन
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {selectedCrop.videoUrls.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Video {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

