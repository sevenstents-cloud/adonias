'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ShieldCheck, PiggyBank } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Supabase redireciona com tokens no URL hash (#access_token=... &type=recovery)
  // O SDK já trata isso automaticamente via onAuthStateChange
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Sessão de recuperação ativa — usuário pode redefinir a senha
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex items-center space-x-2 text-zinc-900">
        <PiggyBank className="h-8 w-8" />
        <h1 className="text-2xl font-semibold tracking-tight">Meu Bolso</h1>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-10 w-10 text-slate-800 mb-2" />
            <CardTitle className="text-xl">Redefinir Senha</CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              {success ? 'Senha redefinida! Redirecionando...' : 'Escolha uma nova senha para sua conta.'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-md border border-emerald-200 text-center">
              ✅ Senha atualizada com sucesso!<br />Você será redirecionado para o Login em instantes.
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="new-password">
                  Nova Senha
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="confirm-password">
                  Confirmar Nova Senha
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full mt-6" type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Nova Senha'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-slate-500">
        Meu Bolso &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
