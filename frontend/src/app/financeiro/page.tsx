'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExcelActions } from '@/components/shared/ExcelActions';
import { financeiroService } from '@/services/financeiro.service';
import { useRole } from '@/hooks/useRole';
import { pacientesService } from '@/services/pacientes.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Lancamento, LancamentoStatus } from '@/types/financeiro';

const schema = z.object({
  paciente_id: z.coerce.number().min(1, 'Selecione o paciente'),
  data: z.string().min(1),
  servico: z.string().min(1),
  valor: z.coerce.number().min(0.01),
  convenio: z.string().optional(),
  forma_pagamento: z.string().optional(),
  observacao: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function LancamentoDialog({ lancamento, open, onClose }: { lancamento?: Lancamento; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!lancamento;
  const { data: pacientes = [] } = useQuery({ queryKey: ['pacientes'], queryFn: () => pacientesService.list().then(r => r.data) });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: lancamento
      ? { paciente_id: lancamento.paciente_id, data: lancamento.data, servico: lancamento.servico, valor: lancamento.valor, convenio: lancamento.convenio ?? '', forma_pagamento: lancamento.forma_pagamento ?? '', observacao: lancamento.observacao ?? '' }
      : { data: new Date().toISOString().split('T')[0] },
  });

  const createMutation = useMutation({
    mutationFn: financeiroService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lancamentos'] }); qc.invalidateQueries({ queryKey: ['financeiro-indicadores'] }); toast.success('Criado!'); onClose(); reset(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: Partial<FormData>) => financeiroService.update(lancamento!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lancamentos'] }); qc.invalidateQueries({ queryKey: ['financeiro-indicadores'] }); toast.success('Atualizado!'); onClose(); },
  });

  function onSubmit(data: FormData) {
    const clean = { ...data, convenio: data.convenio || undefined, forma_pagamento: data.forma_pagamento || undefined, observacao: data.observacao || undefined };
    if (isEdit) updateMutation.mutate(clean);
    else createMutation.mutate(clean);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <DialogTitle>{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <div className="col-span-2 space-y-1.5">
                <Label>Paciente <span className="text-red-500">*</span></Label>
                <select {...register('paciente_id')} className={`h-9 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 ${errors.paciente_id ? 'border-red-300' : 'border-slate-200'}`}>
                  <option value="">Selecione...</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Data <span className="text-red-500">*</span></Label>
              <Input type="date" {...register('data')} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$) <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.01" {...register('valor')} className={errors.valor ? 'border-red-300' : ''} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Serviço <span className="text-red-500">*</span></Label>
              <Input {...register('servico')} className={errors.servico ? 'border-red-300' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label>Convênio</Label>
              <Input {...register('convenio')} placeholder="Particular, Unimed..." />
            </div>
            <div className="space-y-1.5">
              <Label>Forma de Pagamento</Label>
              <select {...register('forma_pagamento')} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400">
                <option value="">Selecione...</option>
                {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Transferência', 'Boleto'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observação</Label>
              <textarea {...register('observacao')} rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none resize-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <GradientButton type="submit" loading={createMutation.isPending || updateMutation.isPending}>{isEdit ? 'Salvar' : 'Criar'}</GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FinanceiroPage() {
  const { isGestor } = useRole();
  const [statusFilter, setStatusFilter] = useState('');

  const [dialog, setDialog] = useState<{ open: boolean; lancamento?: Lancamento }>({ open: false });
  const qc = useQueryClient();

  const { data: indicadores } = useQuery({ queryKey: ['financeiro-indicadores'], queryFn: () => financeiroService.indicadores().then(r => r.data), enabled: isGestor });
  const { data: lancamentos = [], isLoading } = useQuery({ queryKey: ['lancamentos'], queryFn: () => financeiroService.list(0, 200).then(r => r.data), enabled: isGestor });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: LancamentoStatus }) => financeiroService.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lancamentos'] }); qc.invalidateQueries({ queryKey: ['financeiro-indicadores'] }); toast.success('Status atualizado!'); },
  });

  const filtered = useMemo(() => lancamentos.filter(l => !statusFilter || l.status === statusFilter), [lancamentos, statusFilter]);

  const pieData = indicadores ? [
    { name: 'Pago', value: indicadores.receita_paga, color: '#10b981' },
    { name: 'A Receber', value: indicadores.a_receber, color: '#3b82f6' },
    { name: 'Atrasado', value: indicadores.atrasado, color: '#ef4444' },
  ] : [];

  return (
    <AppLayout title="Financeiro" subtitle="Controle financeiro" allowedRoles={['gestor']}>
      <PageHeader
        title="Financeiro"
        subtitle="Receitas, despesas e indicadores"
        actions={
          <>
            <ExcelActions module="financeiro" onImported={() => {
              qc.invalidateQueries({ queryKey: ['lancamentos'] });
              qc.invalidateQueries({ queryKey: ['financeiro-indicadores'] });
            }} />
            <GradientButton onClick={() => setDialog({ open: true })}><Plus className="w-4 h-4" /> Novo Lançamento</GradientButton>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Receita Paga" value={formatCurrency(indicadores?.receita_paga ?? 0)} icon={TrendingUp} gradient="from-emerald-500 to-teal-500" delay={0} />
        <StatCard title="A Receber" value={formatCurrency(indicadores?.a_receber ?? 0)} icon={DollarSign} gradient="from-blue-500 to-cyan-500" delay={0.1} />
        <StatCard title="Atrasado" value={formatCurrency(indicadores?.atrasado ?? 0)} icon={AlertTriangle} gradient="from-red-500 to-rose-500" delay={0.2} />
        <StatCard title="Total Lançado" value={formatCurrency(indicadores?.total_lancado ?? 0)} icon={TrendingDown} gradient="from-violet-500 to-purple-600" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Lançamentos</CardTitle>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 px-2 text-xs outline-none bg-white text-slate-600">
                <option value="">Todos</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={DollarSign} title="Nenhum lançamento" />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filtered.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{l.servico}</p>
                      <p className="text-xs text-slate-400">{formatDate(l.data)}{l.convenio ? ` · ${l.convenio}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-800">{formatCurrency(l.valor)}</span>
                      <select value={l.status} onChange={e => updateStatusMutation.mutate({ id: l.id, status: e.target.value as LancamentoStatus })} className="text-xs px-2 py-1 rounded-lg border border-slate-200 outline-none bg-white">
                        <option value="pago">Pago</option>
                        <option value="pendente">Pendente</option>
                        <option value="atrasado">Atrasado</option>
                      </select>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDialog({ open: true, lancamento: l })}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribuição</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center pt-0">
            {indicadores && (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-col gap-2 mt-2 w-full">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-xs text-slate-500">{d.name}</span></div>
                  <span className="text-xs font-semibold text-slate-700">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <LancamentoDialog key={dialog.lancamento?.id ?? 'new'} open={dialog.open} lancamento={dialog.lancamento} onClose={() => setDialog({ open: false })} />
    </AppLayout>
  );
}
