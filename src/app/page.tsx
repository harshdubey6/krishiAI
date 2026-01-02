'use client';

import Image from "next/image";
import Link from "next/link";
import { Sprout, CloudSun, TrendingUp, BookOpen, Users, Smartphone } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-green-600" />,
      title: "फसल रोग निदान",
      titleEn: "Crop Disease Diagnosis",
      description: "Upload crop photo and get instant AI-powered disease identification with treatment"
    },
    {
      icon: <CloudSun className="w-8 h-8 text-blue-600" />,
      title: "मौसम अलर्ट",
      titleEn: "Weather Alerts",
      description: "Real-time weather updates, forecasts, and crop-specific advisory"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-orange-600" />,
      title: "मंडी भाव",
      titleEn: "Market Prices",
      description: "Live mandi rates, price trends, and profit calculators"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: "खेती गाइड",
      titleEn: "Farming Guides",
      description: "Expert knowledge, video tutorials, and best practices"
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      title: "सीधे बेचें",
      titleEn: "Sell Direct",
      description: "Connect directly with buyers, eliminate middlemen"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
      title: "मोबाइल फ्रेंडली",
      titleEn: "Mobile Friendly",
      description: "Works on any device, even with slow internet"
    }
  ];

  const problems = [
    { problem: "फसल की बीमारी की पहचान नहीं", solution: "AI से तुरंत जवाब मिलेगा" },
    { problem: "बिचौलिए ज्यादा कमाते हैं", solution: "सीधे खरीदार से जुड़ें" },
    { problem: "मौसम की सही जानकारी नहीं", solution: "15 दिन का पूर्वानुमान" },
    { problem: "सही भाव नहीं मिलता", solution: "लाइव मंडी रेट देखें" }
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
              <span className="text-xs text-gray-600 hidden sm:block">Empowering Farmers</span>
            </div>
          </div>
          <Link 
            href="/login" 
            className="rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors text-sm sm:text-base px-4 sm:px-6 py-2"
          >
            Login / साइन इन
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-green-600">किसान भाइयों</span> के लिए
                <br />
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  AI से खेती में क्रांति
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                फसल की बीमारी पहचानें • सीधे खरीदार से जुड़ें • मौसम की जानकारी • सही भाव पाएं
              </p>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Empowering Farmers with AI-Powered Agriculture Platform
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center rounded-full bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  अभी शुरू करें / Get Started
                </Link>
                <Link 
                  href="/dashboard/diagnose" 
                  className="inline-flex items-center justify-center rounded-full border-2 border-green-600 text-green-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold hover:bg-green-50 transition-all"
                >
                  फसल जांचें / Check Crop
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-8 justify-center lg:justify-start text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span>Works Offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  <span>Multi-Language</span>
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
                <div className="text-sm text-gray-600">Happy Farmers</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 hidden sm:block">
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        {/* Problems & Solutions */}
        <section className="bg-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
              हम किसानों की <span className="text-green-600">समस्याओं का समाधान</span> करते हैं
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
            हमारी <span className="text-green-600">सेवाएं</span>
          </h2>
          <p className="text-center text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Complete agricultural solution for modern farmers - All in one platform
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-300 hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm font-medium text-green-600 mb-2">{feature.titleEn}</p>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-green-600 to-green-700 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white mb-12 sm:mb-16">
              कैसे काम करता है? / How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, title: "फोटो खींचें", titleEn: "Take Photo", desc: "Upload crop image from your phone" },
                { step: 2, title: "AI जांच", titleEn: "AI Analysis", desc: "Get instant disease diagnosis" },
                { step: 3, title: "समाधान पाएं", titleEn: "Get Solution", desc: "Follow treatment recommendations" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl font-bold text-green-600">
                    {item.step}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-base sm:text-lg text-green-100 mb-1">{item.titleEn}</p>
                  <p className="text-sm sm:text-base text-green-50">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            आज ही शुरू करें और अपनी खेती को बनाएं आसान
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            Join thousands of farmers already using KrishiAI for better farming
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center rounded-full bg-green-600 text-white px-8 sm:px-12 py-4 text-lg sm:text-xl font-bold hover:bg-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
          >
            फ्री में साइन अप करें / Sign Up Free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-green-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">About KrishiAI</h4>
              <p className="text-sm text-gray-600">Empowering farmers with AI-powered agriculture solutions</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/dashboard/diagnose" className="hover:text-green-600">Crop Diagnosis</Link></li>
                <li><Link href="/dashboard/weather" className="hover:text-green-600">Weather Alerts</Link></li>
                <li><Link href="/dashboard/prices" className="hover:text-green-600">Market Prices</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help" className="hover:text-green-600">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-green-600">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-green-600">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-green-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-green-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <span>© {new Date().getFullYear()} KrishiAI - All rights reserved</span>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-green-600">Login</Link>
              <Link href="/register" className="hover:text-green-600">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
