import api from '@/lib/api';
import type { Paciente, PacienteCreate, PacienteUpdate } from '@/types/paciente';

export const pacientesService = {
  list: () => api.get<Paciente[]>('/pacientes'),
  get: (id: number) => api.get<Paciente>(`/pacientes/${id}`),
  create: (data: PacienteCreate) => api.post<Paciente>('/pacientes', data),
  update: (id: number, data: PacienteUpdate) => api.patch<Paciente>(`/pacientes/${id}`, data),
  remove: (id: number) => api.delete(`/pacientes/${id}`),
};
