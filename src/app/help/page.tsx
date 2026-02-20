import ComingSoon from '@/components/ComingSoon';
import { HelpCircle } from 'lucide-react';

export const metadata = { title: 'Help Center – KrishiAI' };

export default function HelpPage() {
  return (
    <ComingSoon
      title="Help Center"
      titleHi="हेल्प सेंटर"
      titleMr="मदत केंद्र"
      description="Our support team is building a comprehensive knowledge base for farmers. Sign up to get early access."
      descriptionHi="हमारी सहायता टीम किसानों के लिए एक व्यापक ज्ञान आधार बना रही है। जल्दी पहुंच पाने के लिए साइन अप करें।"
      descriptionMr="आमची सहाय्य टीम शेतकऱ्यांसाठी व्यापक माहिती तयार करत आहे। लवकर प्रवेश मिळण्यासाठी साइन अप करा."
      icon={<HelpCircle className="w-10 h-10 text-green-600" />}
    />
  );
}
