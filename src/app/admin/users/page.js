'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { updateUserRole } from './actions';
import { Shield, ShieldAlert } from 'lucide-react';

export default function UsersAdminPage() {
  const { user, role, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      if (role === 'ADMIN') {
        fetchProfiles();
      } else {
        setLoading(false);
      }
    }
  }, [role, authLoading]);

  const handleRoleChange = async (userId, newRole) => {
    if (confirm('Deseja realmente alterar o nível de acesso deste usuário?')) {
      const result = await updateUserRole(userId, newRole, user.id);
      if (result.error) {
        alert(result.error);
      } else {
        alert('Perfil atualizado com sucesso!');
        fetchProfiles();
      }
    }
  };

  if (authLoading || loading) return <div className="p-6">Carregando usuários...</div>;

  if (role !== 'ADMIN') {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center mt-20">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Acesso Negado</h2>
        <p className="text-slate-500 mt-2">Você não tem permissão para acessar a Gestão de Usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-1">Gerencie os acessos e permissões da equipe no sistema.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome do Usuário</th>
                  <th className="px-6 py-4 font-medium">Data de Cadastro</th>
                  <th className="px-6 py-4 font-medium">Nível de Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <Shield className={`h-4 w-4 ${p.role === 'ADMIN' ? 'text-purple-600' : p.role === 'FINANCEIRO' ? 'text-blue-600' : 'text-slate-600'}`} />
                        </div>
                        {p.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={p.role} 
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        disabled={p.id === user?.id}
                        className="flex h-10 w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none disabled:opacity-50 disabled:bg-slate-50"
                      >
                        <option value="ADMIN">Administrador</option>
                        <option value="FINANCEIRO">Financeiro</option>
                        <option value="OPERACIONAL">Operacional</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
