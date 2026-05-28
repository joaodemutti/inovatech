import api from '@/lib/api';
import type { Lancamento, LancamentoCreate, LancamentoUpdate, IndicadoresFinanceiros } from '@/types/financeiro';

export const financeiroService = {
  indicadores: () => api.get<IndicadoresFinanceiros>('/financeiro/indicadores'),
  list: (skip = 0, limit = 100) =>
    api.get<Lancamento[]>('/financeiro', { params: { skip, limit } }),
  create: (data: LancamentoCreate) => api.post<Lancamento>('/financeiro', data),
  update: (id: number, data: LancamentoUpdate) => api.patch<Lancamento>(`/financeiro/${id}`, data),
};
