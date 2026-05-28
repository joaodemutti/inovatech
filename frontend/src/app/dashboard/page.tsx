'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { dashboardService } from '@/services/dashboard.service';
import { consultasService } from '@/services/consultas.service';
import { pacientesService } from '@/services/pacientes.service';
import { formatCurrency, formatDate } from '@/lib/utils';

const mockChart = [
  { name: 'Jan', receita: 12000, despesa: 4000 },
  { name: 'Fev', receita: 18000, despesa: 5000 },
  { name: 'Mar', receita: 15000, despesa: 6000 },
  { name: 'Abr', receita: 22000, despesa: 4500 },
  { name: 'Mai', receita: 19000, despesa: 5500 },
  { name: 'Jun', receita: 25000, despesa: 7000 },
];

export default function DashboardPage() {
  const { data: indicadores, isLoading: loadingIndicadores } = useQuery({
    queryKey: ['dashboard-indicadores'],
    queryFn: () => dashboardService.indicadores().then((r) => r.data),
  });

  const { data: consultasHoje = [], isLoading: loadingConsultas } = useQuery({
    queryKey: ['consultas-hoje'],
    queryFn: () => consultasService.hoje().then((r) => r.data),
  });

  const { data: pacientes = [], isLoading: loadingPacientes } = useQuery({
    queryKey: ['pacientes'],
    queryFn: () => pacientesService.list().then((r) => r.data),
  });

  const recentePacientes = pacientes.slice(0, 5);

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da clínica">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total de Pacientes"
          value={loadingIndicadores ? '—' : indicadores?.total_pacientes ?? 0}
          icon={Users}
          gradient="from-violet-500 to-purple-600"
          delay={0}
        />
        <StatCard
          title="Consultas Hoje"
          value={loadingIndicadores ? '—' : indicadores?.consultas_hoje ?? 0}
          icon={Calendar}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <StatCard
          title="Receita do Mês"
          value={loadingIndicadores ? '—' : formatCurrency(indicadores?.receita_mes ?? 0)}
          icon={DollarSign}
          gradient="from-emerald-500 to-teal-500"
          delay={0.2}
        />
        <StatCard
          title="Valores Pendentes"
          value={loadingIndicadores ? '—' : formatCurrency(indicadores?.valores_pendentes ?? 0)}
          icon={AlertTriangle}
          gradient="from-orange-500 to-amber-500"
          delay={0.3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Desempenho Financeiro</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockChart}>
              <defs>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: unknown) => formatCurrency(Number(v))}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="receita" stroke="#7c3aed" strokeWidth={2} fill="url(#gradReceita)" name="Receita" />
              <Area type="monotone" dataKey="despesa" stroke="#3b82f6" strokeWidth={2} fill="none" name="Despesa" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Consultas por Mês</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="receita" fill="url(#barGrad)" radius={[6, 6, 0, 0]} name="Consultas" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Today's appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Consultas de Hoje</h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {consultasHoje.length} agendadas
            </span>
          </div>
          {loadingConsultas ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : consultasHoje.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <Calendar className="w-8 h-8 mb-2" />
              <p className="text-sm">Nenhuma consulta hoje</p>
            </div>
          ) : (
            <div className="space-y-2">
              {consultasHoje.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Paciente #{c.paciente_id}</p>
                      <p className="text-xs text-slate-400">{c.horario} — {c.tipo_consulta}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent patients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <h3 className="font-semibold text-slate-800 mb-4">Pacientes Recentes</h3>
          {loadingPacientes ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentePacientes.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-sm">Nenhum paciente cadastrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentePacientes.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
                  >
                    {p.nome_completo.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{p.nome_completo}</p>
                    <p className="text-xs text-slate-400">{p.convenio ?? 'Particular'}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
