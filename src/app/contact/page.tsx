import ComingSoon from '@/components/ComingSoon';
import { Mail } from 'lucide-react';

export const metadata = { title: 'Contact Us – KrishiAI' };

export default function ContactPage() {
  return (
    <ComingSoon
      title="Contact Us"
      titleHi="संपर्क करें"
      titleMr="संपर्क करा"
      description="We're setting up our support channels. Sign up and we'll reach out when you can contact our team directly."
      descriptionHi="हम अपने सहायता चैनल स्थापित कर रहे हैं। साइन अप करें और जब आप हमारी टीम से सीधे संपर्क कर सकते हैं तो हम संपर्क करेंगे।"
      descriptionMr="आम्ही आमचे सहाय्य चॅनेल तयार करत आहोत. साइन अप करा आणि आमची टीम तुमच्याशी थेट संपर्क करेल."
      icon={<Mail className="w-10 h-10 text-green-600" />}
    />
  );
}
