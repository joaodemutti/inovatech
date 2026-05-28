import api from '@/lib/api';
import type { LogAuditoria } from '@/types/usuario';

interface LogFilters {
  usuario_id?: number;
  modulo?: string;
  resultado?: string;
  skip?: number;
  limit?: number;
}

export const adminService = {
  logs: (filters?: LogFilters) =>
    api.get<LogAuditoria[]>('/admin/log-auditoria', { params: filters }),
  backup: () => api.get('/admin/backup'),
};
