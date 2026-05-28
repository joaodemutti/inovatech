export type UserPerfil = 'gestor' | 'recepcionista' | 'medico' | 'paciente';
export type UserStatus = 'ativo' | 'inativo';

export interface User {
  id: number;
  nome: string;
  perfil: UserPerfil;
  login: string;
  email: string;
  status: UserStatus;
  ultimo_acesso: string | null;
  modulos_permitidos: string[] | null;
  observacao: string | null;
  created_at: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}
