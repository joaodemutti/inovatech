import { useAuthStore } from '@/stores/auth.store';
import type { UserPerfil } from '@/types/auth';

export function useRole() {
  const user = useAuthStore((s) => s.user);
  const perfil = user?.perfil;

  return {
    perfil,
    isGestor: perfil === 'gestor',
    isMedico: perfil === 'medico',
    isRecepcionista: perfil === 'recepcionista',
    isPaciente: perfil === 'paciente',
    can: (...roles: UserPerfil[]) => !!perfil && roles.includes(perfil),
  };
}
