'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { FlaskConical, Clock, Sprout, Lightbulb, ChevronRight, AlertTriangle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SeverityBadge from '@/components/SeverityBadge'
import { FARMING_TIPS } from '@/utils/farmingTips'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [diagnoses, setDiagnoses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      await fetchDiagnoses(session.user.id)
    }
    init()
  }, [router])

  async function fetchDiagnoses(userId) {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) setDiagnoses(data)
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
              Farm Dashboard
            </h1>
            <p className="text-forest-300 text-sm">
              {diagnoses.length > 0
                ? `${diagnoses.length} diagnosis${diagnoses.length !== 1 ? 'es' : ''} logged`
                : 'Start by diagnosing your first crop'}
            </p>
          </div>
          <Link
            href="/diagnose"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-sm font-semibold border border-forest-400/30 hover:border-forest-300/40 transition-all hover:shadow-lg hover:shadow-forest-900/50"
          >
            <FlaskConical size={15} />
            Diagnose My Crop
            <ChevronRight size={14} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diagnoses History — Left/Main */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={15} className="text-forest-400" />
              <h2 className="text-forest-200 text-sm font-semibold uppercase tracking-widest">
                Farm Log History
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl shimmer" />
                ))}
              </div>
            ) : diagnoses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-10 text-center border border-forest-600/20"
              >
                <div className="w-14 h-14 rounded-2xl bg-forest-800/60 border border-forest-600/30 flex items-center justify-center mx-auto mb-4">
                  <Sprout size={24} className="text-forest-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">No diagnoses yet</h3>
                <p className="text-forest-400 text-sm mb-5 max-w-xs mx-auto">
                  Upload a photo of your crop leaf to get an AI-powered disease diagnosis
                </p>
                <Link
                  href="/diagnose"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-sm font-semibold transition-all"
                >
                  <FlaskConical size={14} />
                  Start Diagnosing
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4 stagger">
                {diagnoses.map((d, index) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="glass rounded-2xl p-5 border border-forest-400/20 hover:border-forest-400/35 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-forest-700/60 border border-forest-500/30 flex items-center justify-center flex-shrink-0">
                          <Sprout size={16} className="text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs text-forest-400 font-medium uppercase tracking-widest">
                              {d.crop_type}
                            </span>
                            <span className="text-forest-600 text-xs">•</span>
                            <span className="text-forest-400 text-xs">{formatDate(d.created_at)}</span>
                          </div>
                          <h3 className="text-white font-semibold text-sm leading-snug mb-2">{d.disease}</h3>
                          <SeverityBadge severity={d.severity} size="sm" />
                        </div>
                      </div>
                    </div>

                    {d.cause && (
                      <p className="text-forest-300 text-xs leading-relaxed mt-3 pl-13 line-clamp-2">
                        {d.cause}
                      </p>
                    )}

                    {d.remedy && d.remedy.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-forest-700/40">
                        <p className="text-xs text-forest-400 uppercase tracking-widest font-medium mb-1.5">Remedy</p>
                        <p className="text-forest-300 text-xs leading-relaxed line-clamp-2">
                          {d.remedy[0]}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tip Feed — Right Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={15} className="text-amber-400" />
              <h2 className="text-forest-200 text-sm font-semibold uppercase tracking-widest">
                Seasonal Tips
              </h2>
            </div>

            <div className="space-y-3 stagger">
              {FARMING_TIPS.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="glass rounded-xl p-4 border border-forest-400/15 hover:border-amber-500/20 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{tip.icon}</span>
                    <span className="text-white text-xs font-semibold">{tip.title}</span>
                    <span className="ml-auto text-forest-500 text-xs bg-forest-800/60 px-2 py-0.5 rounded-full">
                      {tip.category}
                    </span>
                  </div>
                  <p className="text-forest-300 text-xs leading-relaxed">{tip.tip}</p>
                </motion.div>
              ))}
            </div>

            {/* Warning card */}
            <div className="rounded-xl p-4 border border-amber-700/30 mt-2"
              style={{ background: 'rgba(245,166,35,0.06)' }}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-300/80 text-xs leading-relaxed">
                  Always consult your local agricultural extension officer before applying any treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
