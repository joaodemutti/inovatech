'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Download, UserPlus, Users, Edit2, Trash2 } from 'lucide-react';
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
import { pacientesService } from '@/services/pacientes.service';
import { excelService } from '@/services/excel.service';
import { formatCPF, formatDate } from '@/lib/utils';
import type { Paciente } from '@/types/paciente';

const schema = z.object({
  nome_completo: z.string().min(3, 'Mínimo 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  data_nascimento: z.string().optional(),
  convenio: z.string().optional(),
  endereco: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function PacienteDialog({ paciente, open, onClose }: { paciente?: Paciente; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!paciente;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: paciente
      ? { nome_completo: paciente.nome_completo, cpf: paciente.cpf, telefone: paciente.telefone ?? '', email: paciente.email ?? '', data_nascimento: paciente.data_nascimento ?? '', convenio: paciente.convenio ?? '', endereco: paciente.endereco ?? '' }
      : {},
  });

  const createMutation = useMutation({
    mutationFn: pacientesService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pacientes'] }); toast.success('Paciente cadastrado!'); onClose(); reset(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: FormData) => pacientesService.update(paciente!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pacientes'] }); toast.success('Atualizado!'); onClose(); },
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
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">Preencha os dados abaixo</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Nome Completo <span className="text-red-500">*</span></Label>
              <Input {...register('nome_completo')} className={errors.nome_completo ? 'border-red-300' : ''} />
              {errors.nome_completo && <p className="text-xs text-red-500">{errors.nome_completo.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>CPF <span className="text-red-500">*</span></Label>
              <Input {...register('cpf')} disabled={isEdit} className={errors.cpf ? 'border-red-300' : ''} />
              {errors.cpf && <p className="text-xs text-red-500">{errors.cpf.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input type="tel" {...register('telefone')} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} className={errors.email ? 'border-red-300' : ''} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Nascimento</Label>
              <Input type="date" {...register('data_nascimento')} />
            </div>
            <div className="space-y-1.5">
              <Label>Convênio</Label>
              <Input {...register('convenio')} placeholder="Particular, Unimed..." />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Endereço</Label>
              <Input {...register('endereco')} />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <GradientButton type="submit" loading={loading}>
              {isEdit ? 'Salvar Alterações' : 'Cadastrar'}
            </GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PacientesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; paciente?: Paciente }>({ open: false });

  const { data: pacientes = [], isLoading } = useQuery({
    queryKey: ['pacientes'],
    queryFn: () => pacientesService.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: pacientesService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pacientes'] }); toast.success('Desativado'); },
  });

  const filtered = useMemo(() =>
    pacientes.filter((p) => {
      const matchS = !search || p.nome_completo.toLowerCase().includes(search.toLowerCase()) || p.cpf.includes(search);
      const matchSt = !statusFilter || p.status === statusFilter;
      return matchS && matchSt;
    }),
    [pacientes, search, statusFilter]
  );

  return (
    <AppLayout title="Pacientes" subtitle="Gerenciamento de pacientes">
      <PageHeader
        title="Pacientes"
        subtitle={`${pacientes.length} pacientes cadastrados`}
        actions={
          <>
            <GradientButton variant="outline" onClick={() => excelService.export('pacientes')}>
              <Download className="w-4 h-4" /> Exportar
            </GradientButton>
            <GradientButton onClick={() => setDialog({ open: true })}>
              <Plus className="w-4 h-4" /> Novo Paciente
            </GradientButton>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input placeholder="Buscar por nome ou CPF..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400 text-slate-700" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-purple-400">
          <option value="">Todos</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum paciente encontrado" description="Cadastre o primeiro paciente ou ajuste os filtros."
            action={<GradientButton onClick={() => setDialog({ open: true })}><Plus className="w-4 h-4" /> Cadastrar</GradientButton>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {['Nome', 'CPF', 'Telefone', 'Convênio', 'Nascimento', 'Status', ''].map(h => <TableHead key={h}>{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8"><AvatarFallback>{p.nome_completo.charAt(0)}</AvatarFallback></Avatar>
                      <span className="text-sm font-medium text-slate-700">{p.nome_completo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{formatCPF(p.cpf)}</TableCell>
                  <TableCell className="text-slate-500">{p.telefone ?? '—'}</TableCell>
                  <TableCell className="text-slate-500">{p.convenio ?? 'Particular'}</TableCell>
                  <TableCell className="text-slate-500">{p.data_nascimento ? formatDate(p.data_nascimento) : '—'}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-600 hover:bg-purple-50" onClick={() => setDialog({ open: true, paciente: p })}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      {p.status === 'ativo' && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <PacienteDialog open={dialog.open} paciente={dialog.paciente} onClose={() => setDialog({ open: false })} />
    </AppLayout>
  );
}
