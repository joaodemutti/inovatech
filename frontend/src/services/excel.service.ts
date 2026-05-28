import api from '@/lib/api';

type ExportModule =
  | 'pacientes'
  | 'medicos'
  | 'consultas'
  | 'prontuarios'
  | 'financeiro'
  | 'ponto'
  | 'usuarios'
  | 'log-auditoria';

export const excelService = {
  export: async (module: ExportModule) => {
    const response = await api.get(`/excel/export/${module}`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${module}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },

  import: (module: ExportModule, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/excel/import/${module}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
