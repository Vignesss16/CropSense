'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, Clock, Sprout, Lightbulb, ChevronRight, AlertTriangle, Users, BookOpen, Info, ChevronDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SeverityBadge from '@/components/SeverityBadge'
import { getFarmingTips, INDIAN_STATES } from '@/utils/farmingTips'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { getLocalized } from '@/lib/localization'

export default function DashboardPage() {
  const router = useRouter()
  const { t, lang } = useLanguage()
  const [user, setUser] = useState(null)
  
  const [personalDiagnoses, setPersonalDiagnoses] = useState([])
  const [communityDiagnoses, setCommunityDiagnoses] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('personal') // 'personal' | 'community'
  const [expandedId, setExpandedId] = useState(null)
  const [regionFilter, setRegionFilter] = useState('all')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      await Promise.all([
        fetchPersonalDiagnoses(session.user.id),
        fetchCommunityDiagnoses()
      ])
      setLoading(false)
    }
    init()
  }, [router])

  async function fetchPersonalDiagnoses(userId) {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (!error && data) setPersonalDiagnoses(data)
  }

  async function fetchCommunityDiagnoses() {
    // Fetch latest diagnoses out of ALL users for the community radar
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    if (!error && data) setCommunityDiagnoses(data)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  
  // Choose which list to render (with optional region filter for community)
  const baseList = viewMode === 'personal' ? personalDiagnoses : communityDiagnoses
  const activeList = viewMode === 'community' && regionFilter !== 'all'
    ? baseList.filter(d => d.region === regionFilter)
    : baseList
  const farmingTips = getFarmingTips(lang)

  return (
    <div className="min-h-screen bg-forest-950 text-white">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold premium-text mb-0 leading-tight">
              {t('farmDashboard')}
            </h1>
            <p className="text-forest-400 text-sm drop-shadow-md">
              {personalDiagnoses.length > 0
                ? `${personalDiagnoses.length} ${t('diagnosesLogged')}`
                : t('startDiagnosing')}
            </p>
          </div>
          <Link
            href="/diagnose"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold shadow-lg shadow-amber-900/30 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5 border border-amber-400/50"
          >
            <FlaskConical size={16} />
            {t('diagnoseMyCrop')}
            <ChevronRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Container */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* View Toggle */}
            <div className="flex bg-forest-900/50 p-1.5 rounded-xl border border-forest-700/50 backdrop-blur-md shadow-inner">
              <button
                onClick={() => setViewMode('personal')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'personal' 
                  ? 'bg-forest-600 shadow-lg shadow-forest-900/50 text-white border border-forest-500/50' 
                  : 'text-forest-400 hover:text-white hover:bg-forest-800/50 border border-transparent'
                }`}
              >
                <Clock size={16} />
                {t('myFarmLog')}
              </button>
              <button
                onClick={() => setViewMode('community')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === 'community' 
                  ? 'bg-amber-600/90 shadow-lg shadow-amber-900/50 text-white border border-amber-500/50' 
                  : 'text-forest-400 hover:text-white hover:bg-forest-800/50 border border-transparent'
                }`}
              >
                <Users size={16} />
                {t('communityRadar')}
              </button>
            </div>

            {/* Radar Explainer */}
            <AnimatePresence>
              {viewMode === 'community' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl overflow-hidden shadow-xl"
                >
                  <div className="bg-gradient-to-r from-amber-900/30 to-amber-900/10 border-l-4 border-amber-500 p-4 flex gap-3 text-sm text-amber-200/90 backdrop-blur-md">
                    <Info size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p>{t('communityRadarExplainer')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Region Filter for Community Radar */}
            <AnimatePresence>
              {viewMode === 'community' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-forest-400 font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
                      📍 Filter Region
                    </label>
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="flex-1 p-2.5 bg-forest-900/80 border border-forest-700/80 rounded-xl text-white text-xs outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="all">🌏 All Regions (India)</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 rounded-2xl bg-forest-800/50 animate-pulse border border-forest-600/20 shadow-lg" />
                ))}
              </div>
            ) : activeList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel text-center border-2 border-dashed border-forest-600/30 p-12 rounded-3xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-forest-800/60 border border-forest-600/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  {viewMode === 'personal' ? <Sprout size={28} className="text-forest-400" /> : <Users size={28} className="text-forest-400" />}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {viewMode === 'personal' ? t('noDiagnosesYet') : t('noCommunityActivity')}
                </h3>
                <p className="text-forest-400 text-sm mb-6 max-w-sm mx-auto">
                  {viewMode === 'personal' 
                    ? t('uploadToGetDiagnosis')
                    : t('beTheFirstToContribute')}
                </p>
                {viewMode === 'personal' && (
                  <Link
                    href="/diagnose"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-sm font-semibold transition-all border border-forest-400/50 shadow-lg shadow-forest-900/50"
                  >
                    <FlaskConical size={16} />
                    {t('startDiagnosingBtn')}
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4 relative">
                <AnimatePresence mode="popLayout">
                  {activeList.map((d, index) => {
                    const isExpanded = expandedId === d.id;
                    return (
                    <motion.div
                      key={d.id}
                      onClick={() => setExpandedId(isExpanded ? null : d.id)}
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="glass-panel rounded-2xl p-4 sm:p-6 transition-all group cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-forest-900/40 relative overflow-hidden"
                    >
                      {/* Interactive hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-forest-400/0 via-forest-400/5 to-forest-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                      <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${viewMode === 'community' ? 'bg-amber-900/50 border border-amber-500/40' : 'bg-forest-700/80 border border-forest-400/50'}`}>
                            {viewMode === 'community' ? <AlertTriangle size={18} className="text-amber-400 drop-shadow-md" /> : <Sprout size={18} className="text-emerald-400 drop-shadow-md" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs text-forest-300 font-bold uppercase tracking-wider bg-forest-950/80 px-2 py-0.5 rounded-md border border-forest-700/80 shadow-inner">
                                {t(`crops.${d.crop_type}`) || d.crop_type}
                              </span>
                              <span className="text-forest-600 text-xs">•</span>
                              <span className="text-forest-400 text-xs font-medium">
                                {viewMode === 'community' ? `${t('spotted')} ${formatDate(d.created_at)}` : formatDate(d.created_at)}
                              </span>
                              {d.region && (
                                <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold bg-cyan-900/30 border border-cyan-700/50 px-2 py-0.5 rounded-full">
                                  📍 {t(`states.${d.region}`) || d.region}
                                </span>
                              )}
                            </div>
                            <h3 className="text-white font-bold text-base md:text-lg leading-tight mb-2 pr-8">{getLocalized(d.disease, lang)}</h3>
                            <SeverityBadge severity={d.severity} size="sm" />
                          </div>
                        </div>
                        <ChevronDown 
                          size={20} 
                          className={`text-forest-400 group-hover:text-amber-400 transition-all duration-300 absolute right-6 top-6 ${isExpanded ? 'rotate-180 text-amber-500' : ''}`} 
                        />
                      </div>

                      {d.cause && (
                        <div className="mt-3 sm:mt-4 pl-13 sm:pl-16 relative z-10">
                          <p className={`text-forest-200 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {getLocalized(d.cause, lang)}
                          </p>
                        </div>
                      )}

                      <AnimatePresence>
                        {isExpanded && d.remedy && d.remedy.length > 0 && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden relative z-10"
                          >
                            <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-forest-600/40 pl-13 sm:pl-16">
                              <p className="text-xs text-forest-300 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                <BookOpen size={14} className="text-amber-500/80"/>{t('remedyPlan')}
                              </p>
                              <ul className="space-y-2">
                                {(Array.isArray(d.remedy) ? d.remedy : (typeof d.remedy === 'string' && d.remedy.startsWith('[') ? JSON.parse(d.remedy) : [])).map((r, i) => (
                                  <li key={i} className="text-forest-100 text-sm leading-relaxed flex items-start gap-2.5">
                                    <span className="font-bold text-amber-500 min-w-5 h-5 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] mt-0.5">{i+1}</span>
                                    {getLocalized(r, lang)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {d.farmer_note && (
                              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-forest-600/40 pl-13 sm:pl-16">
                                <div className="rounded-xl p-3 sm:p-4 border border-amber-500/30 bg-amber-500/10">
                                  <p className="text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Sprout size={14} />
                                    {t('inSimpleWords')} 🌾
                                  </p>
                                  <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">{getLocalized(d.farmer_note, lang)}</p>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {!isExpanded && viewMode === 'personal' && d.remedy && d.remedy.length > 0 && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-forest-600/30 pl-13 sm:pl-16 opacity-80 group-hover:opacity-100 transition-opacity relative z-10">
                          <p className="text-[10px] text-forest-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                            <BookOpen size={10}/>{t('remedyPlan')}
                          </p>
                          <ul className="space-y-1">
                            {(Array.isArray(d.remedy) ? d.remedy : (typeof d.remedy === 'string' && d.remedy.startsWith('[') ? JSON.parse(d.remedy) : [])).slice(0,2).map((r, i) => (
                              <li key={i} className="text-forest-300 text-xs leading-relaxed flex items-start gap-2 truncate">
                                <span className="text-amber-600/70 mt-1 flex-shrink-0">•</span>
                                {getLocalized(r, lang)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )})}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 drop-shadow-md">
              <Lightbulb size={20} className="text-amber-400" />
              <h2 className="premium-text text-sm font-bold uppercase tracking-widest">
                {t('seasonalTips')}
              </h2>
            </div>

            <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 no-scrollbar snap-x snap-proximity">
              {farmingTips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-panel p-4 sm:p-5 rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/20 transition-all group relative overflow-hidden min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest-950/80 border border-forest-600/50 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <span className="text-base sm:text-lg">{tip.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-white text-sm sm:text-md font-bold leading-tight">{tip.title}</h4>
                      <span className="inline-block mt-1 text-amber-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                        {tip.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-forest-200 text-xs sm:text-sm leading-relaxed mt-2 sm:mt-3 relative z-10 font-normal">{tip.tip}</p>
                </motion.div>
              ))}
            </div>

            {/* Warning card */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-900/40 to-amber-900/10 border border-amber-500/30 backdrop-blur-md shadow-2xl mt-8">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-300 font-bold text-sm mb-1">{t('disclaimerTitle')}</h4>
                  <p className="text-amber-200/70 text-xs leading-relaxed">
                    {t('disclaimerText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
