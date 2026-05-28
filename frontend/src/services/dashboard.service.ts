import api from '@/lib/api';
import type { DashboardIndicadores } from '@/types/dashboard';

export const dashboardService = {
  indicadores: () => api.get<DashboardIndicadores>('/dashboard/indicadores'),
};
