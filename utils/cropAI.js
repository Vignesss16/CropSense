// /**
//  * CropSense AI Utility
//  * Analyzes crop leaf images using OpenAI GPT-4o Vision
//  * Falls back to rule-based mock data if API fails
//  */

// // ─── Fallback mock responses (rule-based, no API needed) ────────────────────
// const MOCK_RESPONSES = {
//   Tomato: {
//     disease: 'Early Blight (Alternaria solani)',
//     severity: 'medium',
//     cause: 'Fungal infection caused by warm, humid conditions and poor air circulation around plants.',
//     remedy: [
//       'Remove and destroy infected leaves immediately, then apply copper-based fungicide every 7–10 days.',
//       'Improve spacing between plants to increase airflow and avoid overhead watering.',
//     ],
//     farmer_note:
//       'Your tomato plant has a fungus attacking its leaves. Remove the bad leaves, spray a cheap fungicide from the farm shop, and make sure plants are not too close together so air can move between them.',
//   },
//   Wheat: {
//     disease: 'Wheat Rust (Puccinia striiformis)',
//     severity: 'high',
//     cause: 'Fungal spores spread by wind, thriving in cool, moist weather conditions.',
//     remedy: [
//       'Apply triazole-based fungicide (e.g., tebuconazole) immediately at first sign of infection.',
//       'Use rust-resistant wheat varieties in next season and monitor fields weekly.',
//     ],
//     farmer_note:
//       'Your wheat has a serious rust disease spreading by wind. Spray it with fungicide from your local agri-store right away. Act fast — this spreads quickly to other plants.',
//   },
//   Rice: {
//     disease: 'Rice Blast (Magnaporthe oryzae)',
//     severity: 'high',
//     cause: 'Fungal pathogen favored by high humidity, excess nitrogen fertilizer, and night temperatures between 20–25°C.',
//     remedy: [
//       'Apply blast-specific fungicide like tricyclazole or isoprothiolane at heading stage.',
//       'Reduce nitrogen application, drain fields periodically, and plant resistant varieties.',
//     ],
//     farmer_note:
//       'Your rice has blast disease, a common problem in wet weather. Spray the recommended fungicide, and next time use less nitrogen fertilizer. Ask your nearest agriculture officer for the right medicine.',
//   },
//   Maize: {
//     disease: 'Gray Leaf Spot (Cercospora zeae-maydis)',
//     severity: 'medium',
//     cause: 'Fungal disease thriving in humid conditions with minimum tillage and continuous maize planting.',
//     remedy: [
//       'Apply foliar fungicide containing azoxystrobin or propiconazole during early infection stage.',
//       'Rotate crops with non-host plants like legumes and use certified disease-resistant hybrid seeds.',
//     ],
//     farmer_note:
//       'Your maize has gray leaf spot — a fungus from wet conditions. Spray it with fungicide and next season, plant something different in that field, then come back to maize. This helps stop the fungus from growing.',
//   },
//   Cotton: {
//     disease: 'Cotton Boll Rot (Botrytis cinerea)',
//     severity: 'low',
//     cause: 'Gray mold caused by high humidity, poor drainage, and dense canopy blocking sunlight.',
//     remedy: [
//       'Remove affected bolls and improve field drainage to reduce moisture buildup.',
//       'Apply botryticide spray and prune lower branches to allow sunlight penetration.',
//     ],
//     farmer_note:
//       'Your cotton bolls have a mild mold from too much wetness. Remove the rotten bolls, make sure water drains away from the field, and trim some lower branches so sunlight can reach the plants.',
//   },
// }

// const FALLBACK = {
//   disease: 'Unidentified Leaf Condition',
//   severity: 'low',
//   cause: 'Unable to identify specific disease from the image. May be environmental stress or early-stage infection.',
//   remedy: [
//     'Consult your local agricultural extension officer with a physical sample for accurate diagnosis.',
//     'Ensure proper watering, avoid waterlogging, and monitor the plant for changes over the next 5–7 days.',
//   ],
//   farmer_note:
//     'We could not clearly identify the problem from the photo. Please take the plant to your nearest farm advisory centre. In the meantime, make sure the plant has enough water but not too much.',
// }

