'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sprout, CloudSun, TrendingUp, BookOpen, Smartphone, Users } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/providers/LanguageProvider";
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');

  // Navigate to a protected page — if not logged in, open register modal instead
  const handleProtectedLink = (destination: string) => {
    if (session) {
      router.push(destination);
    } else {
      setCallbackUrl(destination);
      setAuthMode('register');
      setAuthOpen(true);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const authParam = params.get('auth');
    const requestedCallbackUrl = params.get('callbackUrl') || '/dashboard';
    setCallbackUrl(requestedCallbackUrl);

    if (authParam === 'login' || authParam === 'register') {
      setAuthMode(authParam);
      setAuthOpen(true);
      return;
    }

    if (params.get('callbackUrl')) {
      setAuthMode('login');
      setAuthOpen(true);
    }
  }, []);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);

    if (typeof window === 'undefined') {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams.get('auth') && !searchParams.get('callbackUrl')) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('auth');
    nextParams.delete('callbackUrl');
    const nextQuery = nextParams.toString();

    router.replace(nextQuery ? `/?${nextQuery}` : '/', { scroll: false });
  };

  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-green-600" />,
      title: t('Crop Disease Diagnosis', 'फसल रोग निदान', 'पीक रोग निदान'),
      description: t('Upload crop photo and get instant AI-powered disease identification with treatment', 'फसल की फोटो अपलोड करें और तुरंत AI आधारित रोग पहचान व उपचार पाएं', 'पीकाचा फोटो अपलोड करा आणि तत्काळ AI आधारित रोग ओळख व उपचार मिळवा')
    },
    {
      icon: <CloudSun className="w-8 h-8 text-blue-600" />,
      title: t('Weather Alerts', 'मौसम अलर्ट', 'हवामान अलर्ट'),
      description: t('Real-time weather updates, forecasts, and crop-specific advisory', 'रियल-टाइम मौसम अपडेट, पूर्वानुमान और फसल-विशिष्ट सलाह', 'रिअल-टाइम हवामान अपडेट, अंदाज आणि पीक-विशिष्ट सल्ला')
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: t('Market Prices', 'मंडी भाव', 'बाजारभाव'),
      description: t('Live mandi rates, price trends, and profit calculators', 'लाइव मंडी रेट, मूल्य रुझान और लाभ कैलकुलेटर', 'लाइव्ह मंडई दर, किंमत ट्रेंड आणि नफा कॅल्क्युलेटर')
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: t('Farming Guides', 'खेती गाइड', 'शेती मार्गदर्शक'),
      description: t('Expert knowledge, video tutorials, and best practices', 'विशेषज्ञ ज्ञान, वीडियो ट्यूटोरियल और सर्वोत्तम तरीके', 'तज्ज्ञ ज्ञान, व्हिडिओ ट्युटोरियल्स आणि सर्वोत्तम पद्धती')
    },
    {
      icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
      title: t('Mobile Friendly', 'मोबाइल फ्रेंडली', 'मोबाइल फ्रेंडली'),
      description: t('Works on any device, even with slow internet', 'किसी भी डिवाइस पर चलता है, धीमे इंटरनेट में भी', 'कोणत्याही डिव्हाइसवर चालते, कमी इंटरनेटवरही')
    },
    {
      icon: <Users className="w-8 h-8 text-teal-600" />,
      title: t('Farmer Community', 'किसान समुदाय', 'शेतकरी समुदाय'),
      description: t('Learn from fellow farmers and shared field experiences', 'अन्य किसानों के अनुभवों से सीखें और ज्ञान साझा करें', 'इतर शेतकऱ्यांच्या अनुभवांतून शिका आणि ज्ञान शेअर करा')
    }
  ];

  const problems = [
    { problem: t('Cannot identify crop disease on time', 'फसल की बीमारी की पहचान समय पर नहीं होती', 'पीकाचा रोग वेळेवर ओळखता येत नाही'), solution: t('Get instant answer from AI', 'AI से तुरंत जवाब मिलेगा', 'AI कडून त्वरित उत्तर मिळेल') },
    { problem: t('Lack of practical farming guidance', 'व्यावहारिक खेती मार्गदर्शन की कमी', 'व्यावहारिक शेती मार्गदर्शनाची कमतरता'), solution: t('Follow step-by-step farming guides', 'स्टेप-बाय-स्टेप खेती गाइड का पालन करें', 'स्टेप-बाय-स्टेप शेती मार्गदर्शकांचे पालन करा') },
    { problem: t('No reliable weather updates', 'मौसम की सही जानकारी नहीं मिलती', 'विश्वसनीय हवामान माहिती मिळत नाही'), solution: t('Get 15-day forecast', '15 दिन का पूर्वानुमान पाएं', '15 दिवसांचा अंदाज मिळवा') },
    { problem: t('Unable to get fair market rates', 'सही भाव नहीं मिलता', 'योग्य भाव मिळत नाही'), solution: t('Check live mandi rates', 'लाइव मंडी रेट देखें', 'लाइव्ह मंडई दर पहा') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-green-700 block">KrishiAI</span>
              <span className="text-xs text-gray-600 hidden sm:block">{t('Empowering Farmers', 'किसानों को सशक्त बनाना', 'शेतकऱ्यांना सक्षम बनवणे')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle compact />
            <button 
              type="button"
              onClick={() => openAuth('login')}
              className="rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors text-sm sm:text-base px-4 sm:px-6 py-2"
            >
              {t('Login', 'साइन इन', 'लॉगिन')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-green-600">{t('For Farmers', 'किसान भाइयों के लिए', 'शेतकऱ्यांसाठी')}</span>
                <br />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {t('AI Revolution in Farming', 'AI से खेती में क्रांति', 'AI सह शेतीत क्रांती')}
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                {t('Identify crop diseases • Use farmer guides • Get weather updates • Get fair prices', 'फसल की बीमारी पहचानें • किसान गाइड का उपयोग करें • मौसम की जानकारी • सही भाव पाएं', 'पीक रोग ओळखा • शेतकरी मार्गदर्शक वापरा • हवामान माहिती मिळवा • योग्य भाव मिळवा')}
              </p>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                {t('Empowering Farmers with AI-Powered Agriculture Platform', 'AI आधारित कृषि प्लेटफॉर्म से किसानों को सशक्त बनाना', 'AI आधारित कृषी प्लॅटफॉर्मद्वारे शेतकऱ्यांना सक्षम बनवणे')}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button 
                  type="button"
                  onClick={() => openAuth('register')}
                  className="inline-flex items-center justify-center rounded-full bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {t('Get Started', 'अभी शुरू करें', 'आता सुरू करा')}
                </button>
                <button
                  type="button"
                  onClick={() => handleProtectedLink('/dashboard/diagnose')}
                  className="inline-flex items-center justify-center rounded-full border-2 border-green-600 text-green-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-green-50 transition-all"
                >
                  {t('Check Crop', 'फसल जांचें', 'पीक तपासा')}
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-8 justify-center lg:justify-start text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span>{t('100% Free', '100% मुफ्त', '100% मोफत')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span>{t('Works Offline', 'ऑफलाइन भी काम करता है', 'ऑफलाइनही चालते')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span>{t('Multi-Language', 'बहुभाषी', 'बहुभाषिक')}</span>
                </div>
              </div>
            </div>

            <div className="relative order-first lg:order-last">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-green-200">
                <Image
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop"
                  alt="Indian Farmer with Smartphone"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-green-900/20 via-transparent to-blue-600/20" />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 hidden sm:block">
                <div className="text-2xl font-bold text-green-600">10K+</div>
                <div className="text-sm text-gray-600">{t('Happy Farmers', 'खुश किसान', 'आनंदी शेतकरी')}</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 hidden sm:block">
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-gray-600">{t('Accuracy', 'सटीकता', 'अचूकता')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Problems & Solutions */}
        <section className="bg-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
              {t('We solve farmers\' problems', 'हम किसानों की समस्याओं का समाधान करते हैं', 'आम्ही शेतकऱ्यांच्या समस्यांचे समाधान करतो')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {problems.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-red-50 to-green-50 border border-green-200">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">✕</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.problem}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                      <p className="text-green-700 font-medium">{item.solution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-4">
            {t('Our Services', 'हमारी सेवाएं', 'आमच्या सेवा')}
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
            {t('Complete agricultural solution for modern farmers - all in one platform', 'आधुनिक किसानों के लिए संपूर्ण कृषि समाधान - एक ही प्लेटफॉर्म पर', 'आधुनिक शेतकऱ्यांसाठी संपूर्ण कृषी समाधान - एकाच प्लॅटफॉर्मवर')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-300 hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-green-600 to-green-700 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white mb-12 sm:mb-16">
              {t('How It Works', 'कैसे काम करता है?', 'हे कसे काम करते?')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: t('Take Photo', 'फोटो खींचें', 'फोटो काढा'), desc: t('Upload crop image from your phone', 'अपने फोन से फसल की फोटो अपलोड करें', 'तुमच्या फोनवरून पिकाचा फोटो अपलोड करा') },
                { step: 2, title: t('AI Analysis', 'AI जांच', 'AI विश्लेषण'), desc: t('Get instant disease diagnosis', 'तुरंत रोग निदान पाएं', 'तत्काळ रोग निदान मिळवा') },
                { step: 3, title: t('Get Solution', 'समाधान पाएं', 'उपाय मिळवा'), desc: t('Follow treatment recommendations', 'उपचार सुझावों का पालन करें', 'उपचार शिफारसींचे पालन करा') }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl font-bold text-green-600">
                    {item.step}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base text-green-50">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('Start today and make farming easier', 'आज ही शुरू करें और अपनी खेती को बनाएं आसान', 'आजच सुरू करा आणि शेती सोपी करा')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            {t('Join thousands of farmers already using KrishiAI for better farming', 'बेहतर खेती के लिए KrishiAI का उपयोग कर रहे हजारों किसानों से जुड़ें', 'चांगल्या शेतीसाठी KrishiAI वापरणाऱ्या हजारो शेतकऱ्यांमध्ये सामील व्हा')}
          </p>
          <button 
            type="button"
            onClick={() => openAuth('register')}
            className="inline-flex items-center justify-center rounded-full bg-green-600 text-white px-8 sm:px-12 py-4 text-lg sm:text-xl font-bold hover:bg-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
          >
            {t('Sign Up Free', 'फ्री में साइन अप करें', 'मोफत साइन अप करा')}
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-green-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">{t('About KrishiAI', 'KrishiAI के बारे में', 'KrishiAI बद्दल')}</h4>
              <p className="text-sm text-gray-600">{t('Empowering farmers with AI-powered agriculture solutions', 'AI आधारित कृषि समाधानों से किसानों को सशक्त बनाना', 'AI आधारित कृषी उपायांनी शेतकऱ्यांना सक्षम करणे')}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">{t('Services', 'सेवाएं', 'सेवा')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button type="button" onClick={() => handleProtectedLink('/dashboard/diagnose')} className="hover:text-green-600 text-left">{t('Crop Diagnosis', 'फसल निदान', 'पीक निदान')}</button></li>
                <li><button type="button" onClick={() => handleProtectedLink('/dashboard/weather')} className="hover:text-green-600 text-left">{t('Weather Alerts', 'मौसम अलर्ट', 'हवामान अलर्ट')}</button></li>
                <li><button type="button" onClick={() => handleProtectedLink('/dashboard/prices')} className="hover:text-green-600 text-left">{t('Market Prices', 'मंडी भाव', 'बाजारभाव')}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">{t('Support', 'सहायता', 'मदत')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-green-600">{t('Help Center', 'हेल्प सेंटर', 'मदत केंद्र')}</Link></li>
                <li><Link href="/contact" className="hover:text-green-600">{t('Contact Us', 'संपर्क करें', 'संपर्क करा')}</Link></li>
                <li><Link href="/faq" className="hover:text-green-600">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">{t('Legal', 'कानूनी', 'कायदेशीर')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-green-600">{t('Privacy Policy', 'प्राइवेसी पॉलिसी', 'गोपनीयता धोरण')}</Link></li>
                <li><Link href="/terms" className="hover:text-green-600">{t('Terms of Service', 'सेवा की शर्तें', 'सेवेच्या अटी')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <span>{t(`© ${new Date().getFullYear()} KrishiAI - All rights reserved`, `© ${new Date().getFullYear()} KrishiAI - सर्वाधिकार सुरक्षित`, `© ${new Date().getFullYear()} KrishiAI - सर्व हक्क राखीव`)}</span>
            <div className="flex items-center gap-6">
              <button type="button" onClick={() => openAuth('login')} className="hover:text-green-600">{t('Login', 'लॉगिन', 'लॉगिन')}</button>
              <button type="button" onClick={() => openAuth('register')} className="hover:text-green-600">{t('Register', 'रजिस्टर', 'नोंदणी')}</button>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} mode={authMode} onClose={closeAuth} callbackUrl={callbackUrl} />
    </div>
  );
}
