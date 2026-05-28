import api from '@/lib/api';
import type { Prontuario, ProntuarioCreate, ProntuarioUpdate } from '@/types/prontuario';

export const prontuariosService = {
  list: (skip = 0, limit = 100) =>
    api.get<Prontuario[]>('/prontuarios', { params: { skip, limit } }),
  get: (id: number) => api.get<Prontuario>(`/prontuarios/${id}`),
  byPaciente: (pacienteId: number) =>
    api.get<Prontuario[]>(`/prontuarios/paciente/${pacienteId}`),
  create: (data: ProntuarioCreate) => api.post<Prontuario>('/prontuarios', data),
  update: (id: number, data: ProntuarioUpdate) => api.patch<Prontuario>(`/prontuarios/${id}`, data),
  liberarLaudo: (id: number) => api.patch<Prontuario>(`/prontuarios/${id}/liberar-laudo`),
};
