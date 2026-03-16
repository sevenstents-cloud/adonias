'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag, Building2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

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
  const { role } = useAuth();
  const canEdit = role === 'ADMIN' || role === 'FINANCEIRO';
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
      if (err) { setError(err.message); return; }
      setEditingId(null);
    } else {
      const { error: err } = await supabase.from('categories').insert({
        name: values.name,
        type: values.type || 'DESPESA',
        description: values.description || null,
      });
      if (err) { setError(err.message); return; }
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
// CENTROS DE CUSTO
// ─────────────────────────────────────────────
function CentrosCustoTab() {
  const { role } = useAuth();
  const canEdit = role === 'ADMIN' || role === 'FINANCEIRO';
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
      if (err) { setError(err.message); return; }
      setEditingId(null);
    } else {
      const { error: err } = await supabase.from('cost_centers').insert({
        name: values.name,
        type: values.type || 'GERAL',
        description: values.description || null,
        is_active: true,
      });
      if (err) { setError(err.message); return; }
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
    { key: 'name', label: 'Nome do Centro de Custo', type: 'text' },
    { key: 'type', label: 'Tipo', type: 'select', options: [{ value: 'GERAL', label: 'Geral / Interno' }, { value: 'OBRA', label: 'Obra' }] },
    { key: 'description', label: 'Descrição (opcional)', type: 'text' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          Centros de custo do tipo <strong>Geral</strong> são usados para despesas e receitas internas (administrativo, RH, etc).
          Centros do tipo <strong>Obra</strong> são vinculados a projetos específicos.
        </p>
        {canEdit && (
          <Button size="sm" onClick={() => { setShowAdd(true); setEditingId(null); }} className="flex items-center gap-2 ml-4 shrink-0">
            <Plus className="h-4 w-4" /> Novo Centro
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
                      {c.type === 'OBRA' ? '🏗 Obra' : '🏢 Geral'}
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
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">Nenhum centro de custo cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────
const TABS = [
  { id: 'categorias', label: 'Categorias', icon: Tag },
  { id: 'centros', label: 'Centros de Custo', icon: Building2 },
];

export default function GestaoCadastrosPage() {
  const [activeTab, setActiveTab] = useState('categorias');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cadastros Gerenciais</h1>
        <p className="text-slate-500 mt-1">Gerencie as categorias e centros de custo utilizados nos lançamentos.</p>
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
          {activeTab === 'categorias' ? <CategoriasTab /> : <CentrosCustoTab />}
        </CardContent>
      </Card>
    </div>
  );
}
