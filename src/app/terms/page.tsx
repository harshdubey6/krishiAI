import ComingSoon from '@/components/ComingSoon';
import { FileText } from 'lucide-react';

export const metadata = { title: 'Terms of Service – KrishiAI' };

export default function TermsPage() {
  return (
    <ComingSoon
      title="Terms of Service"
      titleHi="सेवा की शर्तें"
      titleMr="सेवेच्या अटी"
      description="Our legal team is finalizing the terms of service. They will be published before our official launch."
      descriptionHi="हमारी कानूनी टीम सेवा की शर्तों को अंतिम रूप दे रही है। ये हमारे आधिकारिक लॉन्च से पहले प्रकाशित की जाएंगी।"
      descriptionMr="आमची कायदेशीर टीम सेवेच्या अटी अंतिम करत आहे. त्या आमच्या अधिकृत लॉन्चपूर्वी प्रकाशित केल्या जातील."
      icon={<FileText className="w-10 h-10 text-green-600" />}
    />
  );
}
