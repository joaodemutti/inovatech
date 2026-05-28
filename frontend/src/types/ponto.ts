export type PontoSituacao = 'normal' | 'atraso' | 'falta' | 'h_extra';

export interface RegistroPonto {
  id: number;
  usuario_id: number;
  data: string;
  entrada: string | null;
  saida: string | null;
  h_trabalhadas: number | null;
  h_esperadas: number;
  diferenca: number | null;
  situacao: PontoSituacao | null;
}

export interface PontoCreate {
  usuario_id: number;
  data: string;
  entrada?: string;
  saida?: string;
  h_esperadas?: number;
}

export interface PontoUpdate {
  entrada?: string;
  saida?: string;
  h_esperadas?: number;
}

export interface TotaisPonto {
  total_registros: number;
  total_horas_trabalhadas: number;
  total_horas_esperadas: number;
  total_diferenca: number;
  faltas: number;
  atrasos: number;
  horas_extras: number;
  normais: number;
}
