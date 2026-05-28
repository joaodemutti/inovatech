export type ConsultaStatus = 'agendada' | 'confirmada' | 'realizada' | 'cancelada';

export interface Consulta {
  id: number;
  paciente_id: number;
  medico_id: number;
  data: string;
  horario: string;
  tipo_consulta: string;
  convenio: string | null;
  valor: number;
  status: ConsultaStatus;
  created_at: string;
  paciente_nome?: string;
  medico_nome?: string;
}

export interface ConsultaCreate {
  paciente_id: number;
  medico_id: number;
  data: string;
  horario: string;
  tipo_consulta: string;
  convenio?: string;
  valor: number;
}

export interface ConsultaUpdate {
  data?: string;
  horario?: string;
  tipo_consulta?: string;
  convenio?: string;
  valor?: number;
  status?: ConsultaStatus;
}
