# 🌿 NalamAgri — AI Crop Health Assistant

> Smart farming assistant that diagnoses crop diseases using AI and recommends actionable fixes for farmers.

---

## 1. PROJECT FOLDER STRUCTURE

```
NalamAgri/
├── app/
│   ├── globals.css
│   ├── layout.js
│   ├── page.js              ← redirects to /login
│   ├── login/
│   │   └── page.js
│   ├── dashboard/
│   │   └── page.js
│   └── diagnose/
│       └── page.js
├── components/
│   ├── Navbar.js
│   ├── SeverityBadge.js
│   └── DiagnosisResultCard.js
├── lib/
│   └── supabase.js
├── utils/
│   ├── cropAI.js            ← AI logic isolated here
│   └── farmingTips.js       ← static tips data
├── .env.local
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 2. NPM INSTALL COMMANDS

```bash
# Create and enter project
npx create-next-app@14.2.5 NalamAgri --app --no-typescript --no-eslint --no-src-dir --import-alias "@/*"
cd NalamAgri

# Then replace all generated files with the ones from this repo
# Install all dependencies at once:
npm install @supabase/supabase-js framer-motion lucide-react openai
```

Or install all at once from scratch (without create-next-app):
```bash
npm install next@14.2.5 react react-dom @supabase/supabase-js framer-motion lucide-react openai
npm install -D tailwindcss postcss autoprefixer eslint eslint-config-next
npx tailwindcss init -p
```

---

## 3. STEP-BY-STEP SETUP

### Step 1 — Clone / copy files
Copy all project files into your working directory.

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Create Supabase project
1. Go to https://supabase.com
2. Create a new project (note your project URL and anon key)
3. Go to SQL Editor → paste the schema below → Run

### Step 4 — Create Supabase Storage bucket
1. In Supabase dashboard → Storage → New Bucket
2. Name it: `crop-images`
3. Set it to **Public**
4. Enable "Allow public access"

### Step 5 — Set up .env.local (see section 4 below)

### Step 6 — Run the project
```bash
npm run dev
```
Open: http://localhost:3000

---

## 4. .env.local SETUP

Create a file named `.env.local` in the root of the project:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI (optional — app works without it using rule-based fallback)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key
```

Where to find these values:
- Supabase: Project Settings → API → Project URL + anon public key
- OpenAI: https://platform.openai.com/api-keys

---

## 5. SUPABASE SQL SCHEMA

**Paste this in Supabase SQL Editor and click Run:**

```sql
-- Enable UUID extension (required)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── diagnoses table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnoses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type   TEXT NOT NULL,
  disease     TEXT NOT NULL,
  severity    TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  cause       TEXT,
  remedy      TEXT[],
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS diagnoses_user_id_idx ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS diagnoses_created_at_idx ON diagnoses(created_at DESC);

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own diagnoses
CREATE POLICY "Users can view own diagnoses"
  ON diagnoses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own diagnoses
CREATE POLICY "Users can insert own diagnoses"
  ON diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own diagnoses
CREATE POLICY "Users can delete own diagnoses"
  ON diagnoses FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 6. SAMPLE DATA INSERTS

**Run these after creating an account and getting your user ID from Supabase Auth:**

```sql
-- Replace 'your-user-uuid-here' with actual user ID from auth.users table

