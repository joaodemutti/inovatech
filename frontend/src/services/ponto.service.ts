import api from '@/lib/api';
import type { RegistroPonto, PontoCreate, PontoUpdate, TotaisPonto } from '@/types/ponto';

interface PontoFilters {
  usuario_id?: number;
  data_inicio?: string;
  data_fim?: string;
  skip?: number;
  limit?: number;
}

export const pontoService = {
  totais: (filters?: Omit<PontoFilters, 'skip' | 'limit'>) =>
    api.get<TotaisPonto>('/ponto/totais', { params: filters }),
  list: (filters?: PontoFilters) => api.get<RegistroPonto[]>('/ponto', { params: filters }),
  get: (id: number) => api.get<RegistroPonto>(`/ponto/${id}`),
  create: (data: PontoCreate) => api.post<RegistroPonto>('/ponto', data),
  update: (id: number, data: PontoUpdate) => api.patch<RegistroPonto>(`/ponto/${id}`, data),
};
