import ComingSoon from '@/components/ComingSoon';
import { MessageCircle } from 'lucide-react';

export const metadata = { title: 'FAQ – KrishiAI' };

export default function FAQPage() {
  return (
    <ComingSoon
      title="Frequently Asked Questions"
      titleHi="अक्सर पूछे जाने वाले सवाल"
      titleMr="वारंवार विचारले जाणारे प्रश्न"
      description="We're compiling answers to the most common questions from farmers. Sign up to get notified when it's live."
      descriptionHi="हम किसानों के सबसे सामान्य सवालों के जवाब तैयार कर रहे हैं। लाइव होने पर सूचना पाने के लिए साइन अप करें।"
      descriptionMr="आम्ही शेतकऱ्यांच्या सर्वात सामान्य प्रश्नांची उत्तरे तयार करत आहोत. लाइव झाल्यावर सूचना मिळण्यासाठी साइन अप करा."
      icon={<MessageCircle className="w-10 h-10 text-green-600" />}
    />
  );
}
