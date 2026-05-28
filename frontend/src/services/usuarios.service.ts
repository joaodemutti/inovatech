import api from '@/lib/api';
import type { Usuario, UsuarioCreate, UsuarioUpdate } from '@/types/usuario';

export const usuariosService = {
  list: () => api.get<Usuario[]>('/usuarios'),
  create: (data: UsuarioCreate) => api.post<Usuario>('/usuarios', data),
  update: (id: number, data: UsuarioUpdate) => api.patch<Usuario>(`/usuarios/${id}`, data),
};
