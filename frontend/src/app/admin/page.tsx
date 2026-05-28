'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Users, Plus, X, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { usuariosService } from '@/services/usuarios.service';
import { adminService } from '@/services/admin.service';
import { formatDateTime } from '@/lib/utils';
import type { Usuario } from '@/types/usuario';

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  login: z.string().min(3, 'Login obrigatório'),
  email: z.string().email('Email inválido'),
  perfil: z.enum(['gestor', 'recepcionista', 'medico', 'paciente']),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

function UsuarioModal({ usuario, onClose }: { usuario?: Usuario; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!usuario;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: usuario
      ? { nome: usuario.nome, login: usuario.login, email: usuario.email, perfil: usuario.perfil }
      : { perfil: 'recepcionista' },
  });

  const createMutation = useMutation({
    mutationFn: usuariosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); toast.success('Usuário criado!'); onClose(); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao criar'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => usuariosService.update(usuario!.id, { ...data, password: data.password || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); toast.success('Usuário atualizado!'); onClose(); },
  });

  function onSubmit(data: FormData) {
    const clean = { ...data, password: data.password || undefined };
    if (isEdit) updateMutation.mutate(clean);
    else {
      if (!clean.password) { toast.error('Senha obrigatória'); return; }
      createMutation.mutate(clean as Parameters<typeof usuariosService.create>[0]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-bold text-slate-800">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nome <span className="text-red-500">*</span></label>
              <input {...register('nome')} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${errors.nome ? 'border-red-300' : 'border-slate-200 focus:border-purple-400'}`} />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Login <span className="text-red-500">*</span></label>
              <input {...register('login')} disabled={isEdit} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 disabled:bg-slate-50" />
              {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Perfil <span className="text-red-500">*</span></label>
              <select {...register('perfil')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400">
                <option value="gestor">Gestor</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="medico">Médico</option>
                <option value="paciente">Paciente</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" {...register('email')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Senha {!isEdit && <span className="text-red-500">*</span>} {isEdit && <span className="text-slate-400">(deixe em branco para manter)</span>}</label>
              <input type="password" {...register('password')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
            <GradientButton type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1 justify-center">{isEdit ? 'Salvar' : 'Criar'}</GradientButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<'usuarios' | 'auditoria'>('usuarios');
  const [modal, setModal] = useState<{ open: boolean; usuario?: Usuario }>({ open: false });
  const [modulo, setModulo] = useState('');
  const [resultado, setResultado] = useState('');

  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosService.list().then((r) => r.data),
  });

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['logs', modulo, resultado],
    queryFn: () => adminService.logs({ modulo: modulo || undefined, resultado: resultado || undefined, limit: 100 }).then((r) => r.data),
    enabled: tab === 'auditoria',
  });

  return (
    <AppLayout title="Administração" subtitle="Usuários e auditoria">
      <PageHeader title="Administração" subtitle="Gestão de usuários e logs do sistema" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {(['usuarios', 'auditoria'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'usuarios' ? 'Usuários' : 'Log de Auditoria'}
          </button>
        ))}
      </div>

      {tab === 'usuarios' && (
        <>
          <div className="flex justify-end mb-4">
            <GradientButton onClick={() => setModal({ open: true })}><Plus className="w-4 h-4" /> Novo Usuário</GradientButton>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loadingUsuarios ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : usuarios.length === 0 ? (
              <EmptyState icon={Users} title="Nenhum usuário" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Nome', 'Login', 'Email', 'Perfil', 'Status', 'Último Acesso', 'Ações'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usuarios.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>{u.nome.charAt(0)}</div>
                            <span className="text-sm font-medium text-slate-700">{u.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono">{u.login}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize">{u.perfil}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                        <td className="px-4 py-3 text-xs text-slate-400">{u.ultimo_acesso ? formatDateTime(u.ultimo_acesso) : '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setModal({ open: true, usuario: u })} className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 opacity-0 group-hover:opacity-100 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}

      {tab === 'auditoria' && (
        <>
          <div className="flex gap-3 mb-4">
            <input placeholder="Filtrar módulo..." value={modulo} onChange={(e) => setModulo(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 bg-white" />
            <select value={resultado} onChange={(e) => setResultado(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-white text-slate-700">
              <option value="">Todos resultados</option>
              <option value="sucesso">Sucesso</option>
              <option value="falha">Falha</option>
            </select>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loadingLogs ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : logs.length === 0 ? (
              <EmptyState icon={Shield} title="Nenhum log encontrado" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Data/Hora', 'Usuário', 'Ação', 'Módulo', 'IP', 'Resultado'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((l, i) => (
                      <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{formatDateTime(l.data_hora)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">#{l.usuario_id ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{l.acao}</td>
                        <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{l.modulo}</span></td>
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{l.ip ?? '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={l.resultado} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {modal.open && <UsuarioModal usuario={modal.usuario} onClose={() => setModal({ open: false })} />}
      </AnimatePresence>
    </AppLayout>
  );
}
