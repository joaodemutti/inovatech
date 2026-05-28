'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Download, X, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { financeiroService } from '@/services/financeiro.service';
import { pacientesService } from '@/services/pacientes.service';
import { excelService } from '@/services/excel.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Lancamento, LancamentoStatus } from '@/types/financeiro';

const schema = z.object({
  paciente_id: z.coerce.number().min(1, 'Selecione o paciente'),
  data: z.string().min(1, 'Data obrigatória'),
  servico: z.string().min(1, 'Serviço obrigatório'),
  valor: z.coerce.number().min(0.01, 'Valor obrigatório'),
  convenio: z.string().optional(),
  forma_pagamento: z.string().optional(),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function LancamentoModal({ lancamento, onClose }: { lancamento?: Lancamento; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!lancamento;

  const { data: pacientes = [] } = useQuery({ queryKey: ['pacientes'], queryFn: () => pacientesService.list().then((r) => r.data) });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: lancamento
      ? { paciente_id: lancamento.paciente_id, data: lancamento.data, servico: lancamento.servico, valor: lancamento.valor, convenio: lancamento.convenio ?? '', forma_pagamento: lancamento.forma_pagamento ?? '', observacao: lancamento.observacao ?? '' }
      : { data: new Date().toISOString().split('T')[0] },
  });

  const createMutation = useMutation({
    mutationFn: financeiroService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lancamentos'] }); qc.invalidateQueries({ queryKey: ['financeiro-indicadores'] }); toast.success('Lançamento criado!'); onClose(); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status?: LancamentoStatus; forma_pagamento?: string; observacao?: string; valor?: number }) =>
      financeiroService.update(lancamento!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lancamentos'] }); qc.invalidateQueries({ queryKey: ['financeiro-indicadores'] }); toast.success('Atualizado!'); onClose(); },
  });

  function onSubmit(data: FormData) {
    const clean = { ...data, convenio: data.convenio || undefined, forma_pagamento: data.forma_pagamento || undefined, observacao: data.observacao || undefined };
    if (isEdit) updateMutation.mutate(clean);
    else createMutation.mutate(clean);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-bold text-slate-800">{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Paciente <span className="text-red-500">*</span></label>
                <select {...register('paciente_id')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400">
                  <option value="">Selecione...</option>
                  {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                </select>
                {errors.paciente_id && <p className="text-red-500 text-xs mt-1">{errors.paciente_id.message}</p>}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data <span className="text-red-500">*</span></label>
              <input type="date" {...register('data')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valor (R$) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" {...register('valor')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Serviço <span className="text-red-500">*</span></label>
              <input {...register('servico')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
              {errors.servico && <p className="text-red-500 text-xs mt-1">{errors.servico.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Convênio</label>
              <input {...register('convenio')} placeholder="Particular, Unimed..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Forma de Pagamento</label>
              <select {...register('forma_pagamento')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400">
                <option value="">Selecione...</option>
                {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Transferência', 'Boleto'].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Observação</label>
              <textarea {...register('observacao')} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 resize-none" />
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

export default function FinanceiroPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<{ open: boolean; lancamento?: Lancamento }>({ open: false });
  const qc = useQueryClient();

  const { data: indicadores } = useQuery({
    queryKey: ['financeiro-indicadores'],
    queryFn: () => financeiroService.indicadores().then((r) => r.data),
  });

  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: ['lancamentos'],
    queryFn: () => financeiroService.list(0, 200).then((r) => r.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: LancamentoStatus }) =>
      financeiroService.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lancamentos'] });
      qc.invalidateQueries({ queryKey: ['financeiro-indicadores'] });
      toast.success('Status atualizado!');
    },
  });

  const filtered = useMemo(() =>
    lancamentos.filter((l) => !statusFilter || l.status === statusFilter),
    [lancamentos, statusFilter]
  );

  const pieData = indicadores
    ? [
        { name: 'Pago', value: indicadores.receita_paga, color: '#10b981' },
        { name: 'A Receber', value: indicadores.a_receber, color: '#3b82f6' },
        { name: 'Atrasado', value: indicadores.atrasado, color: '#ef4444' },
      ]
    : [];

  return (
    <AppLayout title="Financeiro" subtitle="Controle financeiro">
      <PageHeader
        title="Financeiro"
        subtitle="Receitas, despesas e indicadores"
        actions={
          <>
            <GradientButton variant="outline" onClick={() => excelService.export('financeiro')}><Download className="w-4 h-4" /> Exportar</GradientButton>
            <GradientButton onClick={() => setModal({ open: true })}><Plus className="w-4 h-4" /> Novo Lançamento</GradientButton>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Receita Paga" value={formatCurrency(indicadores?.receita_paga ?? 0)} icon={TrendingUp} gradient="from-emerald-500 to-teal-500" delay={0} />
        <StatCard title="A Receber" value={formatCurrency(indicadores?.a_receber ?? 0)} icon={DollarSign} gradient="from-blue-500 to-cyan-500" delay={0.1} />
        <StatCard title="Atrasado" value={formatCurrency(indicadores?.atrasado ?? 0)} icon={AlertTriangle} gradient="from-red-500 to-rose-500" delay={0.2} />
        <StatCard title="Total Lançado" value={formatCurrency(indicadores?.total_lancado ?? 0)} icon={TrendingDown} gradient="from-violet-500 to-purple-600" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Lançamentos</h3>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm outline-none text-slate-600">
              <option value="">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={DollarSign} title="Nenhum lançamento" />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filtered.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{l.servico}</p>
                    <p className="text-xs text-slate-400">{formatDate(l.data)} {l.convenio ? `· ${l.convenio}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-800">{formatCurrency(l.valor)}</span>
                    <select
                      value={l.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: l.id, status: e.target.value as LancamentoStatus })}
                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 outline-none bg-white"
                    >
                      <option value="pago">Pago</option>
                      <option value="pendente">Pendente</option>
                      <option value="atrasado">Atrasado</option>
                    </select>
                    <button onClick={() => setModal({ open: true, lancamento: l })} className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-slate-800 mb-4 self-start">Distribuição</h3>
          {indicadores && (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-col gap-2 mt-2 w-full">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-500">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {modal.open && <LancamentoModal lancamento={modal.lancamento} onClose={() => setModal({ open: false })} />}
      </AnimatePresence>
    </AppLayout>
  );
}
