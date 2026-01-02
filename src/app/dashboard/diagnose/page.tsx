'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Sprout, AlertTriangle, TrendingUp, IndianRupee, Activity, CheckCircle, Upload, X } from 'lucide-react';

export default function DiagnosePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to access crop diagnosis / कृपया साइन इन करें');
      router.replace('/login');
    }
  }, [status, router]);

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
        <p className="text-gray-600">Loading... / लोड हो रहा है...</p>
      </div>
    );
  }

  // Don't show content if not authenticated
  if (!session) {
    return null;
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB / छवि का आकार 10MB से कम होना चाहिए');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image / कृपया एक मान्य छवि अपलोड करें');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleDiagnose = async () => {
    if (!image) {
      toast.error('Please upload an image / कृपया एक छवि अपलोड करें');
      return;
    }
    if (!cropType.trim()) {
      toast.error('Please specify crop type / कृपया फसल का प्रकार बताएं');
      return;
    }
    if (!symptoms.trim()) {
      toast.error('Please describe symptoms / कृपया लक्षण बताएं');
      return;
    }

    setIsSending(true);
    setDiagnosis(null);
    toast.loading('Analyzing crop... / फसल का विश्लेषण हो रहा है...', { id: 'analyze' });

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
        }),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to analyze crop');
      }

      toast.success('Analysis complete! / विश्लेषण पूर्ण!', { id: 'analyze' });
      setDiagnosis(data.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to analyze crop / फसल का विश्लेषण विफल रहा',
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
        body: JSON.stringify({ diagnosisId: diagnosis.id, message: chatInput.trim() }),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 200)}`);
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to send');

      const userMsg = data?.data?.userMessage;
      const assistantMsg = data?.data?.assistantMessage;

      setDiagnosis((prev: any) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages,
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send / भेजने में विफल');
    } finally {
      setIsSending(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-gray-100 text-gray-800';
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity?: string) => {
    if (!severity) return <Activity className="w-4 h-4" />;
    switch (severity.toLowerCase()) {
      case 'mild':
        return <CheckCircle className="w-4 h-4" />;
      case 'moderate':
        return <AlertTriangle className="w-4 h-4" />;
      case 'severe':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-green-800">
            Crop Diagnosis <span className="text-lg sm:text-2xl text-gray-600">/ फसल निदान</span>
          </h1>
        </div>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Upload a clear photo and describe symptoms. Get AI-powered diagnosis with treatment recommendations.
        </p>
        <p className="text-gray-600 text-sm">
          एक स्पष्ट फोटो अपलोड करें और लक्षणों का वर्णन करें। उपचार की सिफारिशों के साथ AI-संचालित निदान प्राप्त करें।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Crop Image Upload Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Crop Image <span className="text-gray-600">/ फसल की छवि</span>
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload a clear photo showing the problem area / समस्या क्षेत्र दिखाने वाली स्पष्ट फोटो अपलोड करें
            </p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all touch-manipulation active:scale-95
                ${
                  isDragActive
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                } ${image ? 'border-green-500 bg-green-50' : ''}`}
            >
              <input {...getInputProps()} />
              {image ? (
                <div className="relative aspect-video">
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
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें</p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 
                      rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Select Image / छवि चुनें
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Crop Information Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Sprout className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Crop Information <span className="text-gray-600">/ फसल की जानकारी</span>
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Provide details about your crop / अपनी फसल के बारे में विवरण प्रदान करें
            </p>

            <div className="space-y-6">
              <div>
                <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Type / फसल का प्रकार
                </label>
                <input
                  type="text"
                  id="cropType"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder="e.g., Wheat, Rice, Tomato, Cotton / गेहूं, धान, टमाटर..."
                  className="block w-full px-4 py-3 bg-white border border-gray-300 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                    focus:border-transparent transition-colors text-base text-gray-800"
                />
              </div>

              <div>
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms Description / लक्षणों का विवरण
                </label>
                <textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe what you observe: leaf discoloration, spots, wilting, growth issues...&#10;आप क्या देखते हैं इसका वर्णन करें: पत्ती का रंग बदलना, धब्बे, मुरझाना..."
                  rows={6}
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
      <div className="mt-6 sm:mt-8 flex justify-center px-4">
        <button
          onClick={handleDiagnose}
          disabled={isSending || !image || !cropType.trim() || !symptoms.trim()}
          className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-xl text-base sm:text-lg font-semibold
            transition-all focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-xl touch-manipulation
            ${
              isSending || !image || !cropType.trim() || !symptoms.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-green-700 transform hover:scale-105'
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
              Analyzing... / विश्लेषण हो रहा है...
            </span>
          ) : (
            'Diagnose Crop / फसल का निदान करें'
          )}
        </button>
      </div>

      {/* Diagnosis Result & Chat */}
      {diagnosis && (
        <div className="mt-6 sm:mt-10 space-y-4 sm:space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Severity Card */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Severity / गंभीरता</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(diagnosis.severity)}`}>
                  {getSeverityIcon(diagnosis.severity)}
                  <span className="capitalize">{diagnosis.severity || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Confidence Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Confidence / विश्वास</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900">{diagnosis.confidence || 0}%</div>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${diagnosis.confidence || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Estimated Cost Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Est. Cost / अनुमानित लागत</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{diagnosis.estimatedCost ? diagnosis.estimatedCost.toLocaleString('en-IN') : 'N/A'}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Treatment cost estimate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Diagnosis Details */}
            <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Diagnosis Result <span className="text-gray-600">/ निदान परिणाम</span>
                </h3>
              </div>
              <div className="space-y-4 text-base text-gray-800 leading-relaxed">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-green-800 mb-2">Diagnosis:</p>
                  <p className="whitespace-pre-wrap">{diagnosis.diagnosis}</p>
                </div>

                {diagnosis.causes && diagnosis.causes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Causes / कारण
                    </h4>
                    <ul className="space-y-2 list-disc pl-5">
                      {diagnosis.causes.map((c: string, idx: number) => (
                        <li key={idx} className="text-gray-700">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosis.treatment && diagnosis.treatment.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Treatment / उपचार
                    </h4>
                    <ul className="space-y-2 list-disc pl-5">
                      {diagnosis.treatment.map((t: string, idx: number) => (
                        <li key={idx} className="text-gray-700">{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosis.prevention && diagnosis.prevention.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Sprout className="w-4 h-4" />
                      Prevention / रोकथाम
                    </h4>
                    <ul className="space-y-2 list-disc pl-5">
                      {diagnosis.prevention.map((p: string, idx: number) => (
                        <li key={idx} className="text-gray-700">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Section */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Ask Questions <span className="text-gray-600">/ प्रश्न पूछें</span>
                </h3>
              </div>
              <div className="flex-1 h-80 overflow-y-auto space-y-4 pr-2 mb-4" id="chat-messages">
                {diagnosis.messages && diagnosis.messages.length > 0 ? (
                  diagnosis.messages.map((m: any) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`${
                          m.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900'
                        } 
                        px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed break-words shadow-sm
                        ${m.id.startsWith('temp') ? 'animate-pulse' : ''}`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <p>No messages yet. Ask a question to get started!</p>
                    <p className="text-xs mt-1">अभी तक कोई संदेश नहीं। शुरू करने के लिए एक प्रश्न पूछें!</p>
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
                className="flex gap-2"
              >
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about care, treatments, prevention... / देखभाल, उपचार के बारे में पूछें..."
                  disabled={isSending}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 
                    focus:ring-green-500 text-base text-gray-800 placeholder-gray-400 disabled:bg-gray-50 
                    disabled:text-gray-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className={`px-5 py-3 text-white rounded-xl transition-all focus:outline-none 
                    focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium
                    ${isSending || !chatInput.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
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
                    </span>
                  ) : (
                    'Send / भेजें'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
