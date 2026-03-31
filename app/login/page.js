'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then log in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-forest-400/8 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest-700/60 border border-forest-400/30 mb-4"
          >
            <Leaf size={28} className="text-amber-500" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Crop<span className="text-amber-500">Sense</span>
          </h1>
          <p className="text-forest-300 text-sm">AI-powered crop health assistant</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 border border-forest-400/20">
          <div className="mb-6">
            <h2 className="text-white font-semibold text-lg mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-forest-300 text-sm">
              {mode === 'login'
                ? 'Sign in to access your farm dashboard'
                : 'Start diagnosing your crops with AI'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-6 p-1 bg-forest-900/60 rounded-xl border border-forest-700/40">
            {['login', 'signup'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setMode(tab); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${mode === tab
                    ? 'bg-forest-600/70 text-white border border-forest-400/30 shadow-sm'
                    : 'text-forest-300 hover:text-white'
                  }`}
              >
                {tab === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-forest-300 uppercase tracking-widest font-medium mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="farmer@example.com"
                  className="w-full bg-forest-900/60 border border-forest-600/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-forest-500 hover:border-forest-400/50 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-forest-300 uppercase tracking-widest font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-forest-900/60 border border-forest-600/50 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-forest-500 hover:border-forest-400/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/40 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-green-900/30 border border-green-700/40 text-green-300 text-sm"
              >
                {success}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                bg-gradient-to-r from-forest-600 to-forest-500 hover:from-forest-500 hover:to-forest-400
                text-white border border-forest-400/30 hover:border-forest-300/50
                hover:shadow-lg hover:shadow-forest-900/60 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-forest-500 text-xs mt-6">
          🌿 CropSense — Built for farmers, powered by AI
        </p>
      </motion.div>
    </div>
  )
}
