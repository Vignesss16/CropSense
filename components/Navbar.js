'use client'

import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, LayoutDashboard, FlaskConical, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

import { useLanguage } from '@/lib/LanguageContext'

export default function Navbar({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { lang, changeLanguage, t } = useLanguage()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { href: '/diagnose', label: 'Diagnose Crop', id: 'diagnoseCrop', icon: FlaskConical },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-dark sticky top-0 z-50 border-b border-forest-600/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-forest-600/60 border border-forest-400/40 flex items-center justify-center group-hover:bg-forest-500/60 transition-colors">
              <Leaf size={16} className="text-amber-500" />
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">
              Nalam<span className="text-amber-500">Agri</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, id, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${pathname === href
                    ? 'bg-forest-600/60 text-white border border-forest-400/30'
                    : 'text-forest-200 hover:bg-forest-800/60 hover:text-white'
                  }`}
              >
                <Icon size={15} />
                {t(id)}
              </Link>
            ))}
          </div>

          {/* User + Language + Logout */}
          <div className="hidden md:flex items-center gap-4">
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-forest-900 border border-forest-600 rounded-md text-xs text-white px-2 py-1 outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
            </select>
            <div className="text-xs text-forest-300 truncate max-w-[140px]">
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-forest-300 hover:text-red-400 hover:bg-red-900/20 border border-transparent hover:border-red-800/40 transition-all"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-forest-300 hover:text-white hover:bg-forest-800/60 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute left-0 right-0 top-full glass-dark border-b border-forest-600/30 px-4 pb-4 pt-2 space-y-1 shadow-2xl z-50"
          >
            {navLinks.map(({ href, label, id, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${pathname === href
                    ? 'bg-forest-600/60 text-white'
                    : 'text-forest-200 hover:bg-forest-800/60 hover:text-white'
                  }`}
              >
                <Icon size={15} />
                {t(id)}
              </Link>
            ))}
            <div className="pt-3 pb-1 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                 <span className="text-xs text-forest-400">Language</span>
                 <select
                    value={lang}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="bg-forest-900 border border-forest-600 rounded-md text-xs text-white px-2 py-1 outline-none"
                 >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="ta">தமிழ்</option>
                 </select>
              </div>
              <div className="border-t border-forest-700/50 pt-2 flex items-center justify-between px-2">
                <span className="text-xs text-forest-400">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-2 py-1 rounded-md hover:bg-red-900/20"
                >
                  <LogOut size={14} />
                  {t('logout')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
