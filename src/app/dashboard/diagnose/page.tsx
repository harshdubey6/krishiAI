'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Sprout, AlertTriangle, TrendingUp, IndianRupee, Activity, CheckCircle, Upload, X, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function DiagnosePage() {
  const { data: session, status } = useSession();
  const { t, language } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<{id?: string; messages?: Array<{id?: string; role: string; content: string}>; [key: string]: unknown} | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [autoGenerateFields, setAutoGenerateFields] = useState(true);
  const [isGeneratingFields, setIsGeneratingFields] = useState(false);

  // Hooks must be called before any conditional returns
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('Image size should be less than 10MB', 'छवि का आकार 10MB से कम होना चाहिए'));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error(t('Please upload a valid image', 'कृपया एक मान्य छवि अपलोड करें'));
    }
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  // Auth redirect is handled by dashboard layout and middleware

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (diagnosis?.messages?.length) {
      const chatDiv = document.getElementById('chat-messages');
      if (chatDiv) {
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }
  }, [diagnosis?.messages]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">{t('Loading...', 'लोड हो रहा है...')}</p>
      </div>
    );
  }

  // Don't show content if not authenticated
  if (!session) {
    return null;
  }

  const handleDiagnose = async () => {
    if (!image) {
      toast.error(t('Please upload an image', 'कृपया एक छवि अपलोड करें'));
      return;
    }
    if (!cropType.trim()) {
      toast.error(t('Please specify crop type', 'कृपया फसल का प्रकार बताएं'));
      return;
    }
    if (!symptoms.trim()) {
      toast.error(t('Please describe symptoms', 'कृपया लक्षण बताएं'));
      return;
    }

    setIsSending(true);
    setDiagnosis(null);
    toast.loading(t('Analyzing crop...', 'फसल का विश्लेषण हो रहा है...'), { id: 'analyze' });

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          cropType: cropType.trim(),
          symptoms: symptoms.trim(),
          language,
        }),
      });

      const text = await response.text();
      let data: {status?: string; message?: string; error?: string; data?: {messages?: Array<{role: string; content: string}>; [key: string]: unknown}};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to analyze crop');
      }

      toast.success(t('Analysis complete!', 'विश्लेषण पूर्ण!'), { id: 'analyze' });
      setDiagnosis(data.data || null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('Failed to analyze crop', 'फसल का विश्लेषण विफल रहा'),
        { id: 'analyze' }
      );
      console.error('Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sendChat = async () => {
    if (!diagnosis?.id || !chatInput.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/diagnose/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosisId: diagnosis.id, message: chatInput.trim(), language }),
      });
      const text = await res.text();
      let data: {status?: string; message?: string; data?: {reply?: string; userMessage?: {id: string; role: string; content: string; createdAt: string}; assistantMessage?: {id: string; role: string; content: string; createdAt: string}}};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 200)}`);
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to send');

      const userMsg = data?.data?.userMessage;
      const assistantMsg = data?.data?.assistantMessage;

      setDiagnosis((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...(prev.messages || []),
                userMsg
                  ? { id: userMsg.id, role: userMsg.role, content: userMsg.content, createdAt: userMsg.createdAt }
                  : { id: `temp-u-${Date.now()}`, role: 'user', content: chatInput, createdAt: new Date().toISOString() },
                assistantMsg
                  ? { id: assistantMsg.id, role: assistantMsg.role, content: assistantMsg.content, createdAt: assistantMsg.createdAt }
                  : { id: `temp-a-${Date.now()}`, role: 'assistant', content: data?.data?.reply ?? 'No reply', createdAt: new Date().toISOString() },
              ],
            }
          : prev
      );
      setChatInput('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Failed to send', 'भेजने में विफल'));
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateFields = async () => {
    if (!image) {
      toast.error(t('Please upload an image first', 'पहले एक छवि अपलोड करें', 'कृपया आधी प्रतिमा अपलोड करा'));
      return;
    }

    setIsGeneratingFields(true);
    toast.loading(t('Generating crop details with AI...', 'AI से फसल विवरण जनरेट हो रहा है...', 'AI ने पीक तपशील तयार होत आहे...'), { id: 'autofill' });

    try {
      const response = await fetch('/api/diagnose/autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image, language }),
      });

      const data = await response.json();
      if (!response.ok || data?.status !== 'success') {
        throw new Error(data?.message || 'Failed to generate details');
      }

      const generatedCropType = String(data?.data?.cropType || '').trim();
      const generatedSymptoms = String(data?.data?.symptoms || '').trim();

      if (generatedCropType) {
        setCropType(generatedCropType);
      }
      if (generatedSymptoms) {
        setSymptoms(generatedSymptoms);
      }

      toast.success(t('Crop details generated successfully', 'फसल विवरण सफलतापूर्वक जनरेट हुआ', 'पीक तपशील यशस्वीरीत्या तयार झाला'), { id: 'autofill' });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('Failed to generate crop details', 'फसल विवरण जनरेट करने में विफल', 'पीक तपशील तयार करण्यात अयशस्वी'),
        { id: 'autofill' }
      );
    } finally {
      setIsGeneratingFields(false);
    }
  };

  const getSeverityLabel = (severity?: unknown): string => {
    if (!severity || typeof severity !== 'string') return t('Unknown', 'अज्ञात', 'अज्ञात');
    const s = severity.trim().toLowerCase();
    if (s.includes('mild') || s.includes('हल्का') || s.includes('हलकी')) return t('Mild', 'हल्का', 'हलकी');
    if (s.includes('moderate') || s.includes('medium') || s.includes('मध्यम')) return t('Moderate', 'मध्यम', 'मध्यम');
    if (s.includes('severe') || s.includes('high') || s.includes('गंभीर')) return t('Severe', 'गंभीर', 'गंभीर');
    // fallback: return first word only
    return severity.trim().split(/[.\s,]/)[0] || t('Unknown', 'अज्ञात', 'अज्ञात');
  };

  const getSeverityColor = (severity?: unknown) => {
    if (!severity || typeof severity !== 'string') return 'bg-gray-100 text-gray-800';

    const normalizedSeverity = severity.trim().toLowerCase();

    if (
      normalizedSeverity.includes('mild') ||
      normalizedSeverity.includes('हल्का') ||
      normalizedSeverity.includes('हलकी')
    ) {
      return 'bg-green-100 text-green-800';
    }

    if (
      normalizedSeverity.includes('moderate') ||
      normalizedSeverity.includes('medium') ||
      normalizedSeverity.includes('मध्यम')
    ) {
      return 'bg-yellow-100 text-yellow-800';
    }

    if (
      normalizedSeverity.includes('severe') ||
      normalizedSeverity.includes('high') ||
      normalizedSeverity.includes('गंभीर')
    ) {
      return 'bg-red-100 text-red-800';
    }

    return 'bg-gray-100 text-gray-800';
  };

  const getSeverityIcon = (severity?: unknown) => {
    if (!severity || typeof severity !== 'string') return <Activity className="w-4 h-4" />;

    const normalizedSeverity = severity.trim().toLowerCase();

    if (
      normalizedSeverity.includes('mild') ||
      normalizedSeverity.includes('हल्का') ||
      normalizedSeverity.includes('हलकी')
    ) {
      return <CheckCircle className="w-4 h-4" />;
    }

    if (
      normalizedSeverity.includes('moderate') ||
      normalizedSeverity.includes('medium') ||
      normalizedSeverity.includes('मध्यम')
    ) {
      return <AlertTriangle className="w-4 h-4" />;
    }

    if (
      normalizedSeverity.includes('severe') ||
      normalizedSeverity.includes('high') ||
      normalizedSeverity.includes('गंभीर')
    ) {
      return <AlertTriangle className="w-4 h-4" />;
    }

    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="mx-auto px-3 sm:px-4 lg:px-6 py-1 sm:py-2 lg:py-3 max-w-7xl">
      {/* Header Section */}
      <div className="mb-4 sm:mb-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-green-800">
            {t('Crop Diagnosis', 'फसल निदान')}
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          {t(
            'Upload a clear photo and describe symptoms. Get AI-powered diagnosis with treatment recommendations.',
            'एक स्पष्ट फोटो अपलोड करें और लक्षणों का वर्णन करें। उपचार की सिफारिशों के साथ AI-संचालित निदान प्राप्त करें।'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 items-stretch">
        {/* Crop Image Upload Section */}
        <div className="space-y-4 h-full">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                {t('Crop Image', 'फसल की छवि')}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('Upload a clear photo showing the problem area', 'समस्या क्षेत्र दिखाने वाली स्पष्ट फोटो अपलोड करें')}
            </p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all touch-manipulation active:scale-95 flex-1 min-h-[300px] flex items-center justify-center
                ${
                  isDragActive
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                } ${image ? 'border-green-500 bg-green-50' : ''}`}
            >
              <input {...getInputProps()} />
              {image ? (
                <div className="relative w-full h-full min-h-[280px]">
                  <Image src={image} alt="Uploaded crop" fill className="object-contain rounded-lg" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg 
                      hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 
                      focus:ring-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    <p className="font-medium">{t('Click to upload or drag and drop', 'अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें')}</p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 
                      rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    {t('Select Image', 'छवि चुनें')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Crop Information Section */}
        <div className="space-y-4 h-full">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <Sprout className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  {t('Crop Information', 'फसल की जानकारी', 'पीक माहिती')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAutoGenerateFields((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                  autoGenerateFields
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-gray-50 text-gray-600 border-gray-300'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${autoGenerateFields ? 'bg-green-600' : 'bg-gray-400'}`}
                />
                {t('Generate with AI', 'AI से जनरेट करें', 'AI ने तयार करा')}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('Provide details about your crop', 'अपनी फसल के बारे में विवरण प्रदान करें')}
            </p>

            {autoGenerateFields && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGenerateFields}
                  disabled={!image || isGeneratingFields}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    !image || isGeneratingFields
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isGeneratingFields
                    ? t('Generating...', 'जनरेट हो रहा है...', 'तयार होत आहे...')
                    : t('Generate Crop Type & Symptoms', 'फसल प्रकार और लक्षण जनरेट करें', 'पीक प्रकार आणि लक्षणे तयार करा')}
                </button>
              </div>
            )}

            <div className="space-y-5 flex-1">
              <div>
                <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Crop Type', 'फसल का प्रकार')}
                </label>
                <input
                  type="text"
                  id="cropType"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder={t('e.g., Wheat, Rice, Tomato, Cotton', 'उदा: गेहूं, धान, टमाटर, कपास')}
                  className="block w-full px-4 py-3 bg-white border border-gray-300 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                    focus:border-transparent transition-colors text-base text-gray-800"
                />
              </div>

              <div>
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Symptoms Description', 'लक्षणों का विवरण')}
                </label>
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={t(
                    'Describe what you observe: leaf discoloration, spots, wilting, growth issues...',
                    'आप क्या देखते हैं इसका वर्णन करें: पत्ती का रंग बदलना, धब्बे, मुरझाना, वृद्धि की समस्या...'
                  )}
                  rows={7}
                  className="block w-full px-4 py-3 bg-white border border-gray-300 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                    focus:border-transparent transition-colors resize-none text-base text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnose Button */}
      <div className="mt-4 sm:mt-5 flex justify-center px-2 sm:px-0">
        <button
          onClick={handleDiagnose}
          disabled={isSending || isGeneratingFields || !image || !cropType.trim() || !symptoms.trim()}
          className={`w-full sm:w-auto sm:min-w-[260px] sm:max-w-[320px] px-6 sm:px-7 py-3 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-base sm:text-lg font-semibold
            transition-all focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-green-500 shadow-md hover:shadow-xl touch-manipulation
            ${
              isSending || isGeneratingFields || !image || !cropType.trim() || !symptoms.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-green-700 hover:to-emerald-700 transform hover:-translate-y-0.5'
            }`}
        >
          {isSending ? (
            <span className="flex items-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t('Analyzing...', 'विश्लेषण हो रहा है...')}
            </span>
          ) : (
            t('Diagnose Crop', 'फसल का निदान करें')
          )}
        </button>
      </div>

      {/* Diagnosis Result & Chat */}
      {diagnosis && (
        <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">{t('Severity', 'गंभीरता', 'तीव्रता')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {getSeverityLabel(diagnosis.severity)}
                </div>
              </div>
              <p className={`text-xs font-medium mt-3 px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${getSeverityColor(diagnosis.severity)}`}>
                {getSeverityIcon(diagnosis.severity)}
                {t('Disease level', 'रोग स्तर', 'रोग पातळी')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">{t('Confidence', 'विश्वास', 'विश्वास')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{typeof diagnosis.confidence === 'number' ? diagnosis.confidence : 0}%</div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${typeof diagnosis.confidence === 'number' ? diagnosis.confidence : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">{t('Est. Cost', 'अनुमानित लागत', 'अंदाजे खर्च')}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{typeof diagnosis.estimatedCost === 'number' ? diagnosis.estimatedCost.toLocaleString('en-IN') : t('N/A', 'उपलब्ध नहीं', 'उपलब्ध नाही')}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">{t('Treatment cost estimate', 'उपचार लागत का अनुमान', 'उपचार खर्चाचा अंदाज')}</p>
            </div>
          </div>

          <div className="max-w-5xl">
            <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">{t('Diagnosis Result', 'निदान परिणाम', 'निदान परिणाम')}</h3>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  {t('AI Analysis', 'AI विश्लेषण', 'AI विश्लेषण')}
                </span>
              </div>

              <div className="space-y-4 text-base text-gray-800 leading-8">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="font-semibold text-green-800 mb-2">{t('Diagnosis:', 'निदान:', 'निदान:')}</p>
                  <p className="whitespace-pre-wrap">{String(diagnosis.diagnosis || '')}</p>
                </div>

                {Array.isArray(diagnosis.causes) && diagnosis.causes.length > 0 && (
                  <details open className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4" />
                      {t('Causes', 'कारण', 'कारणे')}
                    </summary>
                    <ul className="mt-3 space-y-2 list-disc pl-5">
                      {diagnosis.causes.map((c, idx) => (
                        <li key={idx} className="text-gray-700 leading-7">{String(c)}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {Array.isArray(diagnosis.treatment) && diagnosis.treatment.length > 0 && (
                  <details open className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      <CheckCircle className="w-4 h-4" />
                      {t('Treatment', 'उपचार', 'उपचार')}
                    </summary>
                    <ul className="mt-3 space-y-2 list-disc pl-5">
                      {(diagnosis.treatment as unknown[]).map((item, index) => (
                        <li key={index} className="text-gray-700 leading-7">{String(item)}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {Array.isArray(diagnosis.prevention) && (diagnosis.prevention as unknown[]).length > 0 && (
                  <details open className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                    <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      <Sprout className="w-4 h-4" />
                      {t('Prevention', 'रोकथाम', 'प्रतिबंध')}
                    </summary>
                    <ul className="mt-3 space-y-2 list-disc pl-5">
                      {(diagnosis.prevention as unknown[]).map((item, index) => (
                        <li key={index} className="text-gray-700 leading-7">{String(item)}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">{t('Ask Questions', 'प्रश्न पूछें', 'प्रश्न विचारा')}</h3>
              </div>
              <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                {t('Follow-up Chat', 'फॉलो-अप चैट', 'पुढील चॅट')}
              </span>
            </div>

            <div className="min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 pr-1 mb-4 bg-gray-50 border border-gray-100 rounded-xl p-3" id="chat-messages">
              {diagnosis.messages && diagnosis.messages.length > 0 ? (
                diagnosis.messages.map((m, idx) => (
                  <div key={m.id || idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`${
                        m.role === 'user'
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      } px-4 py-3 rounded-2xl max-w-[92%] whitespace-pre-wrap leading-relaxed break-words shadow-sm text-[15px] ${m.id?.startsWith('temp') ? 'animate-pulse' : ''}`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-sm px-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-gray-700 mb-1">{t('No messages yet', 'अभी तक कोई संदेश नहीं', 'अजून संदेश नाहीत')}</p>
                  <p>{t('Ask a question to get started!', 'शुरू करने के लिए एक प्रश्न पूछें!', 'सुरुवात करण्यासाठी प्रश्न विचारा!')}</p>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSending && chatInput.trim()) {
                  sendChat();
                }
              }}
              className="flex gap-2 items-end"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t('Ask about care, treatments, prevention...', 'देखभाल, उपचार, रोकथाम के बारे में पूछें...', 'देखभाल, उपचार, प्रतिबंध याबद्दल विचारा...')}
                disabled={isSending}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-base text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className={`px-5 py-3 text-white rounded-xl transition-all focus:outline-none whitespace-nowrap focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium ${isSending || !chatInput.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : (
                  t('Send', 'भेजें', 'पाठवा')
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
