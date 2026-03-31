/**
 * CropSense AI Utility
 * Analyzes crop leaf images using OpenAI GPT-4o Vision
 * Falls back to rule-based mock data if API fails
 */

// ─── Fallback mock responses (rule-based, no API needed) ────────────────────
const MOCK_RESPONSES = {
  Tomato: {
    disease: 'Early Blight (Alternaria solani)',
    severity: 'medium',
    cause: 'Fungal infection caused by warm, humid conditions and poor air circulation around plants.',
    remedy: [
      'Remove and destroy infected leaves immediately, then apply copper-based fungicide every 7–10 days.',
      'Improve spacing between plants to increase airflow and avoid overhead watering.',
    ],
    farmer_note:
      'Your tomato plant has a fungus attacking its leaves. Remove the bad leaves, spray a cheap fungicide from the farm shop, and make sure plants are not too close together so air can move between them.',
  },
  Wheat: {
    disease: 'Wheat Rust (Puccinia striiformis)',
    severity: 'high',
    cause: 'Fungal spores spread by wind, thriving in cool, moist weather conditions.',
    remedy: [
      'Apply triazole-based fungicide (e.g., tebuconazole) immediately at first sign of infection.',
      'Use rust-resistant wheat varieties in next season and monitor fields weekly.',
    ],
    farmer_note:
      'Your wheat has a serious rust disease spreading by wind. Spray it with fungicide from your local agri-store right away. Act fast — this spreads quickly to other plants.',
  },
  Rice: {
    disease: 'Rice Blast (Magnaporthe oryzae)',
    severity: 'high',
    cause: 'Fungal pathogen favored by high humidity, excess nitrogen fertilizer, and night temperatures between 20–25°C.',
    remedy: [
      'Apply blast-specific fungicide like tricyclazole or isoprothiolane at heading stage.',
      'Reduce nitrogen application, drain fields periodically, and plant resistant varieties.',
    ],
    farmer_note:
      'Your rice has blast disease, a common problem in wet weather. Spray the recommended fungicide, and next time use less nitrogen fertilizer. Ask your nearest agriculture officer for the right medicine.',
  },
  Maize: {
    disease: 'Gray Leaf Spot (Cercospora zeae-maydis)',
    severity: 'medium',
    cause: 'Fungal disease thriving in humid conditions with minimum tillage and continuous maize planting.',
    remedy: [
      'Apply foliar fungicide containing azoxystrobin or propiconazole during early infection stage.',
      'Rotate crops with non-host plants like legumes and use certified disease-resistant hybrid seeds.',
    ],
    farmer_note:
      'Your maize has gray leaf spot — a fungus from wet conditions. Spray it with fungicide and next season, plant something different in that field, then come back to maize. This helps stop the fungus from growing.',
  },
  Cotton: {
    disease: 'Cotton Boll Rot (Botrytis cinerea)',
    severity: 'low',
    cause: 'Gray mold caused by high humidity, poor drainage, and dense canopy blocking sunlight.',
    remedy: [
      'Remove affected bolls and improve field drainage to reduce moisture buildup.',
      'Apply botryticide spray and prune lower branches to allow sunlight penetration.',
    ],
    farmer_note:
      'Your cotton bolls have a mild mold from too much wetness. Remove the rotten bolls, make sure water drains away from the field, and trim some lower branches so sunlight can reach the plants.',
  },
}

const FALLBACK = {
  disease: 'Unidentified Leaf Condition',
  severity: 'low',
  cause: 'Unable to identify specific disease from the image. May be environmental stress or early-stage infection.',
  remedy: [
    'Consult your local agricultural extension officer with a physical sample for accurate diagnosis.',
    'Ensure proper watering, avoid waterlogging, and monitor the plant for changes over the next 5–7 days.',
  ],
  farmer_note:
    'We could not clearly identify the problem from the photo. Please take the plant to your nearest farm advisory centre. In the meantime, make sure the plant has enough water but not too much.',
}

// ─── Main AI Analysis Function ───────────────────────────────────────────────
export async function analyzeCropImage(base64Image, cropType) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

  // If no API key, use rule-based fallback immediately
  if (!apiKey) {
    console.warn('No OpenAI API key found — using rule-based fallback.')
    return getMockResponse(cropType)
  }

  try {
    const prompt = `You are an expert agricultural scientist. 
The farmer is growing: ${cropType}.
Analyze this crop leaf image and return ONLY valid JSON with no extra text or markdown:
{
  "disease": "string (full disease name with scientific name)",
  "severity": "low | medium | high",
  "cause": "string (1 sentence explanation)",
  "remedy": ["step 1 (specific and actionable)", "step 2 (specific and actionable)"],
  "farmer_note": "string (2 sentences max explaining the remedy in simple, non-technical language a rural farmer with no science background can understand)"
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'low',
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('OpenAI API error:', err)
      return getMockResponse(cropType)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) return getMockResponse(cropType)

    // Strip markdown code blocks if present
    const cleaned = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Validate required fields
    if (!parsed.disease || !parsed.severity || !parsed.remedy) {
      return getMockResponse(cropType)
    }

    return parsed
  } catch (err) {
    console.error('analyzeCropImage failed:', err)
    return getMockResponse(cropType)
  }
}

// ─── Helper: Get mock response by crop type ──────────────────────────────────
function getMockResponse(cropType) {
  return MOCK_RESPONSES[cropType] || FALLBACK
}

// ─── Helper: Convert File to base64 ─────────────────────────────────────────
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Strip the data URL prefix: "data:image/jpeg;base64,"
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// ─── Helper: Severity config ─────────────────────────────────────────────────
export function getSeverityConfig(severity) {
  const configs = {
    low: {
      label: 'Low Risk',
      emoji: '🟢',
      color: 'text-green-400',
      bg: 'bg-green-900/40',
      border: 'border-green-500/50',
      dot: 'bg-green-400',
    },
    medium: {
      label: 'Medium Risk',
      emoji: '🟡',
      color: 'text-amber-400',
      bg: 'bg-amber-900/40',
      border: 'border-amber-500/50',
      dot: 'bg-amber-400',
    },
    high: {
      label: 'High Risk',
      emoji: '🔴',
      color: 'text-red-400',
      bg: 'bg-red-900/40',
      border: 'border-red-500/50',
      dot: 'bg-red-400',
    },
  }
  return configs[severity?.toLowerCase()] || configs.low
}
