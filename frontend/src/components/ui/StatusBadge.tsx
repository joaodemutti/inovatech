import { cn } from '@/lib/utils';

type StatusType =
  | 'ativo' | 'inativo'
  | 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
  | 'pago' | 'pendente' | 'atrasado'
  | 'normal' | 'atraso' | 'falta' | 'h_extra'
  | 'sucesso' | 'falha';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  ativo: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700' },
  inativo: { label: 'Inativo', className: 'bg-slate-100 text-slate-500' },
  agendada: { label: 'Agendada', className: 'bg-blue-100 text-blue-700' },
  confirmada: { label: 'Confirmada', className: 'bg-green-100 text-green-700' },
  realizada: { label: 'Realizada', className: 'bg-purple-100 text-purple-700' },
  cancelada: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
  pago: { label: 'Pago', className: 'bg-emerald-100 text-emerald-700' },
  pendente: { label: 'Pendente', className: 'bg-amber-100 text-amber-700' },
  atrasado: { label: 'Atrasado', className: 'bg-red-100 text-red-700' },
  normal: { label: 'Normal', className: 'bg-green-100 text-green-700' },
  atraso: { label: 'Atraso', className: 'bg-amber-100 text-amber-700' },
  falta: { label: 'Falta', className: 'bg-red-100 text-red-700' },
  h_extra: { label: 'H. Extra', className: 'bg-blue-100 text-blue-700' },
  sucesso: { label: 'Sucesso', className: 'bg-green-100 text-green-700' },
  falha: { label: 'Falha', className: 'bg-red-100 text-red-700' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
