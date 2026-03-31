'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { analyzeCropImage, fileToBase64 } from '@/utils/cropAI'
import { CROP_TYPES } from '@/utils/farmingTips'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, ImageIcon, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import DiagnosisResultCard from '@/components/DiagnosisResultCard'

export default function DiagnosePage() {
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [user, setUser] = useState(null)
  const [cropType, setCropType] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setUser(session.user)
    })
  }, [router])

  const handleFileSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setResult(null)
    setSaved(false)
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  const handleAnalyze = async () => {
    if (!imageFile) { setError('Please upload a crop leaf image.'); return }
    if (!cropType) { setError('Please select a crop type.'); return }

    setError('')
    setAnalyzing(true)
    setResult(null)
    setSaved(false)

    try {
      const base64 = await fileToBase64(imageFile)
      const diagnosis = await analyzeCropImage(base64, cropType)
      setResult(diagnosis)
    } catch (err) {
      console.error(err)
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!result || !user) return
    setSaving(true)

    try {
      let imageUrl = null

      // Upload image to Supabase Storage
      try {
        const ext = imageFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('crop-images')
          .upload(path, imageFile, { upsert: false })

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('crop-images')
            .getPublicUrl(path)
          imageUrl = urlData?.publicUrl || null
        }
      } catch {
        // Storage upload is optional — proceed without image_url
      }

      // Save to diagnoses table
      const { error: insertError } = await supabase.from('diagnoses').insert({
        user_id: user.id,
        crop_type: cropType,
        disease: result.disease,
        severity: result.severity,
        cause: result.cause,
        remedy: result.remedy,
        image_url: imageUrl,
      })

      if (insertError) throw insertError

      setSaved(true)
    } catch (err) {
      console.error(err)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setImageFile(null)
    setImagePreview(null)
    setCropType('')
    setResult(null)
    setSaved(false)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-forest-700/60 border border-forest-500/30 flex items-center justify-center">
              <Sparkles size={13} className="text-amber-400" />
            </div>
            <span className="text-xs text-forest-400 uppercase tracking-widest font-medium">AI Diagnosis</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
            Diagnose My Crop
          </h1>
          <p className="text-forest-300 text-sm max-w-lg">
            Upload a clear photo of your crop leaf and our AI will identify diseases,
            severity, and give you actionable steps to fix it.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload Form */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Crop Type Select */}
            <div className="glass rounded-2xl p-5 border border-forest-400/20">
              <label className="block text-xs text-forest-300 uppercase tracking-widest font-medium mb-2">
                Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full bg-forest-900/60 border border-forest-600/50 rounded-xl px-4 py-3 text-sm text-white hover:border-forest-400/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-forest-900">Select crop type...</option>
                {CROP_TYPES.map((crop) => (
                  <option key={crop} value={crop} className="bg-forest-900">{crop}</option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="glass rounded-2xl p-5 border border-forest-400/20">
              <label className="block text-xs text-forest-300 uppercase tracking-widest font-medium mb-3">
                Crop Leaf Image
              </label>

              {!imagePreview ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all
                    ${dragOver
                      ? 'border-amber-500/60 bg-amber-900/10'
                      : 'border-forest-600/50 hover:border-forest-400/50 hover:bg-forest-800/30'
                    }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-forest-800/60 border border-forest-600/30 flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={20} className="text-forest-400" />
                  </div>
                  <p className="text-white text-sm font-medium mb-1">
                    {dragOver ? 'Drop image here' : 'Click or drag to upload'}
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
                  <img
                    src={imagePreview}
                    alt="Crop leaf preview"
                    className="w-full h-52 object-cover rounded-xl"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
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
                  className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/40 text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !imageFile || !cropType}
              className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5
                bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400
                text-white border border-amber-400/30
                hover:shadow-lg hover:shadow-amber-900/40 transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze Crop
                </>
              )}
            </button>

            {/* Loading state */}
            <AnimatePresence>
              {analyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-xl p-4 border border-forest-400/15 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-forest-300 text-xs">
                    AI is analyzing your {cropType} leaf...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Saved success */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-3 rounded-xl bg-green-900/30 border border-green-700/40 text-green-300 text-sm flex items-center gap-2"
                >
                  <CheckCircle2 size={15} />
                  Saved to your Farm Log!{' '}
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="underline hover:text-green-200 ml-1"
                  >
                    View Dashboard →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right: AI Result */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {!result && !analyzing && (
              <div className="glass rounded-2xl p-10 text-center border border-forest-600/20 h-full flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-14 h-14 rounded-2xl bg-forest-800/60 border border-forest-600/30 flex items-center justify-center mb-4">
                  <Upload size={22} className="text-forest-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">AI Result will appear here</h3>
                <p className="text-forest-400 text-sm max-w-xs">
                  Upload a clear photo of your crop leaf and click "Analyze Crop" to get started
                </p>
              </div>
            )}

            {result && (
              <DiagnosisResultCard
                result={result}
                showSaveButton={!saved}
                onSave={handleSave}
                saving={saving}
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