// // ─── Main AI Analysis Function ───────────────────────────────────────────────
// export async function analyzeCropImage(base64Image, cropType) {
//   const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

//   // If no API key, use rule-based fallback immediately
//   if (!apiKey) {
//     console.warn('No OpenAI API key found — using rule-based fallback.')
//     return getMockResponse(cropType)
//   }

//   try {
//     const prompt = `You are an expert agricultural scientist. 
// The farmer is growing: ${cropType}.
// Analyze this crop leaf image and return ONLY valid JSON with no extra text or markdown:
// {
//   "disease": "string (full disease name with scientific name)",
//   "severity": "low | medium | high",
//   "cause": "string (1 sentence explanation)",
//   "remedy": ["step 1 (specific and actionable)", "step 2 (specific and actionable)"],
//   "farmer_note": "string (2 sentences max explaining the remedy in simple, non-technical language a rural farmer with no science background can understand)"
// }`

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${apiKey}`,
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o',
//         max_tokens: 600,
//         messages: [
//           {
//             role: 'user',
//             content: [
//               {
//                 type: 'image_url',
//                 image_url: {
//                   url: `data:image/jpeg;base64,${base64Image}`,
//                   detail: 'low',
//                 },
//               },
//               {
//                 type: 'text',
//                 text: prompt,
//               },
//             ],
//           },
//         ],
//       }),
//     })

//     if (!response.ok) {
//       const err = await response.json()
//       console.error('OpenAI API error:', err)
//       return getMockResponse(cropType)
//     }

//     const data = await response.json()
//     const content = data.choices?.[0]?.message?.content?.trim()

//     if (!content) return getMockResponse(cropType)

//     // Strip markdown code blocks if present
//     const cleaned = content.replace(/```json|```/g, '').trim()
//     const parsed = JSON.parse(cleaned)

//     // Validate required fields
//     if (!parsed.disease || !parsed.severity || !parsed.remedy) {
//       return getMockResponse(cropType)
//     }

//     return parsed
//   } catch (err) {
//     console.error('analyzeCropImage failed:', err)
//     return getMockResponse(cropType)
//   }
// }

// // ─── Helper: Get mock response by crop type ──────────────────────────────────
// function getMockResponse(cropType) {
//   return MOCK_RESPONSES[cropType] || FALLBACK
// }

// // ─── Helper: Convert File to base64 ─────────────────────────────────────────
// export function fileToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onload = () => {
//       // Strip the data URL prefix: "data:image/jpeg;base64,"
//       const base64 = reader.result.split(',')[1]
//       resolve(base64)
//     }
//     reader.onerror = () => reject(new Error('Failed to read file'))
//     reader.readAsDataURL(file)
//   })
// }

// // ─── Helper: Severity config ─────────────────────────────────────────────────
// export function getSeverityConfig(severity) {
//   const configs = {
//     low: {
//       label: 'Low Risk',
//       emoji: '🟢',
//       color: 'text-green-400',
//       bg: 'bg-green-900/40',
//       border: 'border-green-500/50',
//       dot: 'bg-green-400',
//     },
//     medium: {
//       label: 'Medium Risk',
//       emoji: '🟡',
//       color: 'text-amber-400',
//       bg: 'bg-amber-900/40',
//       border: 'border-amber-500/50',
//       dot: 'bg-amber-400',
//     },
//     high: {
//       label: 'High Risk',
//       emoji: '🔴',
//       color: 'text-red-400',
//       bg: 'bg-red-900/40',
//       border: 'border-red-500/50',
//       dot: 'bg-red-400',
//     },
//   }
//   return configs[severity?.toLowerCase()] || configs.low
// }






//-----------------------------------------------------------------------------//


// /**
//  * CropSense AI Utility
//  * Analyzes crop leaf images using OpenAI GPT-4o Vision
//  * Falls back to rule-based mock data if API fails
//  */

// // ─── Fallback mock responses (rule-based, no API needed) ────────────────────
// const MOCK_RESPONSES = {
//   Tomato: {
//     disease: 'Early Blight (Alternaria solani)',
//     severity: 'medium',
//     cause: 'Fungal infection caused by warm, humid conditions and poor air circulation around plants.',
//     remedy: [
//       'Remove and destroy infected leaves immediately, then apply copper-based fungicide every 7–10 days.',
//       'Improve spacing between plants to increase airflow and avoid overhead watering.',
//     ],
//     farmer_note:
//       'Your tomato plant has a fungus attacking its leaves. Remove the bad leaves, spray a cheap fungicide from the farm shop, and make sure plants are not too close together so air can move between them.',
//   },
//   Wheat: {
//     disease: 'Wheat Rust (Puccinia striiformis)',
//     severity: 'high',
//     cause: 'Fungal spores spread by wind, thriving in cool, moist weather conditions.',
//     remedy: [
//       'Apply triazole-based fungicide (e.g., tebuconazole) immediately at first sign of infection.',
//       'Use rust-resistant wheat varieties in next season and monitor fields weekly.',
//     ],
//     farmer_note:
//       'Your wheat has a serious rust disease spreading by wind. Spray it with fungicide from your local agri-store right away. Act fast — this spreads quickly to other plants.',
//   },
//   Rice: {
//     disease: 'Rice Blast (Magnaporthe oryzae)',
//     severity: 'high',
//     cause: 'Fungal pathogen favored by high humidity, excess nitrogen fertilizer, and night temperatures between 20-25 degrees C.',
//     remedy: [
//       'Apply blast-specific fungicide like tricyclazole or isoprothiolane at heading stage.',
//       'Reduce nitrogen application, drain fields periodically, and plant resistant varieties.',
//     ],
//     farmer_note:
//       'Your rice has blast disease, a common problem in wet weather. Spray the recommended fungicide, and next time use less nitrogen fertilizer. Ask your nearest agriculture officer for the right medicine.',
//   },
//   Maize: {
//     disease: 'Gray Leaf Spot (Cercospora zeae-maydis)',
//     severity: 'medium',
//     cause: 'Fungal disease thriving in humid conditions with minimum tillage and continuous maize planting.',
//     remedy: [
//       'Apply foliar fungicide containing azoxystrobin or propiconazole during early infection stage.',
//       'Rotate crops with non-host plants like legumes and use certified disease-resistant hybrid seeds.',
//     ],
//     farmer_note:
//       'Your maize has gray leaf spot — a fungus from wet conditions. Spray it with fungicide and next season, plant something different in that field, then come back to maize. This helps stop the fungus from growing.',
//   },
//   Cotton: {
//     disease: 'Cotton Boll Rot (Botrytis cinerea)',
//     severity: 'low',
//     cause: 'Gray mold caused by high humidity, poor drainage, and dense canopy blocking sunlight.',
//     remedy: [
//       'Remove affected bolls and improve field drainage to reduce moisture buildup.',
//       'Apply botryticide spray and prune lower branches to allow sunlight penetration.',
//     ],
//     farmer_note:
//       'Your cotton bolls have a mild mold from too much wetness. Remove the rotten bolls, make sure water drains away from the field, and trim some lower branches so sunlight can reach the plants.',
//   },
// }

// const FALLBACK = {
//   disease: 'Unidentified Leaf Condition',
//   severity: 'low',
//   cause: 'Unable to identify specific disease from the image. May be environmental stress or early-stage infection.',
//   remedy: [
//     'Consult your local agricultural extension officer with a physical sample for accurate diagnosis.',
//     'Ensure proper watering, avoid waterlogging, and monitor the plant for changes over the next 5-7 days.',
//   ],
//   farmer_note:
//     'We could not clearly identify the problem from the photo. Please take the plant to your nearest farm advisory centre. In the meantime, make sure the plant has enough water but not too much.',
// }

// // ─── Image validation — rejects icons, logos, non-plant images ───────────────
// export async function validateCropImage(base64Image) {
//   return new Promise((resolve) => {
//     const img = new Image()
//     img.onload = () => {
//       const canvas = document.createElement('canvas')
//       const MAX = 64
//       canvas.width = MAX
//       canvas.height = MAX
//       const ctx = canvas.getContext('2d')
//       ctx.drawImage(img, 0, 0, MAX, MAX)
//       const data = ctx.getImageData(0, 0, MAX, MAX).data

//       let greenScore = 0
//       let brownScore = 0
//       const totalPixels = MAX * MAX
//       let veryDarkPixels = 0

//       for (let i = 0; i < data.length; i += 4) {
//         const r = data[i], g = data[i + 1], b = data[i + 2]
//         const brightness = (r + g + b) / 3
//         if (brightness < 30) veryDarkPixels++
//         if (g > r + 15 && g > b + 10 && g > 60) greenScore++
//         if (r > 80 && g > 50 && b < 80 && r >= g) brownScore++
//       }

//       const darkRatio = veryDarkPixels / totalPixels
//       const greenRatio = greenScore / totalPixels
//       const organicRatio = (greenScore + brownScore) / totalPixels

//       // if (darkRatio > 0.40) {
//       //   resolve({
//       //     valid: false,
//       //     reason: 'This looks like an icon or graphic, not a crop leaf photo. Please upload a real photo of your plant leaf.',
//       //   })
//       //   return
//       // }



//       // Reject dark background icons (checklist, logos on black)
//       if (darkRatio > 0.40) {
//         resolve({
//           valid: false,
//           reason: 'This looks like an icon or graphic, not a crop leaf photo. Please upload a real photo of your plant leaf.',
//         })
//         return
//       }

//       // Reject white/light background with low organic content (gym logo, clipart)
//       const whitePixels = Array.from({ length: totalPixels }).reduce((count, _, idx) => {
//         const i = idx * 4
//         const r = data[i], g = data[i + 1], b = data[i + 2]
//         return (r > 220 && g > 220 && b > 220) ? count + 1 : count
//       }, 0)
//       const whiteRatio = whitePixels / totalPixels

//       if (whiteRatio > 0.45 && organicRatio < 0.08) {
//         resolve({
//           valid: false,
//           reason: 'This looks like a graphic or illustration, not a crop leaf photo. Please upload a real photo of your plant leaf.',
//         })
//         return
//       }




//       if (greenRatio > 0.08 || organicRatio > 0.12) {
//         resolve({ valid: true })
//         return
//       }

//       resolve({ valid: true })
//     }
//     img.onerror = () => resolve({ valid: true })
//     img.src = `data:image/jpeg;base64,${base64Image}`
//   })
// }

// // ─── Main AI Analysis Function ───────────────────────────────────────────────
// export async function analyzeCropImage(base64Image, cropType) {
//   const apiKey = typeof window !== 'undefined' 
//   ? process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY 
//   : null

//   if (!apiKey) {
//     console.warn('No Google Gemini API key found — using rule-based fallback.')
//     return getMockResponse(cropType)
//   }

//   try {
//     const prompt = `You are an expert agricultural scientist.
// The farmer is growing: ${cropType}.

