'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { analyzeCropImage, validateCropImage, fileToBase64 } from '@/utils/cropAI'
import { CROP_TYPES, INDIAN_STATES } from '@/utils/farmingTips'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, CheckCircle2, MapPin, Navigation } from 'lucide-react'
import Navbar from '@/components/Navbar'
import DiagnosisResultCard from '@/components/DiagnosisResultCard'
import { useLanguage } from '@/lib/LanguageContext'

export default function DiagnosePage() {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const fileInputRef = useRef(null)

  const [user, setUser] = useState(null)
  const [cropType, setCropType] = useState('')
  const [region, setRegion] = useState('')
  const [detectingRegion, setDetectingRegion] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setUser(session.user)
    })
  }, [router])

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setDetectingRegion(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const state = data?.address?.state || ''
          if (!state) throw new Error('Could not identify state.')
          const matched = INDIAN_STATES.find(
            s => s.toLowerCase() === state.toLowerCase() || state.toLowerCase().includes(s.toLowerCase())
          )
          setRegion(matched || state)
        } catch {
          setError('Location detection failed. Please select manually.')
        } finally {
          setDetectingRegion(false)
        }
      },
      () => {
        setError('Location access denied. Please select your region manually.')
        setDetectingRegion(false)
      }
    )
  }

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image (JPG/PNG).')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
    setResult(null)
    setSaved(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files?.[0])
  }

  const handleAnalyze = async () => {
    if (!imageFile || !cropType || !region) {
      setError('Please select a crop type, pick your region, and upload an image.')
      return
    }
    setAnalyzing(true)
    setError('')
    setResult(null)

    try {
      const base64 = await fileToBase64(imageFile)
      const validation = await validateCropImage(base64)
      if (!validation.valid) throw new Error(validation.reason)

      const diagnosis = await analyzeCropImage(base64, cropType, lang)

      if (diagnosis.not_a_leaf) {
        throw new Error(diagnosis.message || "The AI doesn't recognize this as a crop leaf.")
      }
      if (diagnosis.wrong_crop) {
        throw new Error(diagnosis.message || `This image does not appear to be ${cropType}. Please verify your selection.`)
      }

      setResult(diagnosis)
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try a clearer photo.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!result || !user || saving || saved || !imageFile) return
    setSaving(true)
    try {
      // 1. Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('diagnoses')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('diagnoses')
        .getPublicUrl(fileName)

      // 3. Insert into database
      const { error: insertError } = await supabase.from('diagnoses').insert({
        user_id: user.id,
        crop_type: cropType,
        disease: typeof result.disease === 'object' ? JSON.stringify(result.disease) : result.disease,
        severity: result.severity,
        cause: typeof result.cause === 'object' ? JSON.stringify(result.cause) : result.cause,
        remedy: Array.isArray(result.remedy) ? result.remedy.map(r => typeof r === 'object' ? JSON.stringify(r) : r) : result.remedy,
        farmer_note: typeof result.farmer_note === 'object' ? JSON.stringify(result.farmer_note) : result.farmer_note,
        region: region,
        image_url: publicUrl,
      })
      if (insertError) throw insertError
      setSaved(true)
    } catch (err) {
      console.error("Save Error:", err);
      setError(t('failedToSave') + " (Storage error?)")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setImageFile(null)
    setImagePreview(null)
    setResult(null)
    setSaved(false)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-900/50 border border-amber-500/30 flex items-center justify-center">
              <Sparkles size={13} className="text-amber-400" />
            </div>
            <span className="text-xs text-forest-400 uppercase tracking-widest font-medium">AI Diagnosis</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold premium-text mb-1 leading-tight">
            {t('diagnoseCrop')}
          </h1>
          <p className="text-forest-300 text-xs sm:text-sm max-w-lg leading-relaxed">
            {t('diagnoseDescription')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">

          {/* ── LEFT: Input Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5"
          >

            {/* Crop Type */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <label className="block text-xs text-forest-300 uppercase tracking-widest font-bold mb-3">
                🌿 {t('selectCrop')}
              </label>
              <select
                className="w-full p-3 bg-forest-950/60 border border-forest-700 rounded-xl text-white outline-none focus:border-amber-500 transition-colors text-sm"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              >
                <option value="">{t('selectCrop')}...</option>
                {CROP_TYPES.map(c => <option key={c} value={c}>{t(`crops.${c}`) || c}</option>)}
              </select>
            </div>

            {/* Region */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <label className="block text-xs text-forest-300 uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
                <MapPin size={12} className="text-amber-400" />
                {t('farmRegionLabel')}
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 p-3 bg-forest-950/60 border border-forest-700 rounded-xl text-white outline-none focus:border-amber-500 transition-colors text-sm"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option value="">{t('selectStatePlaceholder')}</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{t(`states.${s}`) || s}</option>)}
                </select>
                <button
                  onClick={handleAutoDetectLocation}
                  disabled={detectingRegion}
                  title="Auto-detect my location"
                  className="w-12 h-12 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/40 flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-50"
                >
                  {detectingRegion
                    ? <Loader2 size={18} className="animate-spin text-amber-400" />
                    : <Navigation size={18} className="text-amber-400" />
                  }
                </button>
              </div>
              {region && (
                <p className="mt-2 text-xs text-amber-400 flex items-center gap-1">
                  <MapPin size={10} /> {t(`states.${region}`) || region}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <label className="block text-xs text-forest-300 uppercase tracking-widest font-bold mb-3">
                📷 {t('uploadInstruction')}
              </label>
              {!imagePreview ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed p-6 sm:p-10 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-amber-500/70 bg-amber-900/20 scale-[1.01]'
                      : 'border-forest-600/50 hover:border-forest-400/50 hover:bg-forest-800/20'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-forest-900/80 border border-forest-600/50 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🌾</span>
                  </div>
                  <p className="text-white text-sm font-semibold mb-1">
                    {dragOver ? 'Drop it here!' : 'Click or drag to upload'}
                  </p>
                  <p className="text-forest-400 text-xs">JPG, PNG, WEBP up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Crop preview" className="w-full h-52 object-cover rounded-xl" />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/70 hover:bg-black/90 flex items-center justify-center text-white transition-colors text-xs font-bold"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-xs truncate">{imageFile?.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !cropType || !region || !imageFile}
              className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5
                bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400
                text-white border border-amber-400/30 shadow-lg shadow-amber-900/30
                hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 uppercase tracking-wider"
            >
              {analyzing
                ? <><Loader2 size={18} className="animate-spin" /> {t('analyzingImage')}</>
                : <><Sparkles size={18} /> {t('analyzeNow')}</>
              }
            </button>

            {/* Analyzing dots */}
            <AnimatePresence>
              {analyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel rounded-xl p-4 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {[0, 150, 300].map(delay => (
                      <div key={delay} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                  <p className="text-forest-300 text-xs">AI is analyzing your {cropType} leaf in {region}...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Saved */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-3 rounded-xl bg-green-950/50 border border-green-800/50 text-green-300 text-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={15} />
                  Saved to your Farm Log!
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="underline hover:text-green-200 ml-auto font-semibold"
                  >
                    View Dashboard →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: Result Panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {result ? (
              <DiagnosisResultCard result={result} onSave={handleSave} saving={saving} showSaveButton={!saved} />
            ) : (
              <div className="glass-panel h-full min-h-[22rem] rounded-2xl flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 rounded-2xl bg-forest-900/80 border border-forest-600/30 flex items-center justify-center mb-5 shadow-inner">
                  <span className="text-4xl">🔬</span>
                </div>
                <h3 className="text-white font-bold text-md sm:text-lg mb-2">{t('readyForDiagnosis')}</h3>
                <p className="text-forest-400 text-xs sm:text-sm max-w-xs leading-relaxed">{t('uploadClearImage')}</p>
                <div className="flex flex-col gap-2 mt-6 w-full max-w-[200px] text-xs text-forest-500 text-left">
                  {[
                    '✓ Select your crop type',
                    '✓ Pick your region/state',
                    '✓ Upload a leaf photo',
                    '✓ Click Analyze',
                  ].map(s => <span key={s}>{s}</span>)}
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </main>
    </div>
  )
}