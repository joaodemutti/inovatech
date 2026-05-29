import type { UserPerfil, UserStatus } from './auth';

export interface Usuario {
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

export interface UsuarioCreate {
  nome: string;
  perfil: UserPerfil;
  login: string;
  email: string;
  password: string;
  status?: UserStatus;
  modulos_permitidos?: string[];
  observacao?: string;
}

export interface UsuarioUpdate {
  nome?: string;
  perfil?: UserPerfil;
  email?: string;
  status?: UserStatus;
  modulos_permitidos?: string[];
  observacao?: string;
  password?: string;
}

export interface LogAuditoria {
  id: number;
  data_hora: string;
  usuario_id: number | null;
  acao: string;
  modulo: string;
  ip: string | null;
  resultado: 'sucesso' | 'falha';
  detalhes: string | null;
}
