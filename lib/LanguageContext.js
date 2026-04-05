'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '@/utils/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  // Load language from local storage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('cropsense_lang')
    if (savedLang && translations[savedLang]) {
      setLang(savedLang)
    }
  }, [])

  const changeLanguage = (newLang) => {
    setLang(newLang)
    localStorage.setItem('cropsense_lang', newLang)
  }

  const t = (key) => {
    const keys = key.split('.')
    let result = translations[lang]
    let fallbackResult = translations['en']
    
    for (const k of keys) {
      if (result) result = result[k]
      if (fallbackResult) fallbackResult = fallbackResult[k]
    }
    
    return result || fallbackResult || key
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
