'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag, Building2, Plus, Pencil, Trash2, Check, X, Users, Mail, Shield } from 'lucide-react';

// ── Inline form component ──
function InlineForm({ fields, onSave, onCancel, initialValues = {} }) {
  const [values, setValues] = useState(initialValues);
  const set = (k, v) => setValues(prev => ({ ...prev, [k]: v }));

  return (
    <tr className="bg-blue-50">
      {fields.map(f => (
        <td key={f.key} className="px-4 py-2">
          {f.type === 'select' ? (
            <select
              value={values[f.key] || ''}
              onChange={e => set(f.key, e.target.value)}
              className="h-9 w-full rounded border border-slate-200 bg-white px-2 text-sm outline-none"
            >
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : f.type === 'readonly' ? (
            <span className="text-xs text-slate-400">—</span>
          ) : (
            <Input
              placeholder={f.label}
              value={values[f.key] || ''}
              onChange={e => set(f.key, e.target.value)}
              className="h-9 text-sm"
            />
          )}
        </td>
      ))}
      <td className="px-4 py-2">
        <div className="flex gap-1">
          <button onClick={() => onSave(values)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={onCancel} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────
// CATEGORIAS
// ─────────────────────────────────────────────
function CategoriasTab() {
  const { user } = useAuth();
  const canEdit = !!user; // Qualquer usuário logado pode gerenciar categorias no app pessoal
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('type').order('name');
    setCategorias(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategorias(); }, [fetchCategorias]);

  const handleSave = async (values) => {
    setError('');
    if (!values.name?.trim()) { setError('Nome é obrigatório.'); return; }
    if (editingId) {
      const { error: err } = await supabase.from('categories').update({
        name: values.name,
        type: values.type,
        description: values.description || null,
      }).eq('id', editingId);
      if (err) { setError(`Erro ao atualizar: ${err.message}`); return; }
      setEditingId(null);
    } else {
      const { error: err } = await supabase.from('categories').insert({
        name: values.name,
        type: values.type || 'DESPESA',
        description: values.description || null,
      });
      if (err) { setError(`Erro ao inserir: ${err.message}`); return; }
      setShowAdd(false);
    }
    fetchCategorias();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Excluir a categoria "${name}"?\nAtenção: não é possível excluir categorias que já possuem lançamentos vinculados.`)) return;
    const { error: err } = await supabase.from('categories').delete().eq('id', id);
    if (err) { alert('Erro: ' + err.message); return; }
    fetchCategorias();
  };

  const fields = [
    { key: 'name', label: 'Nome da Categoria', type: 'text' },
    { key: 'type', label: 'Tipo', type: 'select', options: [{ value: 'RECEITA', label: 'Receita' }, { value: 'DESPESA', label: 'Despesa' }] },
    { key: 'description', label: 'Descrição (opcional)', type: 'text' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">Gerencie as categorias usadas na classificação dos lançamentos.</p>
        {canEdit && (
          <Button size="sm" onClick={() => { setShowAdd(true); setEditingId(null); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova Categoria
          </Button>
        )}
      </div>
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              {canEdit && <th className="px-4 py-3 font-medium">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showAdd && canEdit && (
              <InlineForm
                fields={fields}
                initialValues={{ type: 'DESPESA' }}
                onSave={handleSave}
                onCancel={() => setShowAdd(false)}
              />
            )}
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Carregando...</td></tr>
            )}
            {!loading && categorias.map(cat => (
              editingId === cat.id ? (
                <InlineForm
                  key={cat.id}
                  fields={fields}
                  initialValues={cat}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.type === 'RECEITA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.type === 'RECEITA' ? '↑ Receita' : '↓ Despesa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{cat.description || '—'}</td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingId(cat.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            ))}
            {!loading && categorias.length === 0 && !showAdd && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">Nenhuma categoria cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GRUPOS DE GASTOS (Antigos Centros de Custo)
// ─────────────────────────────────────────────
function GruposTab() {
  const { user } = useAuth();
  const canEdit = !!user; // Qualquer usuário logado pode gerenciar grupos no app pessoal
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchCentros = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('cost_centers').select('*').order('type').order('name');
    setCentros(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCentros(); }, [fetchCentros]);

  const handleSave = async (values) => {
    setError('');
    if (!values.name?.trim()) { setError('Nome é obrigatório.'); return; }
    if (editingId) {
      const { error: err } = await supabase.from('cost_centers').update({
        name: values.name,
        type: values.type,
        description: values.description || null,
        is_active: values.is_active !== false,
      }).eq('id', editingId);
      if (err) { setError(`Erro ao atualizar: ${err.message}`); return; }
      setEditingId(null);
    } else {
      const { error: err } = await supabase.from('cost_centers').insert({
        name: values.name,
        type: values.type || 'GERAL',
        description: values.description || null,
        is_active: true,
      });
      if (err) { setError(`Erro ao inserir: ${err.message}`); return; }
      setShowAdd(false);
    }
    fetchCentros();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Excluir o centro de custo "${name}"?\nAtenção: não é possível excluir centros que já possuem lançamentos vinculados.`)) return;
    const { error: err } = await supabase.from('cost_centers').delete().eq('id', id);
    if (err) { alert('Erro: ' + err.message); return; }
    fetchCentros();
  };

  const fields = [
    { key: 'name', label: 'Nome do Grupo', type: 'text' },
    { key: 'type', label: 'Tipo', type: 'select', options: [{ value: 'GERAL', label: 'Grupo de Gastos' }, { value: 'OBRA', label: 'Projeto / Extra' }] },
    { key: 'description', label: 'Descrição (opcional)', type: 'text' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          Os <strong>Grupos</strong> permitem organizar seus gastos em categorias maiores (ex: Fixas, Variáveis, Lazer).
        </p>
        {canEdit && (
          <Button size="sm" onClick={() => { setShowAdd(true); setEditingId(null); }} className="flex items-center gap-2 ml-4 shrink-0">
            <Plus className="h-4 w-4" /> Novo Grupo
          </Button>
        )}
      </div>
      {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {canEdit && <th className="px-4 py-3 font-medium">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showAdd && canEdit && (
              <InlineForm
                fields={fields}
                initialValues={{ type: 'GERAL' }}
                onSave={handleSave}
                onCancel={() => setShowAdd(false)}
              />
            )}
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Carregando...</td></tr>
            )}
            {!loading && centros.map(c => (
              editingId === c.id ? (
                <InlineForm
                  key={c.id}
                  fields={fields}
                  initialValues={c}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.type === 'OBRA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {c.type === 'OBRA' ? '🎯 Projeto' : '📁 Grupo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.description || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingId(c.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            ))}
            {!loading && centros.length === 0 && !showAdd && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Nenhum grupo cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// USUÁRIOS E PERMISSÕES
// ─────────────────────────────────────────────
function UsuariosTab() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    setUsuarios(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleInvite = async (values) => {
    setError('');
    setSuccess('');
    if (!values.email?.trim()) { setError('Email é obrigatório.'); return; }
    
    try {
      const resp = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          role: values.role || 'OPERACIONAL',
          full_name: values.full_name
        })
      });

      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      setSuccess(`Convite enviado para ${values.email}!`);
      setShowAdd(false);
      fetchUsuarios();
    } catch (err) {
      setError(`Erro ao convidar: ${err.message}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (id === currentUser?.id) { alert('Você não pode excluir seu próprio perfil.'); return; }
    if (!confirm(`Remover acesso de "${name}"?`)) return;
    
    // Para excluir um usuário do Auth, precisaríamos de service_role no backend. 
    // Aqui apenas removemos o perfil. O usuário perderá acesso se as RLS exigirem perfil.
    const { error: err } = await supabase.from('profiles').delete().eq('id', id);
    if (err) { alert('Erro: ' + err.message); return; }
    fetchUsuarios();
  };

  const fields = [
    { key: 'full_name', label: 'Nome Completo', type: 'text' },
    { key: 'email', label: 'E-mail para convite', type: 'text' },
    { key: 'role', label: 'Cargo', type: 'select', options: [
      { value: 'ADMIN', label: '👑 Admin' },
      { value: 'FINANCEIRO', label: '💰 Financeiro' },
      { value: 'OPERACIONAL', label: '👷 Operacional' }
    ]},
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-sm text-slate-600">Gerencie quem tem acesso ao sistema e quais são suas permissões.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Convidar Usuário
        </Button>
      </div>

      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
        <X className="h-4 w-4" /> {error}
      </div>}
      {success && <div className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center gap-2">
        <Check className="h-4 w-4" /> {success}
      </div>}

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Cargo</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showAdd && (
              <InlineForm
                fields={fields}
                initialValues={{ role: 'OPERACIONAL' }}
                onSave={handleInvite}
                onCancel={() => setShowAdd(false)}
              />
            )}
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Carregando usuários...</td></tr>
            ) : usuarios.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase">
                      {(u.full_name || u.email || '?')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{u.full_name}</p>
                      <p className="text-xs text-slate-400">Desde {new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    u.role === 'ADMIN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    u.role === 'FINANCEIRO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {u.role === 'ADMIN' ? '👑 Admin' : u.role === 'FINANCEIRO' ? '💰 Financeiro' : '👷 Operacional'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{u.email || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(u.id, u.full_name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Remover Acesso">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'categorias', label: 'Categorias', icon: Tag },
  { id: 'centros', label: 'Grupos', icon: Building2 },
  { id: 'usuarios', label: 'Usuários', icon: Users },
];

export default function GestaoCadastrosPage() {
  const [activeTab, setActiveTab] = useState('categorias');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações Gerenciais</h1>
        <p className="text-slate-500 mt-1">Gerencie as categorias e grupos de gastos financeiros.</p>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex gap-1 border-b border-slate-200 -mx-6 px-6">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {activeTab === 'categorias' ? <CategoriasTab /> : 
           activeTab === 'centros' ? <GruposTab /> : 
           <UsuariosTab />}
        </CardContent>
      </Card>
    </div>
  );
}
