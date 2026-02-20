'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { AppLanguage } from '@/components/providers/LanguageProvider';

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

const options: Array<{ code: AppLanguage; label: string }> = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिं' },
  { code: 'mr', label: 'मर' },
];

export default function LanguageToggle({ className = '', compact = false }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm ${compact ? 'p-1 gap-1' : 'p-1.5 gap-1.5'} ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <span className={`${compact ? 'px-1.5' : 'px-2'} text-gray-500`}>
        <Languages className={compact ? 'w-4 h-4' : 'w-[18px] h-[18px]'} />
      </span>
      {options.map((option) => {
        const active = language === option.code;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLanguage(option.code)}
            className={`${compact ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'} rounded-lg font-semibold transition-all ${
              active
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            aria-pressed={active}
            aria-label={`Switch to ${option.code}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
