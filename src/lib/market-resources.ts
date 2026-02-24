interface LocalizedText {
  en: string;
  hi: string;
  mr: string;
}

export interface MarketResource {
  name: string;
  url: string;
  famousFor: LocalizedText;
  category: LocalizedText;
}

export const MARKET_RESOURCES: MarketResource[] = [
  {
    name: 'National Agriculture Infra Financing Facility',
    url: 'https://share.google/a2lXWEzCMyHn3dYIq',
    famousFor: {
      en: 'Agriculture infrastructure financing support and scheme guidance for farmers and agri entrepreneurs.',
      hi: 'किसानों और कृषि उद्यमियों के लिए कृषि बुनियादी ढांचे की फाइनेंसिंग सहायता और योजना मार्गदर्शन।',
      mr: 'शेतकरी आणि कृषी उद्योजकांसाठी कृषी पायाभूत सुविधा वित्तीय मदत आणि योजना मार्गदर्शन.',
    },
    category: {
      en: 'Government Scheme',
      hi: 'सरकारी योजना',
      mr: 'शासकीय योजना',
    },
  },
  {
    name: 'Mahabhulekh v2.0',
    url: 'https://share.google/081FEPrFotvl4dJsK',
    famousFor: {
      en: 'Online land records and 7/12 document access for Maharashtra farmers.',
      hi: 'महाराष्ट्र किसानों के लिए ऑनलाइन भूमि रिकॉर्ड और 7/12 दस्तावेज़ की सुविधा।',
      mr: 'महाराष्ट्रातील शेतकऱ्यांसाठी ऑनलाइन जमीन नोंदी आणि 7/12 कागदपत्रांची सुविधा.',
    },
    category: {
      en: 'Land Records',
      hi: 'भूमि रिकॉर्ड',
      mr: 'जमीन नोंदी',
    },
  },
  {
    name: 'Kisan Credit Card (KCC) - JanSamarth',
    url: 'https://share.google/OXnJeQHSiL0uPdPHU',
    famousFor: {
      en: 'Applying online for Kisan Credit Card and farm credit support through official channels.',
      hi: 'आधिकारिक चैनलों के माध्यम से किसान क्रेडिट कार्ड और कृषि ऋण सहायता के लिए ऑनलाइन आवेदन।',
      mr: 'अधिकृत माध्यमांद्वारे किसान क्रेडिट कार्ड आणि शेती कर्ज सहाय्यासाठी ऑनलाइन अर्ज.',
    },
    category: {
      en: 'Farm Credit',
      hi: 'कृषि ऋण',
      mr: 'शेती कर्ज',
    },
  },
  {
    name: 'PM-KUSUM',
    url: 'https://pmkusum.mnre.gov.in/#/landing',
    famousFor: {
      en: 'Solar pump and renewable energy support for farmers under PM-KUSUM.',
      hi: 'PM-KUSUM के तहत किसानों के लिए सोलर पंप और नवीकरणीय ऊर्जा सहायता।',
      mr: 'PM-KUSUM अंतर्गत शेतकऱ्यांसाठी सोलर पंप आणि नवीकरणीय ऊर्जा समर्थन.',
    },
    category: {
      en: 'Renewable Energy',
      hi: 'नवीकरणीय ऊर्जा',
      mr: 'नवीकरणीय ऊर्जा',
    },
  },
  {
    name: 'KisanKonnect',
    url: 'https://share.google/eQzFSOVKtUcZkqWvL',
    famousFor: {
      en: 'Farm-fresh fruits and vegetables marketplace connecting growers and buyers.',
      hi: 'किसानों और खरीदारों को जोड़ने वाला ताज़े फल और सब्जियों का मार्केटप्लेस।',
      mr: 'शेतकरी आणि खरेदीदारांना जोडणारे ताज्या फळे-भाज्यांचे मार्केटप्लेस.',
    },
    category: {
      en: 'Marketplace',
      hi: 'मार्केटप्लेस',
      mr: 'मार्केटप्लेस',
    },
  },
  {
    name: 'PMFBY - Crop Insurance',
    url: 'https://share.google/0KG3dWTQphLj5yQTd',
    famousFor: {
      en: 'Pradhan Mantri Fasal Bima Yojana crop insurance information and enrollment support.',
      hi: 'प्रधानमंत्री फसल बीमा योजना से संबंधित जानकारी और पंजीकरण सहायता।',
      mr: 'प्रधानमंत्री पिक विमा योजनेची माहिती आणि नोंदणी सहाय्य.',
    },
    category: {
      en: 'Crop Insurance',
      hi: 'फसल बीमा',
      mr: 'पीक विमा',
    },
  },
  {
    name: 'KissanMitrr Agri Consulting',
    url: 'https://share.google/a2UsobwNMDflmyN2q',
    famousFor: {
      en: 'Farm consulting services for crop planning, productivity, and advisory.',
      hi: 'फसल योजना, उत्पादकता और परामर्श के लिए कृषि कंसल्टिंग सेवाएं।',
      mr: 'पीक नियोजन, उत्पादकता आणि सल्ल्यासाठी कृषी कन्सल्टिंग सेवा.',
    },
    category: {
      en: 'Agri Consulting',
      hi: 'कृषि परामर्श',
      mr: 'कृषी सल्ला',
    },
  },
];
