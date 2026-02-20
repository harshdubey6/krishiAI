'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, X } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  callbackUrl?: string;
}

export default function AuthModal({ open, mode, onClose, callbackUrl }: AuthModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeMode, setActiveMode] = useState<AuthMode>(mode);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (open) {
      setActiveMode(mode);
      setShowPassword(false);
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  const title = useMemo(
    () =>
      activeMode === 'login'
        ? t('Sign in', 'साइन इन', 'साइन इन')
        : t('Create account', 'खाता बनाएं', 'खाते तयार करा'),
    [activeMode, t]
  );

  const subtitle = useMemo(
    () =>
      activeMode === 'login'
        ? t('Access your dashboard', 'अपने डैशबोर्ड तक पहुंचें', 'तुमच्या डॅशबोर्डमध्ये जा')
        : t('Join KrishiAI today', 'आज ही KrishiAI से जुड़ें', 'आजच KrishiAI मध्ये सामील व्हा'),
    [activeMode, t]
  );

  if (!open) {
    return null;
  }

  const handleInput = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    const destination = callbackUrl || '/dashboard';

    if (!form.email || !form.password) {
      toast.error(t('Email and password are required', 'ईमेल और पासवर्ड आवश्यक हैं', 'ईमेल आणि पासवर्ड आवश्यक आहेत'));
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: destination,
      });

      if (result?.error) {
        toast.error(t('Invalid email or password', 'गलत ईमेल या पासवर्ड', 'चुकीचा ईमेल किंवा पासवर्ड'));
        return;
      }

      toast.success(t('Login successful', 'लॉगिन सफल', 'लॉगिन यशस्वी'));
      onClose();
      router.push(destination);
    } catch {
      toast.error(t('Login failed', 'लॉगिन विफल', 'लॉगिन अयशस्वी'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!firstName || !lastName || !email || !password) {
      toast.error(t('Please fill all fields', 'कृपया सभी फ़ील्ड भरें', 'कृपया सर्व फील्ड भरा'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t('Registration failed', 'रजिस्ट्रेशन विफल', 'नोंदणी अयशस्वी'));
        return;
      }

      toast.success(t('Account created. Please sign in.', 'खाता बन गया। कृपया साइन इन करें।', 'खाते तयार झाले. कृपया साइन इन करा.'));
      setActiveMode('login');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch {
      toast.error(t('Registration failed', 'रजिस्ट्रेशन विफल', 'नोंदणी अयशस्वी'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (activeMode === 'login') {
      await handleLogin();
      return;
    }

    await handleRegister();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 pt-7">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{title}</h3>
            <p className="text-base text-gray-500 mt-2">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-7 pt-5">
          <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveMode('login')}
              className={`rounded-lg py-2.5 text-base font-semibold transition ${
                activeMode === 'login' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'
              }`}
            >
              {t('Login', 'लॉगिन', 'लॉगिन')}
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('register')}
              className={`rounded-lg py-2.5 text-base font-semibold transition ${
                activeMode === 'register' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600'
              }`}
            >
              {t('Register', 'रजिस्टर', 'नोंदणी')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-7 space-y-5">
          {activeMode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => handleInput('firstName', event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('First name', 'पहला नाम', 'पहिले नाव')}
                required
              />
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => handleInput('lastName', event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={t('Last name', 'अंतिम नाम', 'आडनाव')}
                required
              />
            </div>
          )}

          <input
            type="email"
            value={form.email}
            onChange={(event) => handleInput('email', event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={t('Email address', 'ईमेल पता', 'ईमेल पत्ता')}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => handleInput('password', event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={t('Password', 'पासवर्ड', 'पासवर्ड')}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-green-600 py-3.5 text-lg font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {isLoading
              ? t('Please wait...', 'कृपया प्रतीक्षा करें...', 'कृपया प्रतीक्षा करा...')
              : activeMode === 'login'
                ? t('Sign in', 'साइन इन', 'साइन इन')
                : t('Create account', 'खाता बनाएं', 'खाते तयार करा')}
          </button>
        </form>
      </div>
    </div>
  );
}
