'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, Shield, Users, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradientButton } from '@/components/ui/GradientButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExcelActions } from '@/components/shared/ExcelActions';
import { usuariosService } from '@/services/usuarios.service';
import { excelService } from '@/services/excel.service';
import { useRole } from '@/hooks/useRole';
import { adminService } from '@/services/admin.service';
import { formatDateTime } from '@/lib/utils';
import type { Usuario } from '@/types/usuario';

const schema = z.object({
  nome: z.string().min(2),
  login: z.string().min(3),
  email: z.string().email(),
  perfil: z.enum(['gestor', 'recepcionista', 'medico', 'paciente']),
  status: z.enum(['ativo', 'inativo']),
  observacao: z.string().optional(),
  modulos_permitidos: z.string().optional(),
  password: z.string().min(6).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

function UsuarioDialog({ usuario, open, onClose }: { usuario?: Usuario; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!usuario;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: usuario
      ? {
          nome: usuario.nome,
          login: usuario.login,
          email: usuario.email,
          perfil: usuario.perfil,
          status: usuario.status,
          observacao: usuario.observacao ?? '',
          modulos_permitidos: (usuario.modulos_permitidos ?? []).join(', '),
        }
      : { perfil: 'recepcionista', status: 'ativo' },
  });

  const createMutation = useMutation({
    mutationFn: usuariosService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); toast.success('Usuário criado!'); onClose(); reset(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro'),
  });

  const updateMutation = useMutation({
    mutationFn: (d: Parameters<typeof usuariosService.update>[1]) => usuariosService.update(usuario!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); toast.success('Atualizado!'); onClose(); },
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: FormData) {
    const payload = {
      ...data,
      password: data.password || undefined,
      observacao: data.observacao || undefined,
      modulos_permitidos: data.modulos_permitidos
        ? data.modulos_permitidos.split(',').map((item) => item.trim()).filter(Boolean)
        : undefined,
    };
    if (isEdit) updateMutation.mutate(payload);
    else {
      if (!data.password) { toast.error('Senha obrigatória'); return; }
      createMutation.mutate(payload as Parameters<typeof usuariosService.create>[0]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <DialogTitle>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Nome <span className="text-red-500">*</span></Label>
              <Input {...register('nome')} className={errors.nome ? 'border-red-300' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label>Login <span className="text-red-500">*</span></Label>
              <Input {...register('login')} disabled={isEdit} />
            </div>
            <div className="space-y-1.5">
              <Label>Perfil <span className="text-red-500">*</span></Label>
              <select {...register('perfil')} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400">
                <option value="gestor">Gestor</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="medico">Médico</option>
                <option value="paciente">Paciente</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" {...register('email')} className={errors.email ? 'border-red-300' : ''} />
            </div>
            <div className="space-y-1.5">
              <Label>Status <span className="text-red-500">*</span></Label>
              <select {...register('status')} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Módulos Permitidos</Label>
              <Input {...register('modulos_permitidos')} placeholder="agenda, cadastro..." />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observação</Label>
              <Input {...register('observacao')} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>
                Senha {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && <span className="text-slate-400 font-normal"> (vazio = manter)</span>}
              </Label>
              <Input type="password" {...register('password')} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <GradientButton type="submit" loading={loading}>{isEdit ? 'Salvar' : 'Criar'}</GradientButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPage() {
  const { isGestor } = useRole();
  const [dialog, setDialog] = useState<{ open: boolean; usuario?: Usuario }>({ open: false });
  const qc = useQueryClient();

  const [modulo, setModulo] = useState('');
  const [resultado, setResultado] = useState('');

  const { data: usuarios = [], isLoading: loadingU } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosService.list().then((r) => r.data),
    enabled: isGestor,
  });

  const { data: logs = [], isLoading: loadingL } = useQuery({
    queryKey: ['logs', modulo, resultado],
    queryFn: () => adminService.logs({ modulo: modulo || undefined, resultado: resultado || undefined, limit: 100 }).then((r) => r.data),
    enabled: isGestor,
  });

  const backupMutation = useMutation({
    mutationFn: adminService.backup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['logs'] });
      toast.success('Backup registrado!');
    },
    onError: () => toast.error('Erro ao registrar backup'),
  });

  return (
    <AppLayout title="Administração" subtitle="Usuários e auditoria" allowedRoles={['gestor']}>
      <PageHeader
        title="Administração"
        subtitle="Gestão de usuários e logs do sistema"
        actions={
          <>
            <ExcelActions module="usuarios" onImported={() => qc.invalidateQueries({ queryKey: ['usuarios'] })} />
            <GradientButton variant="outline" onClick={() => excelService.export('log-auditoria')}>
              <Download className="w-4 h-4" /> Exportar Logs
            </GradientButton>
            <GradientButton onClick={() => backupMutation.mutate()} loading={backupMutation.isPending}>
              <Shield className="w-4 h-4" /> Backup
            </GradientButton>
          </>
        }
      />

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="auditoria">Log de Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios">
          <div className="flex justify-end mb-4">
            <GradientButton onClick={() => setDialog({ open: true })}><Plus className="w-4 h-4" /> Novo Usuário</GradientButton>
          </div>
          <Card className="overflow-hidden">
            {loadingU ? (
              <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : usuarios.length === 0 ? (
              <EmptyState icon={Users} title="Nenhum usuário" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>{['Nome', 'Login', 'Email', 'Perfil', 'Status', 'Último Acesso', ''].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7"><AvatarFallback className="text-xs">{u.nome.charAt(0)}</AvatarFallback></Avatar>
                          <span className="text-sm font-medium text-slate-700">{u.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-slate-500">{u.login}</TableCell>
                      <TableCell className="text-slate-500">{u.email}</TableCell>
                      <TableCell><Badge variant="default" className="capitalize">{u.perfil}</Badge></TableCell>
                      <TableCell><StatusBadge status={u.status} /></TableCell>
                      <TableCell className="text-xs text-slate-400">{u.ultimo_acesso ? formatDateTime(u.ultimo_acesso) : '—'}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-600 hover:bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDialog({ open: true, usuario: u })}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="auditoria">
          <div className="flex gap-3 mb-4">
            <Input placeholder="Filtrar módulo..." value={modulo} onChange={(e) => setModulo(e.target.value)} className="max-w-xs" />
            <select value={resultado} onChange={(e) => setResultado(e.target.value)} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-400">
              <option value="">Todos</option>
              <option value="sucesso">Sucesso</option>
              <option value="falha">Falha</option>
            </select>
          </div>
          <Card className="overflow-hidden">
            {loadingL ? (
              <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : logs.length === 0 ? (
              <EmptyState icon={Shield} title="Nenhum log encontrado" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>{['Data/Hora', 'Usuário', 'Ação', 'Módulo', 'IP', 'Resultado'].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((l, i) => (
                    <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      <TableCell className="text-xs text-slate-500 font-mono">{formatDateTime(l.data_hora)}</TableCell>
                      <TableCell className="text-sm text-slate-700">#{l.usuario_id ?? '—'}</TableCell>
                      <TableCell className="text-sm text-slate-700">{l.acao}</TableCell>
                      <TableCell><Badge variant="secondary">{l.modulo}</Badge></TableCell>
                      <TableCell className="text-xs text-slate-400 font-mono">{l.ip ?? '—'}</TableCell>
                      <TableCell><StatusBadge status={l.resultado} /></TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <UsuarioDialog key={dialog.usuario?.id ?? 'new'} open={dialog.open} usuario={dialog.usuario} onClose={() => setDialog({ open: false })} />
    </AppLayout>
  );
}
