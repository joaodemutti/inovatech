'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Download, Stethoscope, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { medicosService } from '@/services/medicos.service';
import { excelService } from '@/services/excel.service';
import { formatCPF } from '@/lib/utils';
import type { Medico } from '@/types/medico';

const schema = z.object({
  nome_completo: z.string().min(3),
  cpf: z.string().min(11),
  crm: z.string().min(1, 'CRM obrigatório'),
  especialidade: z.string().min(1, 'Especialidade obrigatória'),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  data_formatura: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function MedicoDialog({ medico, open, onClose }: { medico?: Medico; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!medico;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: medico
      ? { nome_completo: medico.nome_completo, cpf: medico.cpf, crm: medico.crm, especialidade: medico.especialidade, telefone: medico.telefone ?? '', email: medico.email ?? '', data_formatura: medico.data_formatura ?? '' }
      : {},
  });

  const createMutation = useMutation({
    mutationFn: medicosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicos'] }); toast.success('Médico cadastrado!'); onClose(); reset(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: FormData) => medicosService.update(medico!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicos'] }); toast.success('Atualizado!'); onClose(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormData) {
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '')) as FormData;
    if (isEdit) updateMutation.mutate(clean);
    else createMutation.mutate(clean);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <DialogTitle>{isEdit ? 'Editar Médico' : 'Novo Médico'}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome Completo <span className="text-red-500">*</span></Label>
              <Input {...register('nome_completo')} className={errors.nome_completo ? 'border-red-300' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label>CPF <span className="text-red-500">*</span></Label>
              <Input {...register('cpf')} disabled={isEdit} />
            </div>
            <div className="space-y-1.5">
              <Label>CRM <span className="text-red-500">*</span></Label>
              <Input {...register('crm')} className={errors.crm ? 'border-red-300' : ''} />
              {errors.crm && <p className="text-xs text-red-500">{errors.crm.message}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Especialidade <span className="text-red-500">*</span></Label>
              <Input {...register('especialidade')} className={errors.especialidade ? 'border-red-300' : ''} />
              {errors.especialidade && <p className="text-xs text-red-500">{errors.especialidade.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input type="tel" {...register('telefone')} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
            </div>
            <div className="space-y-1.5">
              <Label>Formatura</Label>
              <Input type="date" {...register('data_formatura')} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <GradientButton type="submit" loading={loading}>{isEdit ? 'Salvar' : 'Cadastrar'}</GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MedicosPage() {
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; medico?: Medico }>({ open: false });

  const { data: medicos = [], isLoading } = useQuery({
    queryKey: ['medicos'],
    queryFn: () => medicosService.list().then((r) => r.data),
  });

  const filtered = useMemo(() =>
    medicos.filter((m) => !search || m.nome_completo.toLowerCase().includes(search.toLowerCase()) || m.crm.includes(search) || m.especialidade.toLowerCase().includes(search.toLowerCase())),
    [medicos, search]
  );

  return (
    <AppLayout title="Médicos" subtitle="Gerenciamento de médicos">
      <PageHeader
        title="Médicos"
        subtitle={`${medicos.length} médicos cadastrados`}
        actions={
          <>
            <GradientButton variant="outline" onClick={() => excelService.export('medicos')}><Download className="w-4 h-4" /> Exportar</GradientButton>
            <GradientButton onClick={() => setDialog({ open: true })}><Plus className="w-4 h-4" /> Novo Médico</GradientButton>
          </>
        }
      />

      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 mb-6 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400 text-slate-700" />
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Stethoscope} title="Nenhum médico encontrado"
            action={<GradientButton onClick={() => setDialog({ open: true })}><Plus className="w-4 h-4" /> Cadastrar</GradientButton>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>{['Nome', 'CRM', 'Especialidade', 'CPF', 'Telefone', 'Status', ''].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m, i) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8"><AvatarFallback>{m.nome_completo.charAt(0)}</AvatarFallback></Avatar>
                      <span className="text-sm font-medium text-slate-700">{m.nome_completo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-500">{m.crm}</TableCell>
                  <TableCell><Badge variant="default">{m.especialidade}</Badge></TableCell>
                  <TableCell className="text-slate-500">{formatCPF(m.cpf)}</TableCell>
                  <TableCell className="text-slate-500">{m.telefone ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-600 hover:bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDialog({ open: true, medico: m })}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <MedicoDialog open={dialog.open} medico={dialog.medico} onClose={() => setDialog({ open: false })} />
    </AppLayout>
  );
}
