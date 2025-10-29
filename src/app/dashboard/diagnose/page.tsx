'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DiagnosePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to access the plant diagnosis feature');
      router.replace('/login');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Don't show content if not authenticated
  if (!session) {
    return null;
  }
  const [image, setImage] = useState<string | null>(null);
  const [plantType, setPlantType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState<any | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (diagnosis?.messages?.length) {
      const chatDiv = document.getElementById('chat-messages');
      if (chatDiv) {
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }
  }, [diagnosis?.messages]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload a valid image file (PNG, JPG)');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleDiagnose = async () => {
    if (!image) {
      toast.error('Please upload a plant image');
      return;
    }
    if (!plantType.trim()) {
      toast.error('Please enter the plant type');
      return;
    }
    if (!symptoms.trim()) {
      toast.error('Please describe the symptoms');
      return;
    }

    toast.loading('Analyzing plant...', { id: 'analyze' });
    setIsSending(true);
    
    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          plantType: plantType.trim(),
          symptoms: symptoms.trim(),
        }),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // server returned non-JSON (HTML error page or plain text) — surface it clearly
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to analyze plant');
      }

      toast.success('Analysis complete!', { id: 'analyze' });
      // API returns { status, data: { id, diagnosis, causes, treatment, prevention, messages } }
      setDiagnosis(data.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to analyze plant',
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

      // Append user and assistant messages returned from API
      const userMsg = data?.data?.userMessage;
      const assistantMsg = data?.data?.assistantMessage;

      setDiagnosis((prev: any) => (
        prev ? { ...prev, messages: [
          ...prev.messages,
          userMsg ? { id: userMsg.id, role: userMsg.role, content: userMsg.content, createdAt: userMsg.createdAt } : { id: `temp-u-${Date.now()}`, role: 'user', content: chatInput, createdAt: new Date().toISOString() },
          assistantMsg ? { id: assistantMsg.id, role: assistantMsg.role, content: assistantMsg.content, createdAt: assistantMsg.createdAt } : { id: `temp-a-${Date.now()}`, role: 'assistant', content: data?.data?.reply ?? 'No reply', createdAt: new Date().toISOString() },
        ] } : prev
      ));
      setChatInput('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-800 mb-2">Plant Diagnosis</h1>
      <p className="text-gray-600 text-base leading-relaxed mb-8">
        Upload a clear photo and describe symptoms. Get a clean, readable diagnosis with actionable steps.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Plant Image Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Plant Image</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload a clear photo of your plant showing the problem area
          </p>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors shadow-sm bg-white
              ${isDragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-green-400'
              } ${image ? 'border-green-500' : ''}`}
          >
            <input {...getInputProps()} />
            {image ? (
              <div className="relative aspect-video">
                <Image
                  src={image}
                  alt="Uploaded plant"
                  fill
                  className="object-contain rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow 
                    hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-red-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 
                    rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-green-500"
                >
                  Select Image
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Plant Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Plant Information</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Provide details about your plant and observed symptoms
          </p>

          <div className="space-y-6">
            <div>
              <label htmlFor="plantType" className="block text-sm font-medium text-gray-700">
                Plant Type
              </label>
              <input
                type="text"
                id="plantType"
                value={plantType}
                onChange={(e) => setPlantType(e.target.value)}
                placeholder="e.g., Tomato, Rose, Corn..."
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                  focus:border-transparent transition-colors text-base text-gray-800"
              />
            </div>

            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
                Symptoms Description
              </label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe what you've observed: leaf discoloration, spots, wilting, growth issues, etc."
                rows={4}
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 
                  focus:border-transparent transition-colors resize-none text-base text-gray-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diagnose Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleDiagnose}
          disabled={isSending}
          className={`px-8 py-3 bg-green-600 text-white rounded-lg 
            transition-colors focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-green-500 font-medium
            ${isSending 
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-green-700'
            }`}
        >
          {isSending ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Diagnose Plant'
          )}
        </button>
      </div>

      {/* Diagnosis Result & Chat */}
      {diagnosis && (
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Diagnosis Result</h3>
            <div className="mt-4 space-y-3 text-base text-gray-800 leading-relaxed">
              <p className="whitespace-pre-wrap"><span className="font-medium">Diagnosis:</span> {diagnosis.diagnosis}</p>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Causes</h4>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {diagnosis.causes?.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                </ul>
              </div>
              <div className="mt-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Treatment</h4>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {diagnosis.treatment?.map((t: string, idx: number) => <li key={idx}>{t}</li>)}
                </ul>
              </div>
              <div className="mt-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Prevention</h4>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {diagnosis.prevention?.map((p: string, idx: number) => <li key={idx}>{p}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Ask Follow-up Questions</h3>
            <div className="mt-4 h-72 overflow-y-auto space-y-4 pr-2" id="chat-messages">
              {diagnosis.messages?.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900'} 
                    px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed break-words
                    ${m.id.startsWith('temp') ? 'animate-pulse' : ''}`}> 
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!isSending && chatInput.trim()) {
                  sendChat();
                }
              }}
              className="mt-4 flex gap-2"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about care, treatments, prevention..."
                disabled={isSending}
                className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 
                  focus:ring-green-500 text-base text-gray-800 disabled:bg-gray-50 
                  disabled:text-gray-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isSending || !chatInput.trim()}
                className={`px-5 py-3 text-white rounded-xl transition-all focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                  ${isSending 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {isSending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