// FIRST: Check if this is actually a photo of a crop leaf or plant.
// - If NOT a plant/leaf/crop (e.g. icon, logo, cartoon, checklist, screenshot, person, object, anything non-agricultural), return ONLY this JSON:
// {"not_a_leaf": true, "message": "This does not appear to be a crop leaf. Please upload a real photo of your plant."}

// - If it IS a plant/leaf, return ONLY this JSON with no extra text or markdown:
// {
//   "disease": "string (full disease name with scientific name)",
//   "severity": "low | medium | high",
//   "cause": "string (1 sentence explanation)",
//   "remedy": ["step 1 (specific and actionable)", "step 2 (specific and actionable)"],
//   "farmer_note": "string (2 sentences max in simple non-technical language for a rural farmer)"
// }`

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: prompt,
//                 },
//                 {
//                   inline_data: {
//                     mime_type: 'image/jpeg',
//                     data: base64Image,
//                   },
//                 },
//               ],
//             },
//           ],
//           generationConfig: {
//             max_output_tokens: 600,
//           },
//         }),
//       }
//     )

//     if (!response.ok) {
//       const err = await response.json()
//       console.error('Google Gemini API error:', err)
//       // Throw actual error details so we can see what's happening
//       const errorMsg = err?.error?.message || JSON.stringify(err)
//       throw new Error(`Gemini API Error (${response.status}): ${errorMsg}`)
//     }

