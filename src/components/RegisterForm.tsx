'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const validateForm = (firstName: string, lastName: string, email: string, password: string) => {
    const errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    };
    let isValid = true;

    // Reset validation errors
    setValidationErrors({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    });

    // First name validation
    if (!firstName) {
      errors.firstName = t('First name is required', 'पहला नाम आवश्यक है', 'पहिले नाव आवश्यक आहे');
      isValid = false;
    } else if (firstName.length < 2) {
      errors.firstName = t('First name must be at least 2 characters', 'पहला नाम कम से कम 2 अक्षरों का होना चाहिए', 'पहिले नाव किमान 2 अक्षरांचे असावे');
      isValid = false;
    }

    // Last name validation
    if (!lastName) {
      errors.lastName = t('Last name is required', 'अंतिम नाम आवश्यक है', 'आडनाव आवश्यक आहे');
      isValid = false;
    } else if (lastName.length < 2) {
      errors.lastName = t('Last name must be at least 2 characters', 'अंतिम नाम कम से कम 2 अक्षरों का होना चाहिए', 'आडनाव किमान 2 अक्षरांचे असावे');
      isValid = false;
    }

    // Email validation
    if (!email) {
      errors.email = t('Email is required', 'ईमेल आवश्यक है', 'ईमेल आवश्यक आहे');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('Please enter a valid email address', 'कृपया सही ईमेल पता दर्ज करें', 'कृपया वैध ईमेल पत्ता टाका');
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = t('Password is required', 'पासवर्ड आवश्यक है', 'पासवर्ड आवश्यक आहे');
      isValid = false;
    } else if (password.length < 6) {
      errors.password = t('Password must be at least 6 characters', 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए', 'पासवर्ड किमान 6 अक्षरांचा असावा');
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = t('Password must contain at least one uppercase letter, one lowercase letter, and one number', 'पासवर्ड में कम से कम एक बड़ा अक्षर, एक छोटा अक्षर और एक संख्या होनी चाहिए', 'पासवर्डमध्ये किमान एक मोठे अक्षर, एक छोटे अक्षर आणि एक संख्या असावी');
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = (formData.get('firstName') as string).trim();
    const lastName = (formData.get('lastName') as string).trim();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = `${firstName} ${lastName}`.trim();

    if (!validateForm(firstName, lastName, email, password)) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          name,
        }),
      });

      if (response.ok) {
        toast.success(t('Registration successful! Redirecting to login...', 'रजिस्ट्रेशन सफल! लॉगिन पर भेजा जा रहा है...', 'नोंदणी यशस्वी! लॉगिनकडे पाठवत आहोत...'));
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        const data = await response.json();
        toast.error(data.error || t('Registration failed', 'रजिस्ट्रेशन विफल', 'नोंदणी अयशस्वी'));
      }
    } catch {
      toast.error(t('An error occurred during registration', 'रजिस्ट्रेशन के दौरान त्रुटि हुई', 'नोंदणीदरम्यान त्रुटी आली'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 
        animate-[fadeIn_0.5s_ease-out] motion-safe:animate-[slideUp_0.5s_ease-out]
        hover:shadow-2xl transition-shadow duration-300"
        style={{
          animation: 'fadeIn 0.5s ease-out, slideUp 0.5s ease-out',
        }}>
        <div className="flex justify-end mb-4">
          <LanguageToggle compact />
        </div>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/plant-logo.jpg"
              alt="AI Plant Doctor"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-3xl font-semibold text-gray-800">{t('Create account', 'खाता बनाएं', 'खाते तयार करा')}</h2>
          <p className="text-gray-500 mt-2">{t('Join AI Plant Doctor today', 'आज ही AI Plant Doctor से जुड़ें', 'आजच AI Plant Doctor मध्ये सामील व्हा')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('First name', 'पहला नाम', 'पहिले नाव')}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className={`w-full px-4 py-3 border ${validationErrors.firstName ? 'border-red-300' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400`}
                placeholder={t('Enter first name', 'पहला नाम दर्ज करें', 'पहिले नाव टाका')}
              />
              {validationErrors.firstName && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('Last name', 'अंतिम नाम', 'आडनाव')}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className={`w-full px-4 py-3 border ${validationErrors.lastName ? 'border-red-300' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400`}
                placeholder={t('Enter last name', 'अंतिम नाम दर्ज करें', 'आडनाव टाका')}
              />
              {validationErrors.lastName && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('Email address', 'ईमेल पता', 'ईमेल पत्ता')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`w-full px-4 py-3 border ${validationErrors.email ? 'border-red-300' : 'border-gray-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400`}
              placeholder={t('Enter your email', 'अपना ईमेल दर्ज करें', 'तुमचा ईमेल टाका')}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('Password', 'पासवर्ड', 'पासवर्ड')}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className={`w-full px-4 py-3 pr-12 border ${validationErrors.password ? 'border-red-300' : 'border-gray-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400`}
                placeholder={t('Choose a strong password', 'मजबूत पासवर्ड चुनें', 'मजबूत पासवर्ड निवडा')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>



          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 font-medium hover:shadow-lg"
          >
            {isLoading ? t('Creating account...', 'खाता बनाया जा रहा है...', 'खाते तयार होत आहे...') : t('Create account', 'खाता बनाएं', 'खाते तयार करा')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t('Already have an account?', 'पहले से खाता है?', 'आधीच खाते आहे?')}{' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
              {t('Sign in', 'साइन इन', 'साइन इन')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
