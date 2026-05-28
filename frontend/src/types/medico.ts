export interface Medico {
  id: number;
  pessoa_id: number;
  nome_completo: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  status: 'ativo' | 'inativo';
  crm: string;
  especialidade: string;
  data_formatura: string | null;
}

export interface MedicoCreate {
  nome_completo: string;
  cpf: string;
  telefone?: string;
  email?: string;
  crm: string;
  especialidade: string;
  data_formatura?: string;
}

export interface MedicoUpdate {
  nome_completo?: string;
  telefone?: string;
  email?: string;
  especialidade?: string;
  data_formatura?: string;
  status?: 'ativo' | 'inativo';
}