//     const data = await response.json()
//     const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

//     if (!content) return getMockResponse(cropType)

//     const cleaned = content.replace(/```json|```/g, '').trim()
//     const parsed = JSON.parse(cleaned)

//     if (parsed.not_a_leaf) {
//       return { not_a_leaf: true, message: parsed.message }
//     }

//     if (!parsed.disease || !parsed.severity || !parsed.remedy) {
//       return getMockResponse(cropType)
//     }

//     return parsed
//   } catch (err) {
//     console.error('analyzeCropImage failed:', err)
//     // Re-throw so the error shows to the user
//     throw err
//   }
// }

// // ─── Helper: Get mock response by crop type ──────────────────────────────────
// function getMockResponse(cropType) {
//   return MOCK_RESPONSES[cropType] || FALLBACK
// }

// // ─── Helper: Convert File to base64 ─────────────────────────────────────────
// export function fileToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onload = () => {
//       const base64 = reader.result.split(',')[1]
//       resolve(base64)
//     }
//     reader.onerror = () => reject(new Error('Failed to read file'))
//     reader.readAsDataURL(file)
//   })
// }

// // ─── Helper: Severity config ─────────────────────────────────────────────────
// export function getSeverityConfig(severity) {
//   const configs = {
//     low: {
//       label: 'Low Risk',
//       emoji: '🟢',
//       color: 'text-green-400',
//       bg: 'bg-green-900/40',
//       border: 'border-green-500/50',
//       dot: 'bg-green-400',
//     },
//     medium: {
//       label: 'Medium Risk',
//       emoji: '🟡',
//       color: 'text-amber-400',
//       bg: 'bg-amber-900/40',
//       border: 'border-amber-500/50',
//       dot: 'bg-amber-400',
//     },
//     high: {
//       label: 'High Risk',
//       emoji: '🔴',
//       color: 'text-red-400',
//       bg: 'bg-red-900/40',
//       border: 'border-red-500/50',
//       dot: 'bg-red-400',
//     },
//   }
//   return configs[severity?.toLowerCase()] || configs.low
// }


