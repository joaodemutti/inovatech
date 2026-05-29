'use client';

import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { GradientButton } from '@/components/ui/GradientButton';
import { excelService, type ExportModule, type ImportModule } from '@/services/excel.service';

interface ExcelActionsProps {
  module: ImportModule;
  exportModule?: ExportModule;
  onImported?: () => void;
}

export function ExcelActions({ module, exportModule = module, onImported }: ExcelActionsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleExport() {
    setIsPending(true);
    try {
      await excelService.export(exportModule);
    } catch {
      toast.error('Erro ao exportar Excel');
    } finally {
      setIsPending(false);
    }
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setIsPending(true);
    try {
      const { data } = await excelService.import(module, file);
      if (data.erros.length) {
        toast.warning(`${data.importados} importados, ${data.erros.length} erro(s)`);
      } else {
        toast.success(`${data.importados} registro(s) importado(s)`);
      }
      onImported?.();
    } catch (error: unknown) {
      toast.error((error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao importar Excel');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
      setIsPending(false);
    }
  }

  return (
    <>
      <GradientButton variant="outline" onClick={handleExport} disabled={isPending}>
        <Download className="w-4 h-4" /> Exportar
      </GradientButton>
      <GradientButton variant="outline" onClick={() => inputRef.current?.click()} disabled={isPending}>
        <Upload className="w-4 h-4" /> Importar
      </GradientButton>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </>
  );
}
