'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Plus, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { consultasService } from '@/services/consultas.service';
import { pacientesService } from '@/services/pacientes.service';
import { medicosService } from '@/services/medicos.service';
import { formatCurrency } from '@/lib/utils';
import type { Consulta, ConsultaStatus } from '@/types/consulta';

const STATUS_COLORS: Record<ConsultaStatus, string> = {
  agendada: '#3b82f6',
  confirmada: '#10b981',
  realizada: '#7c3aed',
  cancelada: '#ef4444',
};

const schema = z.object({
  paciente_id: z.coerce.number().min(1, 'Selecione o paciente'),
  medico_id: z.coerce.number().min(1, 'Selecione o médico'),
  data: z.string().min(1, 'Data obrigatória'),
  horario: z.string().min(1, 'Horário obrigatório'),
  tipo_consulta: z.string().min(1, 'Tipo obrigatório'),
  convenio: z.string().optional(),
  valor: z.coerce.number().min(0, 'Valor inválido'),
});

type FormData = z.infer<typeof schema>;

function ConsultaModal({ consulta, defaultDate, onClose }: { consulta?: Consulta; defaultDate?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!consulta;

  const { data: pacientes = [] } = useQuery({ queryKey: ['pacientes'], queryFn: () => pacientesService.list().then((r) => r.data) });
  const { data: medicos = [] } = useQuery({ queryKey: ['medicos'], queryFn: () => medicosService.list().then((r) => r.data) });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: consulta
      ? { paciente_id: consulta.paciente_id, medico_id: consulta.medico_id, data: consulta.data, horario: consulta.horario.substring(0, 5), tipo_consulta: consulta.tipo_consulta, convenio: consulta.convenio ?? '', valor: consulta.valor }
      : { data: defaultDate ?? '', horario: '' },
  });

  const createMutation = useMutation({
    mutationFn: consultasService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consultas'] }); toast.success('Consulta agendada!'); onClose(); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao salvar'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => consultasService.update(consulta!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consultas'] }); toast.success('Consulta atualizada!'); onClose(); },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao atualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => consultasService.remove(consulta!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consultas'] }); toast.success('Consulta removida'); onClose(); },
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormData) {
    const clean = { ...data, convenio: data.convenio || undefined };
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
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{isEdit ? 'Editar Consulta' : 'Nova Consulta'}</h2>
              {isEdit && <StatusBadge status={consulta.status} />}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Paciente <span className="text-red-500">*</span></label>
              <select {...register('paciente_id')} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${errors.paciente_id ? 'border-red-300' : 'border-slate-200 focus:border-purple-400'}`}>
                <option value="">Selecione...</option>
                {pacientes.filter(p => p.status === 'ativo').map((p) => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              {errors.paciente_id && <p className="text-red-500 text-xs mt-1">{errors.paciente_id.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Médico <span className="text-red-500">*</span></label>
              <select {...register('medico_id')} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${errors.medico_id ? 'border-red-300' : 'border-slate-200 focus:border-purple-400'}`}>
                <option value="">Selecione...</option>
                {medicos.filter(m => m.status === 'ativo').map((m) => <option key={m.id} value={m.id}>Dr(a). {m.nome_completo} — {m.especialidade}</option>)}
              </select>
              {errors.medico_id && <p className="text-red-500 text-xs mt-1">{errors.medico_id.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data <span className="text-red-500">*</span></label>
              <input type="date" {...register('data')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Horário <span className="text-red-500">*</span></label>
              <input type="time" {...register('horario')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo <span className="text-red-500">*</span></label>
              <input {...register('tipo_consulta')} placeholder="Ex: Consulta, Retorno..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valor (R$) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" {...register('valor')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Convênio</label>
              <input {...register('convenio')} placeholder="Particular, Unimed, etc." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-400" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {isEdit && (
              <button type="button" onClick={() => deleteMutation.mutate()} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
                Cancelar Consulta
              </button>
            )}
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">Fechar</button>
            <GradientButton type="submit" loading={loading} className="flex-1 justify-center">{isEdit ? 'Salvar' : 'Agendar'}</GradientButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ConsultasPage() {
  const [modal, setModal] = useState<{ open: boolean; consulta?: Consulta; defaultDate?: string }>({ open: false });

  const { data: consultas = [] } = useQuery({
    queryKey: ['consultas'],
    queryFn: () => consultasService.list({ limit: 500 }).then((r) => r.data),
  });

  const events = consultas.map((c) => ({
    id: String(c.id),
    title: `${c.horario?.substring(0, 5)} — Paciente #${c.paciente_id}`,
    start: `${c.data}T${c.horario}`,
    backgroundColor: STATUS_COLORS[c.status],
    borderColor: STATUS_COLORS[c.status],
    extendedProps: { consulta: c },
  }));

  return (
    <AppLayout title="Consultas" subtitle="Agenda médica">
      <PageHeader
        title="Agenda de Consultas"
        subtitle="Gerencie todos os agendamentos"
        actions={
          <GradientButton onClick={() => setModal({ open: true })}>
            <Plus className="w-4 h-4" /> Nova Consulta
          </GradientButton>
        }
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-500 capitalize">{status}</span>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
      >
        <style>{`
          .fc .fc-button { background: linear-gradient(135deg, #7c3aed, #3b82f6) !important; border: none !important; border-radius: 10px !important; padding: 6px 14px !important; font-size: 13px !important; }
          .fc .fc-button:hover { opacity: 0.9 !important; }
          .fc .fc-button-active { box-shadow: inset 0 2px 6px rgba(0,0,0,0.2) !important; }
          .fc .fc-toolbar-title { font-size: 16px !important; font-weight: 700 !important; color: #1e293b !important; }
          .fc .fc-daygrid-event { border-radius: 6px !important; font-size: 12px !important; padding: 2px 4px !important; }
          .fc .fc-timegrid-event { border-radius: 6px !important; }
          .fc th { font-size: 12px !important; color: #64748b !important; font-weight: 600 !important; }
          .fc td { border-color: #f1f5f9 !important; }
          .fc .fc-day-today { background: rgba(124,58,237,0.04) !important; }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          dateClick={(info) => setModal({ open: true, defaultDate: info.dateStr })}
          eventClick={(info) => setModal({ open: true, consulta: info.event.extendedProps.consulta as Consulta })}
          height="auto"
          aspectRatio={1.8}
        />
      </motion.div>

      <AnimatePresence>
        {modal.open && (
          <ConsultaModal
            consulta={modal.consulta}
            defaultDate={modal.defaultDate}
            onClose={() => setModal({ open: false })}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
