'use client';

import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();

  async function handleLogout() {
    try { await authService.logout(); } catch {}
    clearUser();
    router.push('/login');
    toast.success('Sessão encerrada');
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm shrink-0">
      <div>
        {title && <h1 className="text-lg font-semibold text-slate-800">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 w-52">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input placeholder="Buscar..." className="bg-transparent text-sm text-slate-600 outline-none w-full placeholder:text-slate-400" />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
            2
          </Badge>
        </Button>

        <div className="flex items-center gap-2 px-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs">
              {user?.nome?.charAt(0).toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-700 leading-none">{user?.nome}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.perfil}</p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-400 hover:bg-red-50 hover:text-red-500" title="Sair">
            <LogOut className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
