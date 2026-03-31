'use client'

import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Leaf, LayoutDashboard, FlaskConical, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/diagnose', label: 'Diagnose Crop', icon: FlaskConical },
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
              Crop<span className="text-amber-500">Sense</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
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
                {label}
              </Link>
            ))}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-xs text-forest-300 truncate max-w-[160px]">
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
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-forest-600/30 px-4 pb-4 pt-2 space-y-1"
        >
          {navLinks.map(({ href, label, icon: Icon }) => (
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
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-forest-700/50 flex items-center justify-between">
            <span className="text-xs text-forest-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
