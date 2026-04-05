// Curated seasonal farming tips — no API needed

export const getFarmingTips = (lang = 'en') => {
  const tips = {
    en: [
      {
        id: 1,
        icon: '💧',
        title: 'Water Smart',
        tip: 'Water crops early morning to reduce evaporation loss by up to 30%. Avoid evening watering to prevent fungal growth overnight.',
        category: 'Irrigation',
      },
      {
        id: 2,
        icon: '🌱',
        title: 'Soil Health First',
        tip: 'Test your soil pH every season. Most crops thrive between pH 6.0–7.0. Add lime to raise pH or sulfur to lower it.',
        category: 'Soil',
      },
      {
        id: 3,
        icon: '🐛',
        title: 'Natural Pest Control',
        tip: 'Introduce neem oil spray (5ml per litre of water) as a natural pesticide. Apply weekly for prevention, every 3 days during active infestation.',
        category: 'Pest Control',
      },
      {
        id: 4,
        icon: '🌾',
        title: 'Crop Rotation',
        tip: 'Rotate nitrogen-fixing crops like legumes with cereal crops every season. This naturally restores soil nutrients without extra fertilizer.',
        category: 'Agronomy',
      },
      {
        id: 5,
        icon: '☀️',
        title: 'Heat Stress Prevention',
        tip: 'During peak summer, use mulching to keep soil 5–8°C cooler. Dry grass, straw, or leaves work as effective mulch layers.',
        category: 'Climate',
      },
      {
        id: 6,
        icon: '🍃',
        title: 'Leaf Color Alert',
        tip: 'Yellowing lower leaves = nitrogen deficiency. Purple tints = phosphorus issue. Spotted brown edges = potassium shortage. Act fast!',
        category: 'Diagnostics',
      },
      {
        id: 7,
        icon: '🌧️',
        title: 'Post-Rain Action',
        tip: 'After heavy rain, check for waterlogging. Create drainage channels immediately. Waterlogged roots lose oxygen within 24–48 hours.',
        category: 'Weather',
      },
      {
        id: 8,
        icon: '🧪',
        title: 'Fertilizer Timing',
        tip: 'Apply fertilizers 2–3 days after rain when soil is moist but not waterlogged. Dry soil causes fertilizer burn; waterlogged soil causes runoff waste.',
        category: 'Nutrition',
      },
    ],
    hi: [
      {
        id: 1,
        icon: '💧',
        title: 'जल प्रबंधन',
        tip: 'वाष्पीकरण हानि को 30% तक कम करने के लिए सुबह जल्दी फसलों को पानी दें। रात में फंगल विकास को रोकने के लिए शाम को पानी देने से बचें।',
        category: 'सिंचाई',
      },
      {
        id: 2,
        icon: '🌱',
        title: 'मृदा स्वास्थ्य प्रथम',
        tip: 'हर मौसम में अपनी मिट्टी के पीएच(pH) का परीक्षण करें। अधिकांश फसलें pH 6.0-7.0 के बीच पनपती हैं। pH बढ़ाने के लिए चूना या कम करने के लिए सल्फर डालें।',
        category: 'मिट्टी',
      },
      {
        id: 3,
        icon: '🐛',
        title: 'प्राकृतिक कीट नियंत्रण',
        tip: 'प्राकृतिक कीटनाशक के रूप में नीम के तेल के स्प्रे (5 मि.ली. प्रति लीटर पानी) का उपयोग करें। रोकथाम के लिए हर सप्ताह प्रयोग करें, सक्रिय संक्रमण के दौरान हर 3 दिन में।',
        category: 'कीट नियंत्रण',
      },
      {
        id: 4,
        icon: '🌾',
        title: 'फसल चक्रण',
        tip: 'हर मौसम में अनाज की फसलों के साथ फलियां जैसी नाइट्रोजन-फिक्सिंग फसलों को घुमाएं। यह प्राकृतिक रूप से बिना अतिरिक्त उर्वरक के मिट्टी के पोषक तत्वों को बहाल करता है।',
        category: 'कृषि विज्ञान',
      },
      {
        id: 5,
        icon: '☀️',
        title: 'गर्मी के तनाव से बचाव',
        tip: 'तेज़ गर्मी के दौरान, मिट्टी को 5-8°C ठंडा रखने के लिए मल्चिंग का उपयोग करें। सूखी घास, पुआल, या पत्तियां प्रभावी मल्च परत के रूप में काम करती हैं।',
        category: 'जलवायु',
      },
      {
        id: 6,
        icon: '🍃',
        title: 'पत्ती का रंग चेतावनी',
        tip: 'निचले पत्तों का पीला होना = नाइट्रोजन की कमी। बैंगनी रंग = फास्फोरस की समस्या। धब्बेदार भूरे किनारे = पोटेशियम की कमी। तेजी से कार्य करें!',
        category: 'निदान',
      },
      {
        id: 7,
        icon: '🌧️',
        title: 'बारिश के बाद की कार्रवाई',
        tip: 'भारी बारिश के बाद, जलभराव की जांच करें। तुरंत जल निकासी चैनल बनाएं। जलभराव वाली जड़ें 24-48 घंटों के भीतर ऑक्सीजन खो देती हैं।',
        category: 'मौसम',
      },
      {
        id: 8,
        icon: '🧪',
        title: 'उर्वरक का समय',
        tip: 'बारिश के 2-3 दिन बाद उर्वरक डालें जब मिट्टी नम हो लेकिन जलभराव न हो। सूखी मिट्टी में उर्वरक जलने का कारण बनता है; जलभराव वाली मिट्टी में अपशिष्ट बहाव होता है।',
        category: 'पोषण',
      },
    ],
    ta: [
      {
        id: 1,
        icon: '💧',
        title: 'நீர் மேலாண்மை',
        tip: 'நீர் ஆவியாவதை 30% குறைக்க அதிகாலையில் பயிர்களுக்கு நீர் பாய்ச்சவும். இரவில் பூஞ்சை வளர்வதைத் தடுக்க மாலை நேர நீர் பாய்ச்சலைத் தவிர்க்கவும்.',
        category: 'நீர்ப்பாசனம்',
      },
      {
        id: 2,
        icon: '🌱',
        title: 'மண் வளம்',
        tip: 'ஒவ்வொரு பருவத்திலும் மண் pH அளவை சோதிக்கவும். பெரும்பாலான பயிர்கள் pH 6.0-7.0 இடையே நன்கு வளரும். pH அதிகரிக்க চুண்ணாம்பு அல்லது குறைக்க கந்தகம் சேர்க்கவும்.',
        category: 'மண்',
      },
      {
        id: 3,
        icon: '🐛',
        title: 'இயற்கை பூச்சி கட்டுப்பாடு',
        tip: 'வேப்ப எண்ணெய் கலவையை (ஒரு லிட்டர் தண்ணீருக்கு 5மிலி) இயற்கை பூச்சிக்கொல்லியாகப் பயன்படுத்தவும். தடுப்புக்காக வாரந்தோறும், பூச்சி தாக்குதலின் போது 3 நாட்களுக்கு ஒருமுறை பயன்படுத்தவும்.',
        category: 'பூச்சிக் கட்டுப்பாடு',
      },
      {
        id: 4,
        icon: '🌾',
        title: 'பயிர் சுழற்சி',
        tip: 'ஒவ்வொரு பருவத்திலும் தானியப் பயிர்களுடன் பருப்பு வகைகள் போன்ற நைட்ரஜனை நிலைநிறுத்தும் பயிர்களை சுழற்சி முறையில் பயிரிடவும். இது இயற்கையாகவே மண்ணின் ஊட்டச்சத்துக்களை மீட்டெடுக்கிறது.',
        category: 'வேளாண்மை',
      },
      {
        id: 5,
        icon: '☀️',
        title: 'வெப்ப அழுத்தத் தடுப்பு',
        tip: 'கோடைக் காலத்தில், மண்ணை 5–8°C குளிராக வைத்திருக்க மூடாக்கு (mulching) முறையைப் பயன்படுத்தவும். காய்ந்த புல் அல்லது இலைகளைப் பயன்படுத்தலாம்.',
        category: 'காலநிலை',
      },
      {
        id: 6,
        icon: '🍃',
        title: 'இலை நிற எச்சரிக்கை',
        tip: 'கீழ் இலைகள் மஞ்சளாவது = நைட்ரஜன் குறைபாடு. ஊதா நிறம் = பாஸ்பரஸ் குறைபாடு. பழுப்பு நிற விளிம்புகள் = பொட்டாசியம் பற்றாக்குறை. விரைந்து செயல்படுங்கள்!',
        category: 'நோய் கண்டறிதல்',
      },
      {
        id: 7,
        icon: '🌧️',
        title: 'மழைக்கு பின்',
        tip: 'கனமழைக்குப் பின், நீர் தேங்கியுள்ளதா எனச் சரிபார்க்கவும். உடனடியாக வடிகால் வசதி ஏற்படுத்தவும். நீர் தேங்கிய வேர்கள் 24-48 மணிநேரத்தில் ஆக்சிஜனை இழக்கும்.',
        category: 'வானிலை',
      },
      {
        id: 8,
        icon: '🧪',
        title: 'உரமிடும் நேரம்',
        tip: 'மழை பெய்து 2–3 நாட்களுக்குப் பிறகு, மண் ஈரமாக இருக்கும்போது உரம் இடவும். காய்ந்த மண்ணில் உரமிட்டால் பயிர் கரங்கும்; அதிக நீர் இருந்தால் வீணாகும்.',
        category: 'சத்துணவு',
      },
    ],
  }
  
  return tips[lang] || tips['en']
}

export const CROP_TYPES = [
  'Tomato',
  'Wheat',
  'Rice',
  'Maize',
  'Cotton',
  'Potato',
  'Sugarcane',
  'Soybean',
  'Groundnut',
  'Onion',
]

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Lakshadweep", "Puducherry"
]
