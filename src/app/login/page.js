'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (showMfa) {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) {
        setError(challengeError.message);
        setLoading(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: mfaCode,
      });

      if (verifyError) {
        setError('Código inválido. Tente novamente.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      return;
    }

    const { data: authData, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Checar se o usuário tem MFA ativado
    if (authData?.user) {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        setError(factorsError.message);
        setLoading(false);
        return;
      }

      const totpFactors = factors.all.filter(f => f.factor_type === 'totp' && f.status === 'verified');
      if (totpFactors.length > 0) {
        setFactorId(totpFactors[0].id);
        setShowMfa(true);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex items-center space-x-2 text-zinc-900">
        <LayoutDashboard className="h-8 w-8" />
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          {showMfa ? (
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-10 w-10 text-slate-800 mb-2" />
              <CardTitle className="text-xl">Verificação em Duas Etapas</CardTitle>
              <p className="text-sm text-slate-500 mt-2">
                Abra seu aplicativo autenticador e digite o código de 6 dígitos.
              </p>
            </div>
          ) : (
            <>
              <CardTitle className="text-xl">Fazer Login</CardTitle>
              <p className="text-sm text-slate-500 mt-2">
                Insira suas credenciais para acessar sua conta
              </p>
            </>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 text-center">
                {error}
              </div>
            )}
            
            {!showMfa ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="email">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="password">
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2 text-center mt-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="mfa">
                  Código de Autenticação (6 dígitos)
                </label>
                <Input
                  id="mfa"
                  type="text"
                  placeholder="000 000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  maxLength={6}
                  required
                  className="text-center text-lg tracking-widest font-mono py-6"
                  autoFocus
                />
              </div>
            )}

            <Button
              className="w-full mt-6"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-center text-sm text-slate-500">
        Gestão de Esquadrias &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