INSERT INTO diagnoses (user_id, crop_type, disease, severity, cause, remedy) VALUES
(
  'your-user-uuid-here',
  'Tomato',
  'Early Blight (Alternaria solani)',
  'medium',
  'Fungal infection caused by warm, humid conditions and poor air circulation.',
  ARRAY[
    'Remove infected leaves immediately and apply copper-based fungicide every 7–10 days.',
    'Improve spacing between plants to increase airflow and avoid overhead watering.'
  ]
),
(
  'your-user-uuid-here',
  'Wheat',
  'Wheat Rust (Puccinia striiformis)',
  'high',
  'Fungal spores spread by wind, thriving in cool, moist weather conditions.',
  ARRAY[
    'Apply triazole-based fungicide (tebuconazole) immediately at first sign.',
    'Use rust-resistant varieties next season and monitor fields weekly.'
  ]
),
(
  'your-user-uuid-here',
  'Rice',
  'Rice Blast (Magnaporthe oryzae)',
  'high',
  'Fungal pathogen favored by high humidity and excess nitrogen fertilizer.',
  ARRAY[
    'Apply tricyclazole or isoprothiolane fungicide at heading stage.',
    'Reduce nitrogen application and drain fields periodically.'
  ]
);
```

---

## 7. WORKING CRUD QUERIES (used in frontend)

```sql
-- READ: Fetch diagnoses for a user (newest first)
SELECT * FROM diagnoses
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 20;

-- CREATE: Insert a new diagnosis
INSERT INTO diagnoses (user_id, crop_type, disease, severity, cause, remedy, image_url)
VALUES (
  auth.uid(),
  'Tomato',
  'Early Blight',
  'medium',
  'Fungal infection from humid conditions',
  ARRAY['Remove infected leaves', 'Apply copper fungicide'],
  'https://your-storage-url/image.jpg'
)
RETURNING *;

-- DELETE: Remove a diagnosis
DELETE FROM diagnoses WHERE id = 'diagnosis-uuid' AND user_id = auth.uid();
```

---

## 8. HOW TO RUN THE PROJECT

```bash
# Development
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start

# Deploy to Vercel (1 command)
npx vercel --prod
# Add env variables in Vercel dashboard or use: vercel env add
```

---

## 9. AI FEATURE EXPLANATION

### What the AI does:
Analyzes a base64-encoded crop leaf image using **OpenAI GPT-4o Vision** and returns:
- Disease name (with scientific name)
- Severity: low / medium / high
- Cause (1 sentence)
- 2-step remedy
- Farmer Note ("In Simple Words 🌾") — plain language explanation for rural farmers

### Where it lives:
```
utils/cropAI.js   ← ALL AI logic isolated here
```

### Key functions:
```js
analyzeCropImage(base64Image, cropType)  // main AI call
fileToBase64(file)                       // converts File → base64
getSeverityConfig(severity)              // returns badge styling
```

### Fallback strategy:
If OpenAI API key is missing OR the API call fails → automatically returns
rule-based mock data from `MOCK_RESPONSES` in `cropAI.js` — app always works!

### Where it's used in UI:
```
app/diagnose/page.js → calls analyzeCropImage() on button click
components/DiagnosisResultCard.js → renders the result + farmer_note
```

---

## 10. COMMON ERRORS & QUICK FIXES

| Error | Cause | Fix |
|---|---|---|
| `Missing Supabase environment variables` | .env.local not set | Create .env.local with correct values |
| `Failed to fetch` on analyze | OpenAI key missing/wrong | Check NEXT_PUBLIC_OPENAI_API_KEY or app uses fallback automatically |
| `new row violates row-level security` | RLS policies not set | Run the full SQL schema including CREATE POLICY statements |
| `Storage bucket not found` | crop-images bucket missing | Create public bucket named `crop-images` in Supabase Storage |
| Image not showing on dashboard | Storage URL wrong | Make sure bucket is set to Public in Supabase |
| Hydration error | Server/client mismatch | All interactive components have `'use client'` directive ✅ |
| `Cannot find module '@/lib/supabase'` | Path alias not configured | Check next.config.js and ensure `@/*` maps to root |
| White screen on /dashboard | Not authenticated | Sign up first at /login, confirm email if required |

---

## SUPABASE EMAIL CONFIRMATION NOTE

By default Supabase requires email confirmation. For hackathon speed:
1. Go to Supabase → Authentication → Settings
2. Toggle OFF "Enable email confirmations"
3. Users can now log in immediately after sign up ✅
