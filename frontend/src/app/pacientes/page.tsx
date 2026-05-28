'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Download, X, UserPlus, Users, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { pacientesService } from '@/services/pacientes.service';
import { excelService } from '@/services/excel.service';
import { formatCPF, formatDate } from '@/lib/utils';
import type { Paciente } from '@/types/paciente';

const schema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').max(14),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  data_nascimento: z.string().optional(),
  convenio: z.string().optional(),
  endereco: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function PacienteModal({
  paciente,
  onClose,
}: {
  paciente?: Paciente;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!paciente;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: paciente
      ? {
          nome_completo: paciente.nome_completo,
          cpf: paciente.cpf,
          telefone: paciente.telefone ?? '',
          email: paciente.email ?? '',
          data_nascimento: paciente.data_nascimento ?? '',
          convenio: paciente.convenio ?? '',
          endereco: paciente.endereco ?? '',
        }
      : {},
  });

  const createMutation = useMutation({
    mutationFn: pacientesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Paciente cadastrado!');
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          'Erro ao salvar'
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => pacientesService.update(paciente!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Paciente atualizado!');
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          'Erro ao atualizar'
      );
    },
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormData) {
    const clean = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
    ) as FormData;
    if (isEdit) updateMutation.mutate(clean);
    else createMutation.mutate(clean);
  }

  const fields: { name: keyof FormData; label: string; type?: string; required?: boolean }[] = [
    { name: 'nome_completo', label: 'Nome Completo', required: true },
    { name: 'cpf', label: 'CPF', required: true },
    { name: 'telefone', label: 'Telefone', type: 'tel' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'data_nascimento', label: 'Data de Nascimento', type: 'date' },
    { name: 'convenio', label: 'Convênio' },
    { name: 'endereco', label: 'Endereço' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{isEdit ? 'Editar Paciente' : 'Novo Paciente'}</h2>
              <p className="text-xs text-slate-400">Preencha os dados abaixo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.name} className={f.name === 'nome_completo' || f.name === 'endereco' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  {...register(f.name)}
                  type={f.type ?? 'text'}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                    errors[f.name]
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  }`}
                />
                {errors[f.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[f.name]?.message}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <GradientButton type="submit" loading={loading} className="flex-1 justify-center">
              {isEdit ? 'Salvar Alterações' : 'Cadastrar Paciente'}
            </GradientButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function PacientesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<{ open: boolean; paciente?: Paciente }>({ open: false });

  const { data: pacientes = [], isLoading } = useQuery({
    queryKey: ['pacientes'],
    queryFn: () => pacientesService.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: pacientesService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      toast.success('Paciente desativado');
    },
    onError: () => toast.error('Erro ao desativar'),
  });

  const filtered = useMemo(() => {
    return pacientes.filter((p) => {
      const matchSearch =
        !search ||
        p.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
        p.cpf.includes(search);
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pacientes, search, statusFilter]);

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
            <GradientButton onClick={() => setModal({ open: true })}>
              <Plus className="w-4 h-4" /> Novo Paciente
            </GradientButton>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum paciente encontrado"
            description="Cadastre o primeiro paciente ou ajuste os filtros."
            action={
              <GradientButton onClick={() => setModal({ open: true })}>
                <Plus className="w-4 h-4" /> Cadastrar Paciente
              </GradientButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Nome', 'CPF', 'Telefone', 'Convênio', 'Nascimento', 'Status', 'Ações'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                        >
                          {p.nome_completo.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{p.nome_completo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatCPF(p.cpf)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{p.telefone ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{p.convenio ?? 'Particular'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {p.data_nascimento ? formatDate(p.data_nascimento) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal({ open: true, paciente: p })}
                          className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {p.status === 'ativo' && (
                          <button
                            onClick={() => deleteMutation.mutate(p.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {modal.open && (
          <PacienteModal
            paciente={modal.paciente}
            onClose={() => setModal({ open: false })}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
