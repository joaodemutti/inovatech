'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Activity, Lock, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

const schema = z.object({
  login: z.string().min(1, 'Login obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    try {
      await authService.login(data);
      const me = await authService.me();
      setUser(me.data);
      toast.success(`Bem-vindo, ${me.data.nome}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Credenciais inválidas';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #1e3a8a 60%, #0c4a6e 100%)',
        }}
      />

      {/* Floating orbs */}
      {[
        { size: 400, top: '-10%', left: '-10%', color: 'rgba(124,58,237,0.3)' },
        { size: 300, bottom: '-5%', right: '-5%', color: 'rgba(59,130,246,0.3)' },
        { size: 200, top: '50%', left: '60%', color: 'rgba(168,85,247,0.2)' },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{ width: orb.size, height: orb.size, background: orb.color, ...orb }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #3b82f6)' }}
          >
            <Activity className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">INOVATECH</h1>
          <p className="text-indigo-300 text-sm mt-1">Clínica Vida Plena</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Login field */}
          <div>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                errors.login
                  ? 'border-red-400 bg-red-500/10'
                  : 'border-white/20 bg-white/10 focus-within:border-purple-400 focus-within:bg-white/15'
              }`}
            >
              <User className="w-4 h-4 text-indigo-300 shrink-0" />
              <input
                {...register('login')}
                placeholder="Login"
                autoComplete="username"
                className="flex-1 bg-transparent text-white placeholder:text-indigo-400 outline-none text-sm"
              />
            </div>
            {errors.login && (
              <p className="text-red-400 text-xs mt-1 ml-1">{errors.login.message}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                errors.password
                  ? 'border-red-400 bg-red-500/10'
                  : 'border-white/20 bg-white/10 focus-within:border-purple-400 focus-within:bg-white/15'
              }`}
            >
              <Lock className="w-4 h-4 text-indigo-300 shrink-0" />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="Senha"
                autoComplete="current-password"
                className="flex-1 bg-transparent text-white placeholder:text-indigo-400 outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-indigo-300 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/20 border border-red-400/30"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </motion.button>
        </form>

        <p className="text-center text-indigo-400 text-xs mt-6">
          INOVATECH © 2026 — SENAI Mariano Ferraz
        </p>
      </motion.div>
    </div>
  );
}
