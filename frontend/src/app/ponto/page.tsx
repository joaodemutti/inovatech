'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Download, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { pontoService } from '@/services/ponto.service';
import { usuariosService } from '@/services/usuarios.service';
import { excelService } from '@/services/excel.service';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';

const schema = z.object({
  usuario_id: z.coerce.number().min(1, 'Usuário obrigatório'),
  data: z.string().min(1, 'Data obrigatória'),
  entrada: z.string().optional(),
  saida: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PontoPage() {
  const user = useAuthStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const qc = useQueryClient();

  const { data: totais } = useQuery({
    queryKey: ['ponto-totais', dataInicio, dataFim],
    queryFn: () => pontoService.totais({ data_inicio: dataInicio || undefined, data_fim: dataFim || undefined }).then((r) => r.data),
  });

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['ponto-registros', dataInicio, dataFim],
    queryFn: () => pontoService.list({ data_inicio: dataInicio || undefined, data_fim: dataFim || undefined, limit: 100 }).then((r) => r.data),
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosService.list().then((r) => r.data),
    enabled: user?.perfil === 'gestor',
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { data: new Date().toISOString().split('T')[0], usuario_id: user?.id },
  });

  const createMutation = useMutation({
    mutationFn: pontoService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ponto-registros'] });
      qc.invalidateQueries({ queryKey: ['ponto-totais'] });
      toast.success('Registro criado!');
      setShowModal(false);
      reset();
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  function onSubmit(data: FormData) {
    createMutation.mutate({
      ...data,
      entrada: data.entrada || undefined,
      saida: data.saida || undefined,
    });
  }

  return (
    <AppLayout title="Ponto" subtitle="Controle de jornada">
      <PageHeader
        title="Controle de Ponto"
        subtitle="Registros de jornada de trabalho"
        actions={
          <>
            <GradientButton variant="outline" onClick={() => excelService.export('ponto')}><Download className="w-4 h-4" /> Exportar</GradientButton>
            <GradientButton onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Registrar</GradientButton>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="H. Trabalhadas" value={`${totais?.total_horas_trabalhadas?.toFixed(1) ?? 0}h`} icon={Clock} gradient="from-blue-500 to-cyan-500" delay={0} />
        <StatCard title="Faltas" value={totais?.faltas ?? 0} icon={X} gradient="from-red-500 to-rose-500" delay={0.1} />
        <StatCard title="Atrasos" value={totais?.atrasos ?? 0} icon={Clock} gradient="from-amber-500 to-orange-500" delay={0.2} />
        <StatCard title="H. Extras" value={totais?.horas_extras ?? 0} icon={Clock} gradient="from-emerald-500 to-teal-500" delay={0.3} />
      </div>

      {/* Date filters */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <label className="text-xs text-slate-500 block mb-1">De</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Até</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : registros.length === 0 ? (
          <EmptyState icon={Clock} title="Nenhum registro encontrado" description="Registre ponto usando o botão acima." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Usuário', 'Data', 'Entrada', 'Saída', 'H. Trab.', 'H. Esp.', 'Diferença', 'Situação'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registros.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700">Usuário #{r.usuario_id}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(r.data)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 font-mono">{r.entrada ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 font-mono">{r.saida ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{r.h_trabalhadas != null ? `${r.h_trabalhadas}h` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.h_esperadas}h</td>
                    <td className="px-4 py-3 text-sm">
                      {r.diferenca != null ? (
                        <span className={r.diferenca >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {r.diferenca >= 0 ? '+' : ''}{r.diferenca}h
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">{r.situacao ? <StatusBadge status={r.situacao} /> : '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-bold text-slate-800">Registrar Ponto</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {user?.perfil === 'gestor' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Usuário <span className="text-red-500">*</span></label>
                  <select {...register('usuario_id')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400">
                    <option value="">Selecione...</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                  {errors.usuario_id && <p className="text-red-500 text-xs mt-1">{errors.usuario_id.message}</p>}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Data <span className="text-red-500">*</span></label>
                <input type="date" {...register('data')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Entrada</label>
                  <input type="time" {...register('entrada')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Saída</label>
                  <input type="time" {...register('saida')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Cancelar</button>
                <GradientButton type="submit" loading={createMutation.isPending} className="flex-1 justify-center">Registrar</GradientButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
}
