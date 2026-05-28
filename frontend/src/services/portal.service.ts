import api from '@/lib/api';
import type { Consulta } from '@/types/consulta';
import type { Prontuario } from '@/types/prontuario';

export const portalService = {
  consultas: () => api.get<Consulta[]>('/portal/consultas'),
  laudos: () => api.get<Prontuario[]>('/portal/laudos'),
  downloadLaudo: (id: number) => api.get(`/portal/laudos/${id}/download`),
};
