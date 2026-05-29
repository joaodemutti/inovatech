'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '@/hooks/useAuth';
import type { UserPerfil } from '@/types/auth';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  allowedRoles?: UserPerfil[];
}

export function AppLayout({ children, title, subtitle, allowedRoles }: AppLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
          />
          <p className="text-slate-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const blocked = allowedRoles && !allowedRoles.includes(user.perfil);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {blocked ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-slate-700 font-semibold text-lg">Acesso Restrito</h3>
              <p className="text-slate-400 text-sm mt-1">Seu perfil não possui permissão para acessar esta área.</p>
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}
