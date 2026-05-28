export interface Paciente {
  id: number;
  pessoa_id: number;
  nome_completo: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  status: 'ativo' | 'inativo';
  data_nascimento: string | null;
  convenio: string | null;
  endereco: string | null;
}

export interface PacienteCreate {
  nome_completo: string;
  cpf: string;
  telefone?: string;
  email?: string;
  data_nascimento?: string;
  convenio?: string;
  endereco?: string;
}

export interface PacienteUpdate {
  nome_completo?: string;
  telefone?: string;
  email?: string;
  data_nascimento?: string;
  convenio?: string;
  endereco?: string;
  status?: 'ativo' | 'inativo';
}
