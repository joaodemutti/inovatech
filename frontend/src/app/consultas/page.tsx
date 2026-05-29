'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { GradientButton } from '@/components/ui/GradientButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { consultasService } from '@/services/consultas.service';
import { pacientesService } from '@/services/pacientes.service';
import { medicosService } from '@/services/medicos.service';
import type { Consulta, ConsultaStatus } from '@/types/consulta';

const STATUS_COLORS: Record<ConsultaStatus, string> = {
  agendada: '#3b82f6', confirmada: '#10b981', realizada: '#7c3aed', cancelada: '#ef4444',
};

const schema = z.object({
  paciente_id: z.coerce.number().min(1, 'Selecione o paciente'),
  medico_id: z.coerce.number().min(1, 'Selecione o médico'),
  data: z.string().min(1),
  horario: z.string().min(1),
  tipo_consulta: z.string().min(1),
  convenio: z.string().optional(),
  valor: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

function ConsultaDialog({ consulta, defaultDate, open, onClose }: { consulta?: Consulta; defaultDate?: string; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!consulta;

  const { data: pacientes = [] } = useQuery({ queryKey: ['pacientes'], queryFn: () => pacientesService.list().then(r => r.data) });
  const { data: medicos = [] } = useQuery({ queryKey: ['medicos'], queryFn: () => medicosService.list().then(r => r.data) });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: consulta
      ? { paciente_id: consulta.paciente_id, medico_id: consulta.medico_id, data: consulta.data, horario: consulta.horario.substring(0, 5), tipo_consulta: consulta.tipo_consulta, convenio: consulta.convenio ?? '', valor: consulta.valor }
      : { data: defaultDate ?? '', horario: '', valor: 0 },
  });

  const createMutation = useMutation({
    mutationFn: consultasService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consultas'] }); toast.success('Agendado!'); onClose(); reset(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: FormData) => consultasService.update(consulta!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consultas'] }); toast.success('Atualizado!'); onClose(); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => consultasService.remove(consulta!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['consultas'] }); toast.success('Removido'); onClose(); },
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormData) {
    const clean = { ...data, convenio: data.convenio || undefined };
    if (isEdit) updateMutation.mutate(clean);
    else createMutation.mutate(clean);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Editar Consulta' : 'Nova Consulta'}</DialogTitle>
              {isEdit && <div className="mt-1"><StatusBadge status={consulta.status} /></div>}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Paciente <span className="text-red-500">*</span></Label>
              <select {...register('paciente_id')} className={`h-9 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 ${errors.paciente_id ? 'border-red-300' : 'border-slate-200'}`}>
                <option value="">Selecione...</option>
                {pacientes.filter(p => p.status === 'ativo').map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
              </select>
              {errors.paciente_id && <p className="text-xs text-red-500">{errors.paciente_id.message}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Médico <span className="text-red-500">*</span></Label>
              <select {...register('medico_id')} className={`h-9 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 ${errors.medico_id ? 'border-red-300' : 'border-slate-200'}`}>
                <option value="">Selecione...</option>
                {medicos.filter(m => m.status === 'ativo').map(m => <option key={m.id} value={m.id}>Dr(a). {m.nome_completo} — {m.especialidade}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Data <span className="text-red-500">*</span></Label>
              <Input type="date" {...register('data')} />
            </div>
            <div className="space-y-1.5">
              <Label>Horário <span className="text-red-500">*</span></Label>
              <Input type="time" {...register('horario')} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo <span className="text-red-500">*</span></Label>
              <Input {...register('tipo_consulta')} placeholder="Consulta, Retorno..." />
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$) <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.01" {...register('valor')} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Convênio</Label>
              <Input {...register('convenio')} placeholder="Particular, Unimed..." />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isEdit && (
              <Button type="button" variant="destructive" size="sm" onClick={() => deleteMutation.mutate()}>
                Cancelar Consulta
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
            <GradientButton type="submit" loading={loading}>{isEdit ? 'Salvar' : 'Agendar'}</GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ConsultasPage() {
  const [dialog, setDialog] = useState<{ open: boolean; consulta?: Consulta; defaultDate?: string }>({ open: false });

  const { data: consultas = [] } = useQuery({
    queryKey: ['consultas'],
    queryFn: () => consultasService.list({ limit: 500 }).then(r => r.data),
  });

  const events = consultas.map(c => ({
    id: String(c.id),
    title: `${c.horario?.substring(0, 5)} — #${c.paciente_id}`,
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
          <GradientButton onClick={() => setDialog({ open: true })}>
            <Plus className="w-4 h-4" /> Nova Consulta
          </GradientButton>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
            <span className="text-xs text-slate-500 capitalize">{s}</span>
          </div>
        ))}
      </div>

      <Card className="p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <style>{`
            .fc .fc-button { background: linear-gradient(135deg, #7c3aed, #3b82f6) !important; border: none !important; border-radius: 10px !important; padding: 6px 14px !important; font-size: 13px !important; }
            .fc .fc-button:hover { opacity: 0.9 !important; }
            .fc .fc-toolbar-title { font-size: 16px !important; font-weight: 700 !important; color: #1e293b !important; }
            .fc .fc-daygrid-event { border-radius: 6px !important; font-size: 12px !important; }
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
            dateClick={(info) => setDialog({ open: true, defaultDate: info.dateStr })}
            eventClick={(info) => setDialog({ open: true, consulta: info.event.extendedProps.consulta as Consulta })}
            height="auto"
            aspectRatio={1.8}
          />
        </motion.div>
      </Card>

      <ConsultaDialog open={dialog.open} consulta={dialog.consulta} defaultDate={dialog.defaultDate} onClose={() => setDialog({ open: false })} />
    </AppLayout>
  );
}
