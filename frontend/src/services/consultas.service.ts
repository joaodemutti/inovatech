import api from '@/lib/api';
import type { Consulta, ConsultaCreate, ConsultaUpdate } from '@/types/consulta';

interface ConsultaFilters {
  data?: string;
  medico_id?: number;
  status?: string;
  skip?: number;
  limit?: number;
}

export const consultasService = {
  list: (filters?: ConsultaFilters) => api.get<Consulta[]>('/consultas', { params: filters }),
  hoje: () => api.get<Consulta[]>('/consultas/hoje'),
  get: (id: number) => api.get<Consulta>(`/consultas/${id}`),
  create: (data: ConsultaCreate) => api.post<Consulta>('/consultas', data),
  update: (id: number, data: ConsultaUpdate) => api.patch<Consulta>(`/consultas/${id}`, data),
  remove: (id: number) => api.delete(`/consultas/${id}`),
};
