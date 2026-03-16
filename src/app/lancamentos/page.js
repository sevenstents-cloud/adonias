'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SlideOver } from '@/components/ui/SlideOver';
import { Search, Plus, Filter, Download } from 'lucide-react';


export default function LancamentosPage() {
  const { user } = useAuth();
  const [slideOpen, setSlideOpen] = useState(false);
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    type: 'DESPESA',
    description: '',
    amount: '',
    due_date: '',
    category_id: '',
    cost_center_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTransacoes = async () => {
    const { data: transData } = await supabase
      .from('transactions')
      .select(`
        id, description, amount, type, status, due_date,
        categories (name),
        cost_centers (name)
      `)
      .order('due_date', { ascending: false });

    if (transData) {
      const formatted = transData.map(t => ({
        id: t.id,
        descricao: t.description,
        categoria: t.categories?.name || 'Sem categoria',
        grupo: t.cost_centers?.name || '-',
        tipo: t.type?.toLowerCase() || 'despesa',
        valor: t.amount,
        data: t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '-',
        status: t.status === 'PENDENTE' ? 'Pendente' : 
                t.status === 'PAGO' ? 'Pago' : 
                t.status === 'RECEBIDO' ? 'Recebido' : 'Cancelado'
      }));
      setTransacoes(formatted);
    }
  };

  useEffect(() => {
    async function fetchData() {
      await fetchTransacoes();

      // Form lookups
      const { data: catData } = await supabase.from('categories').select('id, name');
      if (catData) setCategorias(catData);

      const { data: costData } = await supabase.from('cost_centers').select('id, name');
      if (costData) setCentrosCusto(costData);

      setLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Você precisa estar logado para salvar.');
    
    setSubmitting(true);
    const { error } = await supabase.from('transactions').insert([{
      ...formData,
      amount: parseFloat(formData.amount),
      created_by: user.id
    }]);

    if (error) {
      alert('Erro ao salvar lançamento: ' + error.message);
    } else {
      setFormData({
        type: 'DESPESA',
        description: '',
        amount: '',
        due_date: '',
        category_id: '',
        cost_center_id: ''
      });
      setSlideOpen(false);
      await fetchTransacoes();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lançamentos</h1>
          <p className="text-slate-500 mt-1">Controle suas entradas e saídas financeiras.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setSlideOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar lançamento..."
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Filter className="h-4 w-4" />
                Filtros:
              </div>
              <Select className="w-full sm:w-36">
                <option value="">Mês (Todos)</option>
                <option value="03/2026">Março 2026</option>
                <option value="04/2026">Abril 2026</option>
              </Select>
              <Select className="w-full sm:w-36">
                <option value="">Tipo (Todos)</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </Select>
              <Select className="w-full sm:w-36">
                <option value="">Status (Todos)</option>
                <option value="Pago">Pago/Recebido</option>
                <option value="Pendente">Pendente</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Descrição</th>
                  <th className="px-6 py-4 font-medium">Grupo / Projeto</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacoes.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{t.data}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{t.descricao}</p>
                      <p className="text-xs text-slate-500">{t.categoria}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{t.grupo}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        t.status === 'Pago' || t.status === 'Recebido' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium whitespace-nowrap ${t.tipo === 'receita' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SlideOver
        isOpen={slideOpen}
        onClose={() => setSlideOpen(false)}
        title="Novo Lançamento Financeiro"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tipo de Lançamento</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="type" value="RECEITA" checked={formData.type === 'RECEITA'} onChange={handleChange} className="text-blue-600" />
                <span className="text-sm">Receita</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="type" value="DESPESA" checked={formData.type === 'DESPESA'} onChange={handleChange} className="text-blue-600" />
                <span className="text-sm">Despesa</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <Input required name="description" value={formData.description} onChange={handleChange} placeholder="Ex: Mercado mensal" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
              <Input required type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Vencimento</label>
              <Input required type="date" name="due_date" value={formData.due_date} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Categoria</label>
            <Select required name="category_id" value={formData.category_id} onChange={handleChange}>
              <option value="">Selecione uma categoria...</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Grupo / Projeto</label>
            <Select required name="cost_center_id" value={formData.cost_center_id} onChange={handleChange}>
              <option value="">Selecione um grupo...</option>
              {centrosCusto.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.name}</option>
              ))}
            </Select>
          </div>
          
          <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setSlideOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar Lançamento'}
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}
