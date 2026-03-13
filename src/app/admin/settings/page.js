'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [factors, setFactors] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadMfaStatus() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        console.error(error);
        return;
      }
      const totpFactors = data.all.filter((f) => f.factor_type === 'totp' && f.status === 'verified');
      setMfaEnabled(totpFactors.length > 0);
      setFactors(totpFactors);
    }
    if (user) loadMfaStatus();
  }, [user]);

  const handleEnroll = async () => {
    setError('');
    setSuccess('');
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });

    if (error) {
      setError(error.message);
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
  };

  const handleVerify = async () => {
    setError('');
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });
    if (error) {
      setError(error.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: data.id,
      code: verifyCode,
    });

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setSuccess('MFA ativado com sucesso!');
    setMfaEnabled(true);
    setQrCode(null);
  };

  const handleUnenroll = async (id) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) {
      setError(error.message);
      return;
    }
    setMfaEnabled(false);
    setFactors(factors.filter(f => f.id !== id));
    setSuccess('MFA desativado.');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Configurações</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {mfaEnabled ? (
              <ShieldCheck className="h-6 w-6 text-green-600" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-yellow-600" />
            )}
            <span>Autenticação de Dois Fatores (2FA)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          {mfaEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                A autenticação de dois fatores está ativa para sua conta.
              </p>
              {factors.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-sm font-medium">App Autenticador</span>
                  <Button variant="outline" size="sm" onClick={() => handleUnenroll(f.id)}>
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                1. Escaneie este QR code com um aplicativo autenticador (Google Authenticator, Authy, etc).
              </p>
              <div className="flex justify-center p-4 bg-white rounded-md border border-slate-200">
                <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
              </div>
              <p className="text-sm text-slate-600">
                2. Insira o código de 6 dígitos gerado pelo aplicativo.
              </p>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  maxLength={6}
                />
                <Button onClick={handleVerify}>Confirmar</Button>
              </div>
            </div>
          ) : (
             <div>
               <p className="text-sm text-slate-600 mb-4">
                 Adicione uma camada extra de segurança à sua conta exigindo um código de um aplicativo autenticador ao fazer login.
               </p>
               <Button onClick={handleEnroll}>Ativar 2FA</Button>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
