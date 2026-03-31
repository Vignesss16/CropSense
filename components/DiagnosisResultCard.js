'use client'

import { motion } from 'framer-motion'
import SeverityBadge from './SeverityBadge'
import { Stethoscope, Zap, CheckCircle2, Sprout } from 'lucide-react'

export default function DiagnosisResultCard({ result, showSaveButton, onSave, saving }) {
  if (!result) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Main Result Card */}
      <div className="glass rounded-2xl p-6 border border-forest-400/25 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-700/60 border border-forest-500/30 flex items-center justify-center flex-shrink-0">
              <Stethoscope size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-forest-300 uppercase tracking-widest font-medium mb-0.5">
                Diagnosis Result
              </p>
              <h3 className="text-white font-display text-lg font-bold leading-tight">
                {result.disease}
              </h3>
            </div>
          </div>
          <SeverityBadge severity={result.severity} size="md" />
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-forest-600/0 via-forest-500/40 to-forest-600/0" />

        {/* Cause */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-900/30 border border-amber-700/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap size={14} className="text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-forest-300 uppercase tracking-widest font-medium mb-1">Cause</p>
            <p className="text-forest-100 text-sm leading-relaxed">{result.cause}</p>
          </div>
        </div>

        {/* Remedy */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest-700/50 border border-forest-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 size={14} className="text-forest-300" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-forest-300 uppercase tracking-widest font-medium mb-2">Recommended Remedy</p>
            <ol className="space-y-2">
              {result.remedy?.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-forest-100 leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-forest-600/60 border border-forest-400/30 flex items-center justify-center text-xs text-amber-400 font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Farmer Note — "In Simple Words" sticky note */}
      {result.farmer_note && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="relative rounded-2xl p-5 border border-amber-500/30 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(245,166,35,0.1) 0%, rgba(250,209,128,0.07) 100%)',
          }}
        >
          {/* Corner fold effect */}
          <div
            className="absolute top-0 right-0 w-0 h-0"
            style={{
              borderStyle: 'solid',
              borderWidth: '0 28px 28px 0',
              borderColor: 'transparent rgba(245,166,35,0.25) transparent transparent',
            }}
          />
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Sprout size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                In Simple Words 🌾
              </p>
              <p className="text-amber-100 text-sm leading-relaxed">{result.farmer_note}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      {showSaveButton && onSave && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onSave}
          disabled={saving}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all
            bg-forest-600 hover:bg-forest-500 text-white border border-forest-400/40
            hover:border-forest-300/50 hover:shadow-lg hover:shadow-forest-900/50
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Saving to Farm Log...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Save to Farm Log
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  )
}
