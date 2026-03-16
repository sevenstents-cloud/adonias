'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  ShieldAlert, ShieldCheck, Users, UserPlus, Trash2,
  Mail, CheckCircle2, Clock, Key
} from 'lucide-react';
import { listUsersWithStatus, inviteUser, updateUserRole, deleteUser } from '../users/actions';

const ROLE_LABELS = {
  ADMIN: 'Administrador',
  FINANCEIRO: 'Financeiro',
  OPERACIONAL: 'Operacional',
};

export default function SettingsPage() {
  const { user, role } = useAuth();
  const isAdmin = role === 'ADMIN';

  // ---- MFA ----
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [factors, setFactors] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');

  // ---- Users ----
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // ---- Invite form ----
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('OPERACIONAL');
  const [inviteStatus, setInviteStatus] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // ---- Load MFA ----
  useEffect(() => {
    async function loadMfa() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return;
      const totp = data.all.filter(f => f.factor_type === 'totp' && f.status === 'verified');
      setMfaEnabled(totp.length > 0);
      setFactors(totp);
    }
    if (user) loadMfa();
  }, [user]);

  // ---- Load Users (admin only) ----
  const loadUsers = useCallback(async () => {
    if (!user || !isAdmin) return;
    setUsersLoading(true);
    const result = await listUsersWithStatus(user.id);
    if (result.error) setUsersError(result.error);
    else setUsers(result.users);
    setUsersLoading(false);
  }, [user, isAdmin]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ---- MFA Handlers ----
  const handleEnroll = async () => {
    setMfaError(''); setMfaSuccess('');
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) { setMfaError(error.message); return; }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
  };

  const handleVerify = async () => {
    setMfaError('');
    const { data: challengeData, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) { setMfaError(cErr.message); return; }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verifyCode,
    });
    if (vErr) { setMfaError('Código inválido. Tente novamente.'); return; }
    setMfaSuccess('2FA ativado com sucesso!');
    setMfaEnabled(true);
    setQrCode(null);
  };

  const handleUnenroll = async (id) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) { setMfaError(error.message); return; }
    setMfaEnabled(false);
    setFactors(f => f.filter(x => x.id !== id));
    setMfaSuccess('2FA desativado.');
  };

  // ---- User Management Handlers ----
  const handleRoleChange = async (userId, newRole) => {
    const res = await updateUserRole(userId, newRole, user.id);
    if (res.error) alert(res.error);
    else loadUsers();
  };

  const handleDelete = async (userId, email) => {
    if (!confirm(`Excluir o usuário "${email}"? Esta ação é irreversível.`)) return;
    const res = await deleteUser(userId, user.id);
    if (res.error) alert(res.error);
    else loadUsers();
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteStatus('');
    const res = await inviteUser(inviteEmail, inviteRole, inviteName, user.id);
    if (res.error) {
      setInviteStatus(`Erro: ${res.error}`);
    } else {
      setInviteStatus('✅ Convite enviado! O usuário receberá um e-mail para definir sua senha.');
      setInviteEmail(''); setInviteName(''); setInviteRole('OPERACIONAL');
      loadUsers();
    }
    setInviteLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie sua conta e as configurações do sistema.</p>
      </div>

      {/* =========================
          SEÇÃO: 2FA
      ========================= */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mfaEnabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <ShieldAlert className="h-5 w-5 text-yellow-600" />}
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">{mfaError}</div>}
          {mfaSuccess && <div className="text-green-700 text-sm bg-green-50 p-3 rounded-md border border-green-200">{mfaSuccess}</div>}

          {mfaEnabled ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">A autenticação de dois fatores está ativa para sua conta.</p>
              {factors.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-sm font-medium flex items-center gap-2"><Key className="h-4 w-4 text-slate-400" />App Autenticador</span>
                  <Button variant="outline" size="sm" onClick={() => handleUnenroll(f.id)}>Remover</Button>
                </div>
              ))}
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">1. Escaneie o QR code com Google Authenticator, Authy ou similar.</p>
              <div className="flex justify-center p-4 bg-white rounded-md border border-slate-200">
                <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
              </div>
              <p className="text-sm text-slate-600">2. Digite o código de 6 dígitos gerado pelo app.</p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  maxLength={6}
                  className="text-center tracking-widest font-mono"
                />
                <Button onClick={handleVerify}>Confirmar</Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Adicione uma camada extra de segurança exigindo um código do app autenticador no login.
              </p>
              <Button onClick={handleEnroll} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />Ativar 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =========================
          SEÇÃO: GESTÃO DE USUÁRIOS (só ADMIN)
      ========================= */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                Gerenciamento de Usuários
              </CardTitle>
              <Button size="sm" onClick={() => setShowInvite(v => !v)} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {showInvite ? 'Cancelar' : 'Convidar Usuário'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Formulário de convite */}
            {showInvite && (
              <form onSubmit={handleInvite} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Enviar convite por e-mail
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Nome completo</label>
                    <Input
                      placeholder="Nome do usuário"
                      value={inviteName}
                      onChange={e => setInviteName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">E-mail</label>
                    <Input
                      type="email"
                      placeholder="email@empresa.com.br"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Nível de Acesso</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="FINANCEIRO">Financeiro</option>
                    <option value="OPERACIONAL">Operacional</option>
                  </select>
                </div>
                {inviteStatus && (
                  <div className={`text-sm p-3 rounded-md border ${inviteStatus.startsWith('Erro') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {inviteStatus}
                  </div>
                )}
                <Button type="submit" disabled={inviteLoading} className="w-full">
                  {inviteLoading ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </form>
            )}

            {/* Lista de usuários */}
            {usersError && <div className="text-red-600 text-sm">{usersError}</div>}
            {usersLoading ? (
              <div className="text-sm text-slate-500 text-center py-4">Carregando usuários...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="pb-3 font-medium">Usuário</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Acesso</th>
                      <th className="pb-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-slate-900">{u.full_name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="py-3 pr-4">
                          {u.confirmed ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                              <Clock className="h-3 w-3" /> Aguardando
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user?.id}
                            className="h-8 rounded border border-slate-200 bg-white px-2 text-xs text-slate-800 outline-none disabled:opacity-50"
                          >
                            <option value="ADMIN">Administrador</option>
                            <option value="FINANCEIRO">Financeiro</option>
                            <option value="OPERACIONAL">Operacional</option>
                          </select>
                        </td>
                        <td className="py-3 text-right">
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDelete(u.id, u.email)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Excluir usuário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
