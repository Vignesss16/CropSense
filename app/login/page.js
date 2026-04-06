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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // Auto sign-in or route immediately
        router.push('/dashboard')
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

  const handleGoogleLogin = async () => {
    try {
      // Use the current window location to ensure it works on both localhost and Vercel
      const redirectTo = `${window.location.origin}/dashboard`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Failed to login with Google')
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
            Nalam<span className="text-amber-500">Agri</span>
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
                onClick={() => { setMode(tab); setError(''); }}
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

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/40 text-red-300 text-sm"
              >
                {error}
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-forest-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-forest-900/40 text-forest-400 backdrop-blur-sm">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-4 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3
                bg-forest-800/50 hover:bg-forest-700/60 text-white border border-forest-600/50 hover:border-forest-500/60
                transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-forest-500 text-xs mt-6">
          🌿 NalamAgri — Built for farmers, powered by AI
        </p>
      </motion.div>
    </div>
  )
}
// Triggering fresh Vercel build for Google Login fix
