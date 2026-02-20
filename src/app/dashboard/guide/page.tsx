'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BookOpen, Search, Sprout, CloudSun, Droplets, Leaf, Bug, AlertTriangle, Scissors, TrendingUp, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

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
  const { t, language } = useLanguage();
  const [guides, setGuides] = useState<CropGuide[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<CropGuide | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCropName, setNewCropName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [addingCrop, setAddingCrop] = useState(false);
  const hasAutoLoadedCropRef = useRef(false);
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
      toast.error(t('Please sign in to access farmer guide', 'कृपया साइन इन करें'));
      router.replace('/?auth=login');
    }
  }, [status, router, t]);

  const loadCropDetail = useCallback(async (cropName: string) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/crop-guide?crop=${encodeURIComponent(cropName)}&language=${encodeURIComponent(language)}`);
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        const detail = data.data as CropGuide;
        setSelectedCrop(detail);

        setGuides((prev) => {
          const exists = prev.some((item) => item.cropName.toLowerCase() === String(detail.cropName).toLowerCase());
          if (exists) {
            return prev;
          }

          return [...prev, {
            id: detail.id || `custom-${String(detail.cropName).toLowerCase().replace(/\s+/g, '-')}`,
            cropName: detail.cropName,
            overview: detail.overview,
            yield: detail.yield,
          }].sort((a, b) => a.cropName.localeCompare(b.cropName));
        });

        if (data.source === 'ai') {
          toast.success(t('Guide generated using AI', 'AI से गाइड तैयार किया गया', 'AI ने मार्गदर्शक तयार केला'));
        }
        return detail;
      } else {
        toast.error(t('Failed to load crop details', 'फसल विवरण लोड करने में विफल'));
      }
    } catch (error) {
      console.error('Error loading crop detail:', error);
      toast.error(t('Failed to load crop details', 'फसल विवरण लोड करने में विफल'));
    } finally {
      setLoadingDetail(false);
    }

    return null;
  }, [language, t]);

  const loadGuides = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crop-guide');
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        const loadedGuides: CropGuide[] = Array.isArray(data.data) ? data.data : [];
        setGuides(loadedGuides);

        if (loadedGuides.length > 0 && !hasAutoLoadedCropRef.current) {
          hasAutoLoadedCropRef.current = true;
          await loadCropDetail(loadedGuides[0].cropName);
        }
      } else {
        toast.error(t('Failed to load crop guides', 'फसल गाइड लोड करने में विफल'));
      }
    } catch (error) {
      console.error('Error loading guides:', error);
      toast.error(t('Failed to load crop guides', 'फसल गाइड लोड करने में विफल'));
    } finally {
      setLoading(false);
    }
  }, [loadCropDetail, t]);

  // Load crop guides
  useEffect(() => {
    if (status === 'authenticated') {
      loadGuides();
    }
  }, [status, loadGuides]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const cleanGuideText = (value?: string) => {
    if (!value) return '';
    return String(value)
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(?!\s)/g, '')
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const getLanguageSpecificText = (value?: string) => {
    const cleaned = cleanGuideText(value);
    if (!cleaned) return '';

    const sectionRegex = /(EN|HI|MR)\s*:\s*([\s\S]*?)(?=(?:\n\s*)?(?:EN|HI|MR)\s*:|$)/gi;
    const sections: Partial<Record<'en' | 'hi' | 'mr', string>> = {};
    let match: RegExpExecArray | null;

    while ((match = sectionRegex.exec(cleaned)) !== null) {
      const code = match[1].toLowerCase() as 'en' | 'hi' | 'mr';
      sections[code] = (match[2] || '').trim();
    }

    if (!sections.en && !sections.hi && !sections.mr) {
      return language === 'en' ? cleaned : '';
    }

    return sections[language] || '';
  };

  const getGuideLines = (value?: string) => {
    const cleaned = getLanguageSpecificText(value);
    if (!cleaned) return [];

    return cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^[-•]\s*/, '').trim());
  };

  const handleAddCrop = async () => {
    const cleaned = newCropName.trim().replace(/\s+/g, ' ');
    if (cleaned.length < 2) {
      toast.error(t('Please enter a valid crop name', 'कृपया सही फसल नाम दर्ज करें', 'कृपया वैध पीक नाव टाका'));
      return;
    }

    setAddingCrop(true);
    try {
      const detail = await loadCropDetail(cleaned);
      if (detail) {
        setNewCropName('');
        toast.success(t('Crop added successfully', 'फसल सफलतापूर्वक जोड़ी गई', 'पीक यशस्वीरित्या जोडले गेले'));
      }
    } finally {
      setAddingCrop(false);
    }
  };

  const getPreviewText = (value?: string) => {
    const lines = getGuideLines(value);
    return lines[0] || '';
  };

  const renderGuideSection = (value?: string) => {
    const lines = getGuideLines(value);
    if (lines.length === 0) {
      return <p className="text-gray-500">{t('No information available.', 'जानकारी उपलब्ध नहीं है।', 'माहिती उपलब्ध नाही.')}</p>;
    }

    return (
      <div className="space-y-2">
        {lines.map((line, idx) => (
          <div key={`${line}-${idx}`} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-green-600 shrink-0" />
            <p className="text-gray-700 leading-relaxed">{line}</p>
          </div>
        ))}
      </div>
    );
  };

  // Filter guides based on search
  const filteredGuides = guides.filter(g => 
    g.cropName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">{t('Loading...', 'लोड हो रहा है...')}</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 max-w-7xl">
      {/* Header Section */}
      <div className="mb-5 sm:mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-green-800">
            {t('Farmer Guide', 'कृषि मार्गदर्शिका')}
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          {t(
            'Complete cultivation guides for various crops. Learn best practices from sowing to harvesting.',
            'विभिन्न फसलों के लिए संपूर्ण खेती गाइड। बुवाई से कटाई तक सर्वोत्तम प्रथाओं को सीखें।'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Crop List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              {t('Select Crop', 'फसल चुनें', 'पीक निवडा')}
            </h2>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search crops...', 'फसल खोजें...')}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"
              />
            </div>

            <div className="mb-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('Add New Crop', 'नई फसल जोड़ें', 'नवीन पीक जोडा')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleAddCrop();
                    }
                  }}
                  placeholder={t('e.g., Banana', 'जैसे, केला', 'उदा. केळी')}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => void handleAddCrop()}
                  disabled={addingCrop}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {addingCrop ? t('Adding...', 'जोड़ा जा रहा...', 'जोडत आहे...') : t('Add', 'जोड़ें', 'जोडा')}
                </button>
              </div>
            </div>

            {/* Crop List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : filteredGuides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('No crops found', 'कोई फसल नहीं मिली')}</p>
                </div>
              ) : (
                filteredGuides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => loadCropDetail(guide.cropName)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedCrop?.cropName === guide.cropName
                        ? 'bg-green-50 border-2 border-green-500 text-green-900 shadow-sm'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{guide.cropName}</div>
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
                {t('Select a Crop to View Guide', 'गाइड देखने के लिए एक फसल चुनें', 'मार्गदर्शक पाहण्यासाठी एक पीक निवडा')}
              </h3>
              <p className="text-gray-500">{t('Choose a crop (e.g., Potato) to view requirements and cultivation steps', 'फसल (जैसे आलू) चुनें और आवश्यकताएँ व खेती के चरण देखें', 'पीक (उदा. बटाटा) निवडा आणि गरजा व लागवड पायऱ्या पहा')}</p>
            </div>
          ) : loadingDetail ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
              <p className="text-center text-gray-600 mt-4">{t('Loading guide...', 'गाइड लोड हो रहा है...')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Crop Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{String(selectedCrop.cropName || '')}</h2>
                {'yield' in selectedCrop && typeof selectedCrop.yield === 'string' && (
                  <div className="flex items-center gap-2 text-green-100">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">{t('Expected Yield:', 'अपेक्षित उपज:', 'अपेक्षित उत्पादन:')} {getPreviewText(selectedCrop.yield)}</span>
                  </div>
                )}
              </div>

              {/* Quick Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCrop.climate && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1 text-green-700">
                      <CloudSun className="w-4 h-4" />
                      <p className="text-sm font-semibold">{t('Climate Requirement', 'जलवायु आवश्यकता', 'हवामान आवश्यकता')}</p>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{getPreviewText(selectedCrop.climate)}</p>
                  </div>
                )}
                {selectedCrop.soilType && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1 text-green-700">
                      <Leaf className="w-4 h-4" />
                      <p className="text-sm font-semibold">{t('Soil Requirement', 'मिट्टी की आवश्यकता', 'मातीची आवश्यकता')}</p>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{getPreviewText(selectedCrop.soilType)}</p>
                  </div>
                )}
                {selectedCrop.sowing && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1 text-green-700">
                      <Sprout className="w-4 h-4" />
                      <p className="text-sm font-semibold">{t('How to Grow (Sowing)', 'कैसे उगाएँ (बुवाई)', 'कसे पिकवायचे (पेरणी)')}</p>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{getPreviewText(selectedCrop.sowing)}</p>
                  </div>
                )}
                {selectedCrop.irrigation && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1 text-green-700">
                      <Droplets className="w-4 h-4" />
                      <p className="text-sm font-semibold">{t('Water Requirement', 'सिंचाई आवश्यकता', 'पाण्याची आवश्यकता')}</p>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{getPreviewText(selectedCrop.irrigation)}</p>
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
                      <h3 className="text-lg font-semibold text-gray-800">{t('Crop Overview', 'फसल का अवलोकन', 'पीकाचा आढावा')}</h3>
                    </div>
                    {expandedSections.overview ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedSections.overview && (
                    <div className="px-4 pb-4">
                      {renderGuideSection(selectedCrop.overview)}
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
                        <h3 className="text-lg font-semibold text-gray-800">{t('Climate Requirement', 'जलवायु आवश्यकता', 'हवामान आवश्यकता')}</h3>
                      </div>
                      {expandedSections.climate ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.climate && (
                      <div className="px-4 pb-4">
                        {renderGuideSection(selectedCrop.climate)}
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
                        <h3 className="text-lg font-semibold text-gray-800">{t('Soil Requirement', 'मिट्टी की आवश्यकता', 'मातीची आवश्यकता')}</h3>
                      </div>
                      {expandedSections.soilType ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.soilType && (
                      <div className="px-4 pb-4">
                        {renderGuideSection(selectedCrop.soilType)}
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
                        <h3 className="text-lg font-semibold text-gray-800">{t('How to Grow (Sowing)', 'कैसे उगाएँ (बुवाई)', 'कसे पिकवायचे (पेरणी)')}</h3>
                      </div>
                      {expandedSections.sowing ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.sowing && (
                      <div className="px-4 pb-4">
                        {renderGuideSection(selectedCrop.sowing)}
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
                        <h3 className="text-lg font-semibold text-gray-800">{t('Water Requirement', 'सिंचाई आवश्यकता', 'पाण्याची आवश्यकता')}</h3>
                      </div>
                      {expandedSections.irrigation ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.irrigation && (
                      <div className="px-4 pb-4">
                        {renderGuideSection(selectedCrop.irrigation)}
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
                        <h3 className="text-lg font-semibold text-gray-800">{t('Nutrition Plan', 'पोषण योजना', 'पोषण योजना')}</h3>
                      </div>
                      {expandedSections.fertilizer ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.fertilizer && (
                      <div className="px-4 pb-4">
                        {renderGuideSection(selectedCrop.fertilizer)}
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
                        <h3 className="text-lg font-semibold text-gray-800">{t('Pest Control', 'कीट नियंत्रण', 'किड नियंत्रण')}</h3>
                      </div>
                      {expandedSections.pests ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.pests && (
                      <div className="px-4 pb-4">
                        {renderGuideSection(selectedCrop.pests)}
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
                        <h3 className="text-lg font-semibold text-gray-800">{t('Disease Control', 'रोग नियंत्रण', 'रोग नियंत्रण')}</h3>
                      </div>
                      {expandedSections.diseases ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.diseases && (
                      <div className="px-4 pb-4">
                        {renderGuideSection(selectedCrop.diseases)}
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
                        <h3 className="text-lg font-semibold text-gray-800">{t('Harvest & Storage', 'कटाई और भंडारण', 'काढणी आणि साठवण')}</h3>
                      </div>
                      {expandedSections.harvesting ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedSections.harvesting && (
                      <div className="px-4 pb-4">
                        {renderGuideSection(selectedCrop.harvesting)}
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
                        {t('Video Resources', 'वीडियो संसाधन')}
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
                          {t('Video', 'वीडियो')} {idx + 1}
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

