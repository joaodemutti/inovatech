export type LancamentoStatus = 'pago' | 'pendente' | 'atrasado';

export interface Lancamento {
  id: number;
  consulta_id: number | null;
  paciente_id: number;
  medico_id: number | null;
  data: string;
  servico: string;
  convenio: string | null;
  valor: number;
  status: LancamentoStatus;
  forma_pagamento: string | null;
  observacao: string | null;
  created_at: string;
}

export interface LancamentoCreate {
  consulta_id?: number;
  paciente_id: number;
  medico_id?: number;
  data: string;
  servico: string;
  convenio?: string;
  valor: number;
  forma_pagamento?: string;
  observacao?: string;
}

export interface LancamentoUpdate {
  status?: LancamentoStatus;
  forma_pagamento?: string;
  observacao?: string;
  valor?: number;
}

export interface IndicadoresFinanceiros {
  receita_paga: number;
  a_receber: number;
  atrasado: number;
  total_lancado: number;
}
