'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, FileText, Download, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { portalService } from '@/services/portal.service';
import { formatDate } from '@/lib/utils';

export default function PortalPage() {
  const { data: consultas = [], isLoading: loadingConsultas } = useQuery({
    queryKey: ['portal-consultas'],
    queryFn: () => portalService.consultas().then((r) => r.data),
  });

  const { data: laudos = [], isLoading: loadingLaudos } = useQuery({
    queryKey: ['portal-laudos'],
    queryFn: () => portalService.laudos().then((r) => r.data),
  });

  async function handleDownload(id: number) {
    try {
      const { data } = await portalService.downloadLaudo(id);
      toast.success('Laudo obtido com sucesso');
      console.log(data);
    } catch {
      toast.error('Erro ao baixar laudo');
    }
  }

  return (
    <AppLayout title="Portal" subtitle="Meu espaço">
      <PageHeader title="Portal do Paciente" subtitle="Suas consultas e laudos médicos" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Consultas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Minhas Consultas</h3>
              <p className="text-xs text-slate-400">{consultas.length} consulta(s)</p>
            </div>
          </div>
          <div className="p-4">
            {loadingConsultas ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : consultas.length === 0 ? (
              <EmptyState icon={Calendar} title="Nenhuma consulta" description="Você não possui consultas agendadas no momento." />
            ) : (
              <div className="space-y-3">
                {consultas.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{c.tipo_consulta}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(c.data)} às {c.horario?.substring(0, 5)}</p>
                      {c.convenio && <p className="text-xs text-slate-400">{c.convenio}</p>}
                    </div>
                    <StatusBadge status={c.status} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Laudos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Meus Laudos</h3>
              <p className="text-xs text-slate-400">{laudos.length} laudo(s) disponível(is)</p>
            </div>
          </div>
          <div className="p-4">
            {loadingLaudos ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : laudos.length === 0 ? (
              <EmptyState icon={FileText} title="Nenhum laudo disponível" description="Seus laudos aparecerão aqui quando forem liberados pelo médico." />
            ) : (
              <div className="space-y-3">
                {laudos.map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">CID: {l.cid}</p>
                      <p className="text-xs text-slate-400">{formatDate(l.data)}</p>
                    </div>
                    <GradientButton variant="outline" onClick={() => handleDownload(l.id)} className="text-xs px-3 py-1.5">
                      <Download className="w-3.5 h-3.5" /> Baixar
                    </GradientButton>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: '#7c3aed', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Clínica Vida Plena</h3>
            <p className="text-indigo-200 text-sm mt-0.5">Sua saúde em boas mãos. Acompanhe suas consultas e resultados com segurança.</p>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
