'use client'

import { getSeverityConfig } from '@/utils/cropAI'
import { useLanguage } from '@/lib/LanguageContext'

export default function SeverityBadge({ severity, size = 'md' }) {
  const config = getSeverityConfig(severity)
  const { t } = useLanguage()

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border
        ${config.bg} ${config.color} ${config.border} ${sizeClasses[size]}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {config.emoji} {severity ? t(`severity.${severity.toLowerCase()}`) : config.label}
    </span>
  )
}
