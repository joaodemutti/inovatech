'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, X, FileText, CheckCircle, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { prontuariosService } from '@/services/prontuarios.service';
import { pacientesService } from '@/services/pacientes.service';
import { medicosService } from '@/services/medicos.service';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';
import type { Prontuario } from '@/types/prontuario';

const schema = z.object({
  paciente_id: z.coerce.number().min(1, 'Selecione o paciente'),
  medico_id: z.coerce.number().min(1, 'Selecione o médico'),
  data: z.string().min(1, 'Data obrigatória'),
  cid: z.string().min(1, 'CID obrigatório'),
  diagnostico: z.string().min(5, 'Diagnóstico obrigatório'),
  prescricao: z.string().min(5, 'Prescrição obrigatória'),
  retorno_em_dias: z.coerce.number().min(0).default(0),
});

type FormData = z.infer<typeof schema>;

function ProntuarioModal({ prontuario, onClose }: { prontuario?: Prontuario; onClose: () => void }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isEdit = !!prontuario;

  const { data: pacientes = [] } = useQuery({ queryKey: ['pacientes'], queryFn: () => pacientesService.list().then((r) => r.data) });
  const { data: medicos = [] } = useQuery({ queryKey: ['medicos'], queryFn: () => medicosService.list().then((r) => r.data) });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: prontuario
      ? { paciente_id: prontuario.paciente_id, medico_id: prontuario.medico_id, data: prontuario.data, cid: prontuario.cid, diagnostico: prontuario.diagnostico, prescricao: prontuario.prescricao, retorno_em_dias: prontuario.retorno_em_dias }
      : { data: new Date().toISOString().split('T')[0], retorno_em_dias: 0 },
  });

  const createMutation = useMutation({
    mutationFn: prontuariosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prontuarios'] }); toast.success('Prontuário criado!'); onClose(); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao salvar'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => prontuariosService.update(prontuario!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prontuarios'] }); toast.success('Prontuário atualizado!'); onClose(); },
  });

  const liberarMutation = useMutation({
    mutationFn: () => prontuariosService.liberarLaudo(prontuario!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prontuarios'] }); toast.success('Laudo liberado!'); onClose(); },
  });

  const loading = createMutation.isPending || updateMutation.isPending;
  const canEdit = user?.perfil === 'medico';

  function onSubmit(data: FormData) {
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{isEdit ? 'Prontuário' : 'Novo Prontuário'}</h2>
              {isEdit && prontuario.laudo_liberado && (
                <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Laudo Liberado</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Paciente <span className="text-red-500">*</span></label>
                  <select {...register('paciente_id')} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${errors.paciente_id ? 'border-red-300' : 'border-slate-200 focus:border-purple-400'}`}>
                    <option value="">Selecione...</option>
                    {pacientes.filter((p) => p.status === 'ativo').map((p) => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Médico <span className="text-red-500">*</span></label>
                  <select {...register('medico_id')} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${errors.medico_id ? 'border-red-300' : 'border-slate-200 focus:border-purple-400'}`}>
                    <option value="">Selecione...</option>
                    {medicos.filter((m) => m.status === 'ativo').map((m) => <option key={m.id} value={m.id}>Dr(a). {m.nome_completo}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data <span className="text-red-500">*</span></label>
              <input type="date" {...register('data')} disabled={isEdit && !canEdit} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 disabled:bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CID <span className="text-red-500">*</span></label>
              <input {...register('cid')} disabled={isEdit && !canEdit} placeholder="Ex: J00, M54.5" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 disabled:bg-slate-50" />
              {errors.cid && <p className="text-red-500 text-xs mt-1">{errors.cid.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Diagnóstico <span className="text-red-500">*</span></label>
              <textarea {...register('diagnostico')} disabled={isEdit && !canEdit} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 resize-none disabled:bg-slate-50" />
              {errors.diagnostico && <p className="text-red-500 text-xs mt-1">{errors.diagnostico.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Prescrição <span className="text-red-500">*</span></label>
              <textarea {...register('prescricao')} disabled={isEdit && !canEdit} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 resize-none disabled:bg-slate-50" />
              {errors.prescricao && <p className="text-red-500 text-xs mt-1">{errors.prescricao.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Retorno em (dias)</label>
              <input type="number" {...register('retorno_em_dias')} disabled={isEdit && !canEdit} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400 disabled:bg-slate-50" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">Fechar</button>
            {canEdit && isEdit && !prontuario.laudo_liberado && (
              <button type="button" onClick={() => liberarMutation.mutate()} className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-sm font-medium hover:bg-emerald-50">
                <CheckCircle className="w-4 h-4 inline mr-1" /> Liberar Laudo
              </button>
            )}
            {(canEdit || !isEdit) && (
              <GradientButton type="submit" loading={loading} className="flex-1 justify-center">{isEdit ? 'Salvar' : 'Criar'}</GradientButton>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ProntuariosPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; prontuario?: Prontuario }>({ open: false });
  const user = useAuthStore((s) => s.user);

  const { data: prontuarios = [], isLoading } = useQuery({
    queryKey: ['prontuarios'],
    queryFn: () => prontuariosService.list().then((r) => r.data),
  });

  const { data: pacientes = [] } = useQuery({ queryKey: ['pacientes'], queryFn: () => pacientesService.list().then((r) => r.data) });
  const { data: medicos = [] } = useQuery({ queryKey: ['medicos'], queryFn: () => medicosService.list().then((r) => r.data) });

  const pacienteMap = useMemo(() => new Map(pacientes.map((p) => [p.id, p.nome_completo])), [pacientes]);
  const medicoMap = useMemo(() => new Map(medicos.map((m) => [m.id, m.nome_completo])), [medicos]);

  const filtered = useMemo(() =>
    prontuarios.filter((p) => {
      const nome = pacienteMap.get(p.paciente_id) ?? '';
      return !search || nome.toLowerCase().includes(search.toLowerCase()) || p.cid.toLowerCase().includes(search.toLowerCase());
    }),
    [prontuarios, search, pacienteMap]
  );

  return (
    <AppLayout title="Prontuários" subtitle="Histórico médico">
      <PageHeader
        title="Prontuários"
        subtitle={`${prontuarios.length} registros`}
        actions={
          user?.perfil === 'medico' && (
            <GradientButton onClick={() => setModal({ open: true })}><Plus className="w-4 h-4" /> Novo Prontuário</GradientButton>
          )
        }
      />

      <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2.5 mb-6 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input placeholder="Buscar por paciente ou CID..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400 text-slate-700" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileText} title="Nenhum prontuário encontrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Paciente', 'Médico', 'Data', 'CID', 'Retorno', 'Laudo', 'Ações'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{pacienteMap.get(p.paciente_id) ?? `#${p.paciente_id}`}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{medicoMap.get(p.medico_id) ? `Dr(a). ${medicoMap.get(p.medico_id)}` : `#${p.medico_id}`}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(p.data)}</td>
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{p.cid}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{p.retorno_em_dias > 0 ? `${p.retorno_em_dias} dias` : '—'}</td>
                    <td className="px-4 py-3">
                      {p.laudo_liberado ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /> Liberado</span>
                      ) : (
                        <span className="text-xs text-slate-400">Pendente</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setModal({ open: true, prontuario: p })} className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 opacity-0 group-hover:opacity-100 transition-all">
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
        {modal.open && <ProntuarioModal prontuario={modal.prontuario} onClose={() => setModal({ open: false })} />}
      </AnimatePresence>
    </AppLayout>
  );
}
