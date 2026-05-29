'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, FileText, CheckCircle, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExcelActions } from '@/components/shared/ExcelActions';
import { prontuariosService } from '@/services/prontuarios.service';
import { pacientesService } from '@/services/pacientes.service';
import { medicosService } from '@/services/medicos.service';
import { useAuthStore } from '@/stores/auth.store';
import { useRole } from '@/hooks/useRole';
import { formatDate } from '@/lib/utils';
import type { Prontuario } from '@/types/prontuario';

const schema = z.object({
  paciente_id: z.coerce.number().min(1),
  medico_id: z.coerce.number().optional(),
  data: z.string().min(1),
  cid: z.string().min(1, 'CID obrigatório'),
  diagnostico: z.string().min(5),
  prescricao: z.string().min(5),
  retorno_em_dias: z.coerce.number().min(0).default(0),
});

type FormData = z.infer<typeof schema>;

function ProntuarioDialog({ prontuario, open, onClose }: { prontuario?: Prontuario; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const isEdit = !!prontuario;
  const canEdit = user?.perfil === 'medico';

  const { data: pacientes = [] } = useQuery({ queryKey: ['pacientes'], queryFn: () => pacientesService.list().then(r => r.data), enabled: user?.perfil === 'gestor' });
  const { data: medicos = [] } = useQuery({ queryKey: ['medicos'], queryFn: () => medicosService.list().then(r => r.data), enabled: user?.perfil === 'gestor' });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: prontuario
      ? { paciente_id: prontuario.paciente_id, medico_id: prontuario.medico_id, data: prontuario.data, cid: prontuario.cid, diagnostico: prontuario.diagnostico, prescricao: prontuario.prescricao, retorno_em_dias: prontuario.retorno_em_dias }
      : { data: new Date().toISOString().split('T')[0], retorno_em_dias: 0 },
  });

  const createMutation = useMutation({
    mutationFn: prontuariosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prontuarios'] }); toast.success('Criado!'); onClose(); reset(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao criar prontuário'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: FormData) => prontuariosService.update(prontuario!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prontuarios'] }); toast.success('Salvo!'); onClose(); },
  });

  const liberarMutation = useMutation({
    mutationFn: () => prontuariosService.liberarLaudo(prontuario!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prontuarios'] }); toast.success('Laudo liberado!'); onClose(); },
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormData) {
    if (!isEdit && user?.perfil === 'gestor' && !data.medico_id) {
      toast.error('Selecione um médico');
      return;
    }
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Prontuário' : 'Novo Prontuário'}</DialogTitle>
              {isEdit && prontuario.laudo_liberado && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" /> Laudo Liberado
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <>
                {user?.perfil === 'gestor' ? (
                  <div className="space-y-1.5">
                    <Label>Paciente <span className="text-red-500">*</span></Label>
                    <select {...register('paciente_id')} className={`h-9 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 ${errors.paciente_id ? 'border-red-300' : 'border-slate-200'}`}>
                      <option value="">Selecione...</option>
                      {pacientes.filter(p => p.status === 'ativo').map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label>ID do Paciente <span className="text-red-500">*</span></Label>
                    <Input type="number" {...register('paciente_id')} className={errors.paciente_id ? 'border-red-300' : ''} />
                  </div>
                )}
                {user?.perfil === 'gestor' && (
                <div className="space-y-1.5">
                  <Label>Médico <span className="text-red-500">*</span></Label>
                  <select {...register('medico_id')} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400">
                    <option value="">Selecione...</option>
                    {medicos.filter(m => m.status === 'ativo').map(m => <option key={m.id} value={m.id}>Dr(a). {m.nome_completo}</option>)}
                  </select>
                </div>
                )}
              </>
            )}
            <div className="space-y-1.5">
              <Label>Data <span className="text-red-500">*</span></Label>
              <Input type="date" {...register('data')} disabled={isEdit && !canEdit} />
            </div>
            <div className="space-y-1.5">
              <Label>CID <span className="text-red-500">*</span></Label>
              <Input {...register('cid')} placeholder="Ex: J00, M54.5" disabled={isEdit && !canEdit} className={errors.cid ? 'border-red-300' : ''} />
              {errors.cid && <p className="text-xs text-red-500">{errors.cid.message}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Diagnóstico <span className="text-red-500">*</span></Label>
              <textarea {...register('diagnostico')} rows={3} disabled={isEdit && !canEdit}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 ${errors.diagnostico ? 'border-red-300' : 'border-slate-200'}`} />
              {errors.diagnostico && <p className="text-xs text-red-500">{errors.diagnostico.message}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Prescrição <span className="text-red-500">*</span></Label>
              <textarea {...register('prescricao')} rows={3} disabled={isEdit && !canEdit}
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none focus:ring-2 focus:ring-purple-400 disabled:bg-slate-50 ${errors.prescricao ? 'border-red-300' : 'border-slate-200'}`} />
            </div>
            <div className="space-y-1.5">
              <Label>Retorno em (dias)</Label>
              <Input type="number" {...register('retorno_em_dias')} disabled={isEdit && !canEdit} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
            {canEdit && isEdit && !prontuario.laudo_liberado && (
              <Button type="button" variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={() => liberarMutation.mutate()}>
                <CheckCircle className="w-4 h-4" /> Liberar Laudo
              </Button>
            )}
            {(canEdit || !isEdit) && (
              <GradientButton type="submit" loading={loading}>{isEdit ? 'Salvar' : 'Criar'}</GradientButton>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProntuariosPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; prontuario?: Prontuario }>({ open: false });
  const user = useAuthStore(s => s.user);
  const { can, isGestor } = useRole();
  const canRead = can('gestor', 'medico');

  const { data: prontuarios = [], isLoading } = useQuery({
    queryKey: ['prontuarios'],
    queryFn: () => prontuariosService.list().then(r => r.data),
    enabled: canRead,
  });

  const { data: pacientes = [] } = useQuery({ queryKey: ['pacientes'], queryFn: () => pacientesService.list().then(r => r.data), enabled: isGestor });
  const { data: medicos = [] } = useQuery({ queryKey: ['medicos'], queryFn: () => medicosService.list().then(r => r.data), enabled: isGestor });

  const pacienteMap = useMemo(() => new Map(pacientes.map(p => [p.id, p.nome_completo])), [pacientes]);
  const medicoMap = useMemo(() => new Map(medicos.map(m => [m.id, m.nome_completo])), [medicos]);

  const filtered = useMemo(() =>
    prontuarios.filter(p => {
      const nome = pacienteMap.get(p.paciente_id) ?? '';
      return !search
        || nome.toLowerCase().includes(search.toLowerCase())
        || p.cid.toLowerCase().includes(search.toLowerCase())
        || String(p.paciente_id).includes(search);
    }),
    [prontuarios, search, pacienteMap]
  );

  return (
    <AppLayout title="Prontuários" subtitle="Histórico médico" allowedRoles={['gestor', 'medico']}>
      <PageHeader
        title="Prontuários"
        subtitle={`${prontuarios.length} registros`}
        actions={
          <>
            {isGestor && (
              <ExcelActions module="prontuarios" onImported={() => qc.invalidateQueries({ queryKey: ['prontuarios'] })} />
            )}
            {user?.perfil === 'medico' && (
              <GradientButton onClick={() => setDialog({ open: true })}><Plus className="w-4 h-4" /> Novo Prontuário</GradientButton>
            )}
          </>
        }
      />

      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 mb-6 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input placeholder="Buscar por paciente ou CID..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400 text-slate-700" />
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhum prontuário encontrado" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>{['Paciente', 'Médico', 'Data', 'CID', 'Retorno', 'Laudo', ''].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <TableCell className="font-medium text-slate-700">{pacienteMap.get(p.paciente_id) ?? `#${p.paciente_id}`}</TableCell>
                  <TableCell className="text-slate-500">{medicoMap.get(p.medico_id) ? `Dr(a). ${medicoMap.get(p.medico_id)}` : `#${p.medico_id}`}</TableCell>
                  <TableCell className="text-slate-500">{formatDate(p.data)}</TableCell>
                  <TableCell><Badge variant="secondary" className="font-mono">{p.cid}</Badge></TableCell>
                  <TableCell className="text-slate-500">{p.retorno_em_dias > 0 ? `${p.retorno_em_dias} dias` : '—'}</TableCell>
                  <TableCell>
                    {p.laudo_liberado
                      ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /> Liberado</span>
                      : <span className="text-xs text-slate-400">Pendente</span>}
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-600 hover:bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDialog({ open: true, prontuario: p })}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ProntuarioDialog key={dialog.prontuario?.id ?? 'new'} open={dialog.open} prontuario={dialog.prontuario} onClose={() => setDialog({ open: false })} />
    </AppLayout>
  );
}
