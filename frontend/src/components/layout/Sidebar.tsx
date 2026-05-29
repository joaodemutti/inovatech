'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['gestor', 'recepcionista', 'medico'] },
  { href: '/pacientes', label: 'Pacientes', icon: Users, roles: ['gestor', 'recepcionista', 'medico'] },
  { href: '/medicos', label: 'Médicos', icon: Stethoscope, roles: ['gestor', 'recepcionista'] },
  { href: '/consultas', label: 'Consultas', icon: Calendar, roles: ['gestor', 'recepcionista', 'medico'] },
  { href: '/prontuarios', label: 'Prontuários', icon: FileText, roles: ['gestor', 'medico'] },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign, roles: ['gestor'] },
  { href: '/ponto', label: 'Ponto', icon: Clock, roles: ['gestor', 'recepcionista', 'medico'] },
  { href: '/admin', label: 'Administração', icon: Shield, roles: ['gestor'] },
  { href: '/portal', label: 'Portal Paciente', icon: Activity, roles: ['paciente'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const visible = navItems.filter(
    (item) => !user || item.roles.includes(user.perfil)
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen shrink-0"
      style={{
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #1e3a8a 100%)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
        >
          <Activity className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-white font-bold text-base leading-tight">INOVATECH</p>
              <p className="text-indigo-300 text-xs">Clínica Vida Plena</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4, backgroundColor: 'rgba(255,255,255,0.12)' }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors',
                  active
                    ? 'bg-white/15 shadow-lg'
                    : 'text-indigo-200 hover:text-white'
                )}
              >
                <div className="relative">
                  <item.icon
                    className={cn('w-5 h-5 shrink-0', active ? 'text-white' : 'text-indigo-300')}
                  />
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full"
                      style={{ background: 'linear-gradient(to bottom, #a855f7, #3b82f6)' }}
                    />
                  )}
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'text-sm font-medium whitespace-nowrap',
                        active ? 'text-white' : 'text-indigo-200'
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center bg-indigo-600 border border-indigo-400 text-white hover:bg-indigo-500 transition-colors z-50 shadow-lg"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* User info at bottom */}
      {user && (
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <p className="text-white text-xs font-medium truncate">{user.nome}</p>
                  <p className="text-indigo-300 text-xs capitalize">{user.perfil}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