//=====================================gemini =============


/**
 * CropSense AI Utility
 * Analyzes crop leaf images using Google Gemini API
 */

const MOCK_RESPONSES = {
  Tomato: {
    disease: 'Early Blight (Alternaria solani)',
    severity: 'medium',
    cause: 'Fungal infection caused by warm, humid conditions and poor air circulation.',
    remedy: [
      'Remove infected leaves immediately.',
      'Apply copper-based fungicide every 7–10 days.',
    ],
    farmer_note: 'Your tomato plant has a fungus. Remove bad leaves and use a fungicide spray.',
  },
  // ... other mocks remain the same
}

const FALLBACK = {
  disease: 'Unidentified Leaf Condition',
  severity: 'low',
  cause: 'Unable to identify specific disease from the image.',
  remedy: ['Consult a local agri-officer.', 'Monitor plant for 5-7 days.'],
  farmer_note: 'We could not identify the problem. Please ask a local expert.',
}

// Helper: Get mock response
function getMockResponse(cropType) {
  return MOCK_RESPONSES[cropType] || FALLBACK;
}

// ─── Image Validation ────────────────────────────────────────────────────────
export async function validateCropImage(base64Image) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 64;
      canvas.width = MAX; canvas.height = MAX;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, MAX, MAX);
      const data = ctx.getImageData(0, 0, MAX, MAX).data;

      let greenScore = 0;
      let organicScore = 0;
      const totalPixels = MAX * MAX;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (g > r + 10 && g > b + 10) greenScore++; // Simple green check
        if ((r + g + b) / 3 > 40) organicScore++; // Avoid pure black/dark
      }

      const greenRatio = greenScore / totalPixels;
      if (greenRatio < 0.02) {
        resolve({ valid: false, reason: 'This image does not look like a plant. Please upload a clear leaf photo.' });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => resolve({ valid: true });
    img.src = `data:image/jpeg;base64,${base64Image}`;
  });
}

