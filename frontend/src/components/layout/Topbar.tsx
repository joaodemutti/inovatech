'use client';

import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {}
    clearUser();
    router.push('/login');
    toast.success('Sessão encerrada');
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm shrink-0">
      {/* Left: title */}
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 w-56">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            placeholder="Buscar..."
            className="bg-transparent text-sm text-slate-600 outline-none w-full placeholder:text-slate-400"
          />
        </div>

        {/* Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600" />
        </motion.button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
          >
            {user?.nome?.charAt(0).toUpperCase() ?? <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-700 leading-none">{user?.nome}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.perfil}</p>
          </div>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-colors"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
}
