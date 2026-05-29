import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType =
  | 'ativo' | 'inativo'
  | 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
  | 'pago' | 'pendente' | 'atrasado'
  | 'normal' | 'atraso' | 'falta' | 'h_extra'
  | 'sucesso' | 'falha';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  ativo:      { label: 'Ativo',      className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inativo:    { label: 'Inativo',    className: 'bg-slate-100 text-slate-500 border-slate-200' },
  agendada:   { label: 'Agendada',   className: 'bg-blue-100 text-blue-700 border-blue-200' },
  confirmada: { label: 'Confirmada', className: 'bg-green-100 text-green-700 border-green-200' },
  realizada:  { label: 'Realizada',  className: 'bg-purple-100 text-purple-700 border-purple-200' },
  cancelada:  { label: 'Cancelada',  className: 'bg-red-100 text-red-700 border-red-200' },
  pago:       { label: 'Pago',       className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  pendente:   { label: 'Pendente',   className: 'bg-amber-100 text-amber-700 border-amber-200' },
  atrasado:   { label: 'Atrasado',   className: 'bg-red-100 text-red-700 border-red-200' },
  normal:     { label: 'Normal',     className: 'bg-green-100 text-green-700 border-green-200' },
  atraso:     { label: 'Atraso',     className: 'bg-amber-100 text-amber-700 border-amber-200' },
  falta:      { label: 'Falta',      className: 'bg-red-100 text-red-700 border-red-200' },
  h_extra:    { label: 'H. Extra',   className: 'bg-blue-100 text-blue-700 border-blue-200' },
  sucesso:    { label: 'Sucesso',    className: 'bg-green-100 text-green-700 border-green-200' },
  falha:      { label: 'Falha',      className: 'bg-red-100 text-red-700 border-red-200' },
};

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <Badge className={cn('border', config.className, className)}>
      {config.label}
    </Badge>
  );
}
