import ComingSoon from '@/components/ComingSoon';
import { Shield } from 'lucide-react';

export const metadata = { title: 'Privacy Policy – KrishiAI' };

export default function PrivacyPage() {
  return (
    <ComingSoon
      title="Privacy Policy"
      titleHi="प्राइवेसी पॉलिसी"
      titleMr="गोपनीयता धोरण"
      description="We take your data privacy seriously. Our full privacy policy is being drafted and will be published soon."
      descriptionHi="हम आपकी डेटा गोपनीयता को गंभीरता से लेते हैं। हमारी पूरी गोपनीयता नीति तैयार की जा रही है और जल्द ही प्रकाशित होगी।"
      descriptionMr="आम्ही तुमच्या डेटा गोपनीयतेला गंभीरतेने घेतो. आमचे संपूर्ण गोपनीयता धोरण तयार केले जात आहे आणि लवकरच प्रकाशित केले जाईल."
      icon={<Shield className="w-10 h-10 text-green-600" />}
    />
  );
}
