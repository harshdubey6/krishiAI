'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BookOpen, Search, Sprout, CloudSun, Droplets, Leaf, Bug, AlertTriangle, Scissors, TrendingUp, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FarmerGuidePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guides, setGuides] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
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
    try {
      const response = await fetch(`/api/crop-guide?crop=${encodeURIComponent(cropName)}`);
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setSelectedCrop(data.data);
        if (data.source === 'ai') {
          toast.success('Guide generated using AI');
        }
      } else {
        toast.error('Failed to load crop details');
      }
    } catch (error) {
      console.error('Error loading crop detail:', error);
      toast.error('Failed to load crop details');
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
                    {guide.yield && (
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
                <h2 className="text-3xl font-bold mb-2">{selectedCrop.cropName}</h2>
                {selectedCrop.yield && (
                  <div className="flex items-center gap-2 text-green-100">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Expected Yield: {selectedCrop.yield}</span>
                  </div>
                )}
              </div>

              {/* Guide Sections */}
              <div className="space-y-3">
                {/* Overview */}
                <GuideSection
                  icon={<BookOpen className="w-5 h-5" />}
                  title="Overview / अवलोकन"
                  content={selectedCrop.overview}
                  isExpanded={expandedSections.overview}
                  onToggle={() => toggleSection('overview')}
                />

                {/* Climate */}
                {selectedCrop.climate && (
                  <GuideSection
                    icon={<CloudSun className="w-5 h-5" />}
                    title="Climate / जलवायु"
                    content={selectedCrop.climate}
                    isExpanded={expandedSections.climate}
                    onToggle={() => toggleSection('climate')}
                  />
                )}

                {/* Soil Type */}
                {selectedCrop.soilType && (
                  <GuideSection
                    icon={<Leaf className="w-5 h-5" />}
                    title="Soil Type / मिट्टी का प्रकार"
                    content={selectedCrop.soilType}
                    isExpanded={expandedSections.soilType}
                    onToggle={() => toggleSection('soilType')}
                  />
                )}

                {/* Sowing */}
                {selectedCrop.sowing && (
                  <GuideSection
                    icon={<Sprout className="w-5 h-5" />}
                    title="Sowing / बुवाई"
                    content={selectedCrop.sowing}
                    isExpanded={expandedSections.sowing}
                    onToggle={() => toggleSection('sowing')}
                  />
                )}

                {/* Irrigation */}
                {selectedCrop.irrigation && (
                  <GuideSection
                    icon={<Droplets className="w-5 h-5" />}
                    title="Irrigation / सिंचाई"
                    content={selectedCrop.irrigation}
                    isExpanded={expandedSections.irrigation}
                    onToggle={() => toggleSection('irrigation')}
                  />
                )}

                {/* Fertilizer */}
                {selectedCrop.fertilizer && (
                  <GuideSection
                    icon={<Leaf className="w-5 h-5" />}
                    title="Fertilizer / उर्वरक"
                    content={selectedCrop.fertilizer}
                    isExpanded={expandedSections.fertilizer}
                    onToggle={() => toggleSection('fertilizer')}
                  />
                )}

                {/* Pests */}
                {selectedCrop.pests && (
                  <GuideSection
                    icon={<Bug className="w-5 h-5" />}
                    title="Pest Management / कीट प्रबंधन"
                    content={selectedCrop.pests}
                    isExpanded={expandedSections.pests}
                    onToggle={() => toggleSection('pests')}
                  />
                )}

                {/* Diseases */}
                {selectedCrop.diseases && (
                  <GuideSection
                    icon={<AlertTriangle className="w-5 h-5" />}
                    title="Disease Management / रोग प्रबंधन"
                    content={selectedCrop.diseases}
                    isExpanded={expandedSections.diseases}
                    onToggle={() => toggleSection('diseases')}
                  />
                )}

                {/* Harvesting */}
                {selectedCrop.harvesting && (
                  <GuideSection
                    icon={<Scissors className="w-5 h-5" />}
                    title="Harvesting / कटाई"
                    content={selectedCrop.harvesting}
                    isExpanded={expandedSections.harvesting}
                    onToggle={() => toggleSection('harvesting')}
                  />
                )}

                {/* Video Resources */}
                {selectedCrop.videoUrls && selectedCrop.videoUrls.length > 0 && (
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

// Guide Section Component
function GuideSection({ 
  icon, 
  title, 
  content, 
  isExpanded, 
  onToggle 
}: { 
  icon: React.ReactNode; 
  title: string; 
  content: string; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-green-600">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
