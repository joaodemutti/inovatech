import api from '@/lib/api';
import type { Medico, MedicoCreate, MedicoUpdate } from '@/types/medico';

export const medicosService = {
  list: () => api.get<Medico[]>('/medicos'),
  get: (id: number) => api.get<Medico>(`/medicos/${id}`),
  create: (data: MedicoCreate) => api.post<Medico>('/medicos', data),
  update: (id: number, data: MedicoUpdate) => api.patch<Medico>(`/medicos/${id}`, data),
};
