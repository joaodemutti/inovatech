'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Download, X, Stethoscope, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { medicosService } from '@/services/medicos.service';
import { excelService } from '@/services/excel.service';
import { formatCPF } from '@/lib/utils';
import type { Medico } from '@/types/medico';

const schema = z.object({
  nome_completo: z.string().min(3, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  crm: z.string().min(1, 'CRM obrigatório'),
  especialidade: z.string().min(1, 'Especialidade obrigatória'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  data_formatura: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function MedicoModal({ medico, onClose }: { medico?: Medico; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!medico;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: medico
      ? {
          nome_completo: medico.nome_completo,
          cpf: medico.cpf,
          crm: medico.crm,
          especialidade: medico.especialidade,
          telefone: medico.telefone ?? '',
          email: medico.email ?? '',
          data_formatura: medico.data_formatura ?? '',
        }
      : {},
  });

  const createMutation = useMutation({
    mutationFn: medicosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicos'] }); toast.success('Médico cadastrado!'); onClose(); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao salvar'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => medicosService.update(medico!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medicos'] }); toast.success('Médico atualizado!'); onClose(); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao atualizar'),
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormData) {
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '')) as FormData;
    if (isEdit) updateMutation.mutate(clean);
    else createMutation.mutate(clean);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{isEdit ? 'Editar Médico' : 'Novo Médico'}</h2>
              <p className="text-xs text-slate-400">Dados do profissional</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'nome_completo' as const, label: 'Nome Completo', span2: true, required: true },
              { name: 'cpf' as const, label: 'CPF', required: true },
              { name: 'crm' as const, label: 'CRM', required: true },
              { name: 'especialidade' as const, label: 'Especialidade', required: true },
              { name: 'telefone' as const, label: 'Telefone' },
              { name: 'email' as const, label: 'Email', type: 'email' },
              { name: 'data_formatura' as const, label: 'Data de Formatura', type: 'date' },
            ].map((f) => (
              <div key={f.name} className={f.span2 ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  {...register(f.name)}
                  type={f.type ?? 'text'}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors[f.name] ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'}`}
                />
                {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]?.message}</p>}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
            <GradientButton type="submit" loading={loading} className="flex-1 justify-center">{isEdit ? 'Salvar' : 'Cadastrar'}</GradientButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function MedicosPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; medico?: Medico }>({ open: false });

  const { data: medicos = [], isLoading } = useQuery({
    queryKey: ['medicos'],
    queryFn: () => medicosService.list().then((r) => r.data),
  });

  const filtered = useMemo(() =>
    medicos.filter((m) =>
      !search ||
      m.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      m.crm.includes(search) ||
      m.especialidade.toLowerCase().includes(search.toLowerCase())
    ),
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
            <GradientButton onClick={() => setModal({ open: true })}><Plus className="w-4 h-4" /> Novo Médico</GradientButton>
          </>
        }
      />

      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5 mb-6 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input placeholder="Buscar por nome, CRM ou especialidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400 text-slate-700" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Stethoscope} title="Nenhum médico encontrado" action={<GradientButton onClick={() => setModal({ open: true })}><Plus className="w-4 h-4" /> Cadastrar Médico</GradientButton>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Nome', 'CRM', 'Especialidade', 'CPF', 'Telefone', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
                          {m.nome_completo.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{m.nome_completo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 font-mono">{m.crm}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{m.especialidade}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatCPF(m.cpf)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{m.telefone ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setModal({ open: true, medico: m })} className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors opacity-0 group-hover:opacity-100">
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

      <AnimatePresence>
        {modal.open && <MedicoModal medico={modal.medico} onClose={() => setModal({ open: false })} />}
      </AnimatePresence>
    </AppLayout>
  );
}
