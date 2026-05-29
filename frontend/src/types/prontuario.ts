export interface Prontuario {
  id: number;
  paciente_id: number;
  medico_id: number;
  data: string;
  cid: string;
  diagnostico: string;
  prescricao: string;
  retorno_em_dias: number;
  laudo_liberado: boolean;
  created_at: string;
  paciente_nome?: string;
  medico_nome?: string;
}

export interface ProntuarioCreate {
  paciente_id: number;
  medico_id?: number;
  data: string;
  cid: string;
  diagnostico: string;
  prescricao: string;
  retorno_em_dias?: number;
}

export interface ProntuarioUpdate {
  cid?: string;
  diagnostico?: string;
  prescricao?: string;
  retorno_em_dias?: number;
}
