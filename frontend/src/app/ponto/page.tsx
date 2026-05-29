'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ExcelActions } from '@/components/shared/ExcelActions';
import { pontoService } from '@/services/ponto.service';
import { usuariosService } from '@/services/usuarios.service';
import { useAuthStore } from '@/stores/auth.store';
import { useRole } from '@/hooks/useRole';
import { formatDate } from '@/lib/utils';

const schema = z.object({
  usuario_id: z.coerce.number().min(1),
  data: z.string().min(1),
  entrada: z.string().optional(),
  saida: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function PontoPage() {
  const user = useAuthStore(s => s.user);
  const { can, isGestor } = useRole();
  const canUsePonto = can('gestor', 'recepcionista', 'medico');
  const [open, setOpen] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const qc = useQueryClient();

  const { data: totais } = useQuery({
    queryKey: ['ponto-totais', dataInicio, dataFim],
    queryFn: () => pontoService.totais({ data_inicio: dataInicio || undefined, data_fim: dataFim || undefined }).then(r => r.data),
    enabled: canUsePonto,
  });

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['ponto-registros', dataInicio, dataFim],
    queryFn: () => pontoService.list({ data_inicio: dataInicio || undefined, data_fim: dataFim || undefined, limit: 100 }).then(r => r.data),
    enabled: canUsePonto,
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosService.list().then(r => r.data),
    enabled: user?.perfil === 'gestor',
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { data: new Date().toISOString().split('T')[0], usuario_id: user?.id },
  });

  const createMutation = useMutation({
    mutationFn: pontoService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ponto-registros'] }); qc.invalidateQueries({ queryKey: ['ponto-totais'] }); toast.success('Registrado!'); setOpen(false); reset(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  function onSubmit(data: FormData) {
    if (!user) return;
    createMutation.mutate({
      ...data,
      usuario_id: isGestor ? data.usuario_id : user.id,
      entrada: data.entrada || undefined,
      saida: data.saida || undefined,
    });
  }

  return (
    <AppLayout title="Ponto" subtitle="Controle de jornada" allowedRoles={['gestor', 'recepcionista', 'medico']}>
      <PageHeader
        title="Controle de Ponto"
        subtitle="Registros de jornada de trabalho"
        actions={
          <>
            {isGestor && <ExcelActions module="ponto" onImported={() => {
              qc.invalidateQueries({ queryKey: ['ponto-registros'] });
              qc.invalidateQueries({ queryKey: ['ponto-totais'] });
            }} />}
            <GradientButton onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Registrar</GradientButton>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="H. Trabalhadas" value={`${Number(totais?.total_horas_trabalhadas ?? 0).toFixed(1)}h`} icon={Clock} gradient="from-blue-500 to-cyan-500" delay={0} />
        <StatCard title="Faltas" value={totais?.faltas ?? 0} icon={X} gradient="from-red-500 to-rose-500" delay={0.1} />
        <StatCard title="Atrasos" value={totais?.atrasos ?? 0} icon={Clock} gradient="from-amber-500 to-orange-500" delay={0.2} />
        <StatCard title="H. Extras" value={totais?.horas_extras ?? 0} icon={Clock} gradient="from-emerald-500 to-teal-500" delay={0.3} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="space-y-1">
          <Label>De</Label>
          <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1">
          <Label>Até</Label>
          <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="w-40" />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : registros.length === 0 ? (
          <EmptyState icon={Clock} title="Nenhum registro encontrado" description="Registre ponto usando o botão acima." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>{['Usuário', 'Data', 'Entrada', 'Saída', 'H. Trab.', 'H. Esp.', 'Diferença', 'Situação'].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                  <TableCell className="text-slate-700">Usuário #{r.usuario_id}</TableCell>
                  <TableCell className="text-slate-500">{formatDate(r.data)}</TableCell>
                  <TableCell className="font-mono text-slate-700">{r.entrada ?? '—'}</TableCell>
                  <TableCell className="font-mono text-slate-700">{r.saida ?? '—'}</TableCell>
                  <TableCell className="text-slate-700">{r.h_trabalhadas != null ? `${r.h_trabalhadas}h` : '—'}</TableCell>
                  <TableCell className="text-slate-500">{r.h_esperadas}h</TableCell>
                  <TableCell>{r.diferenca != null ? <span className={Number(r.diferenca) >= 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{Number(r.diferenca) >= 0 ? '+' : ''}{r.diferenca}h</span> : '—'}</TableCell>
                  <TableCell>{r.situacao ? <StatusBadge status={r.situacao} /> : '—'}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
                <Clock className="w-5 h-5 text-white" />
              </div>
              <DialogTitle>Registrar Ponto</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {user?.perfil === 'gestor' && (
              <div className="space-y-1.5">
                <Label>Usuário <span className="text-red-500">*</span></Label>
                <select {...register('usuario_id')} className={`h-9 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 ${errors.usuario_id ? 'border-red-300' : 'border-slate-200'}`}>
                  <option value="">Selecione...</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Data <span className="text-red-500">*</span></Label>
              <Input type="date" {...register('data')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Entrada</Label>
                <Input type="time" {...register('entrada')} />
              </div>
              <div className="space-y-1.5">
                <Label>Saída</Label>
                <Input type="time" {...register('saida')} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <GradientButton type="submit" loading={createMutation.isPending}>Registrar</GradientButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