// ─── Main Gemini API Function ────────────────────────────────────────────────
export async function analyzeCropImage(base64Image, cropType, lang = 'en') {
  // Use the specific Gemini Key name we defined in .env
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('Missing API Key: Falling back to Mock Data');
    return getMockResponse(cropType);
  }

  try {
    // We enforce an explicit multi-lingual JSON output for global DB compatibility.
    // The Database will store translations for all 3 languages automatically!
    const jsonFormat = [
      `{`,
      `  "confirmed_crop": "Exact species visible e.g. Rice (Oryza sativa)",`,
      `  "disease": { "en": "Name in English", "hi": "Name in Hindi", "ta": "Name in Tamil" },`,
      `  "severity": "low or medium or high — NEVER translate this field",`,
      `  "cause": { "en": "Symptoms in English", "hi": "Symptoms in Hindi", "ta": "Symptoms in Tamil" },`,
      `  "remedy": [`,
      `    { "en": "Step 1 in English", "hi": "Step 1 in Hindi", "ta": "Step 1 in Tamil" }`,
      `  ],`,
      `  "farmer_note": { "en": "Advice in English", "hi": "Advice in Hindi", "ta": "Advice in Tamil" }`,
      `}`
    ].join('\\n');

    const prompt = [
      `You are a strict expert agronomist. Analyze this image independently.`,
      ``,
      `STEP 1 — IDENTIFY THE PLANT FIRST (ignore what the user said):`,
      `Look at the image carefully. What plant species is actually shown? Use only visual evidence.`,
      ``,
      `STEP 2 — CROSS-CHECK with user selection:`,
      `The user claims the crop is "${cropType}".`,
      `- If the plant is clearly NOT ${cropType}, return ONLY: {"wrong_crop": true, "message": "The image shows [actual plant name], not ${cropType}. Please upload the correct crop or change your selection."}`,
      `- If NO plant is visible at all, return ONLY: {"not_a_leaf": true, "message": "No plant detected in this image."}`,
      ``,
      `STEP 3 — DISEASE ANALYSIS (only if it IS confirmed as ${cropType}):`,
      `Return ONLY valid JSON (no markdown, no backticks) in this exact format:`,
      jsonFormat,
      `CRITICAL: Never assume the plant is ${cropType} because the user said so. Trust only what you visually see.`,
    ].join('\n');

    // Try models in order — each with its correct API version
    // gemini-1.5-flash on v1 has 1500 req/day free quota (very generous)
    const modelEndpoints = [
      { model: 'gemini-2.5-flash', version: 'v1beta' },
      { model: 'gemini-2.0-flash', version: 'v1beta' },
      { model: 'gemini-1.5-flash', version: 'v1' },   // stable endpoint, separate quota
      { model: 'gemini-1.5-flash-latest', version: 'v1' },
    ]

    let data = null
    let lastError = null
    let usedModel = null

    for (const { model, version } of modelEndpoints) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
            }
          })
        }
      );

      const json = await response.json();

      if (response.ok) {
        data = json
        usedModel = model
        console.log(`✅ Using model: ${model}`)
        break
      }

      const errMsg = json?.error?.message || response.statusText || 'Unknown error'
      // If quota/rate-limit or not found, try next model
      if (
        response.status === 429 ||
        response.status === 404 ||
        errMsg.includes('quota') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('not found')
      ) {
        lastError = new Error(`${model}: ${errMsg.substring(0, 60)}`)
        console.warn(`Skipping ${model}: ${errMsg.substring(0, 80)}`)
        await new Promise(r => setTimeout(r, 500))
        continue
      }

      // Any other error — throw immediately
      throw new Error(`Gemini API Error: ${errMsg}`)
    }

    if (!data) {
      throw new Error('All AI models are currently rate-limited. Please wait a minute and try again.')
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) return getMockResponse(cropType);

    // CRITICAL: Extract JSON from the response text (handles markdown backticks)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON format from AI");

    const parsed = JSON.parse(jsonMatch[0]);

    if (parsed.not_a_leaf) return parsed;
    if (parsed.wrong_crop) return parsed;

    return {
      ...parsed,
      severity: parsed.severity?.toLowerCase() || 'low',
      usedModel: usedModel || 'unknown',
    };

  } catch (err) {
    console.error('AI Analysis failed:', err);
    throw err;
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getSeverityConfig(severity) {
  const configs = {
    low: { label: 'Low Risk', emoji: '🟢', color: 'text-green-400', bg: 'bg-green-900/40', border: 'border-green-500/50' },
    medium: { label: 'Medium Risk', emoji: '🟡', color: 'text-amber-400', bg: 'bg-amber-900/40', border: 'border-amber-500/50' },
    high: { label: 'High Risk', emoji: '🔴', color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/50' },
  };
  return configs[severity] || configs.low;
}