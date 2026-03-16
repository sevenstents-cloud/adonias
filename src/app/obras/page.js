'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlideOver } from '@/components/ui/SlideOver';
import { Briefcase, Search, Plus } from 'lucide-react';

export default function ObrasPage() {
  const { user } = useAuth();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideOpen, setSlideOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    client_name: '',
    contract_value: '',
    start_date: '',
    expected_end_date: ''
  });

  const fetchObras = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id, client_name, start_date, status, contract_value,
        cost_centers (name)
      `);
      
    if (!error && data) {
      const formatted = data.map(p => ({
        id: p.id,
        nome: p.cost_centers?.name || 'Obra sem nome',
        cliente: p.client_name,
        dataInicio: p.start_date ? new Date(p.start_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-',
        status: p.status === 'EM_ANDAMENTO' ? 'Em Andamento' : p.status,
        valor: p.contract_value || 0
      }));
      setObras(formatted);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchObras();
      setLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Você precisa estar logado para salvar.');
    
    setSubmitting(true);
    
    // 1. Create cost_center
    const { data: ccData, error: ccError } = await supabase
      .from('cost_centers')
      .insert([{
        name: formData.nome,
        type: 'OBRA',
        description: `Centro de custo da obra: ${formData.nome}`
      }])
      .select('id')
      .single();
      
    if (ccError) {
      alert('Erro ao criar centro de custo: ' + ccError.message);
      setSubmitting(false);
      return;
    }
    
    // 2. Create project
    const { error: projError } = await supabase
      .from('projects')
      .insert([{
        cost_center_id: ccData.id,
        client_name: formData.client_name,
        contract_value: parseFloat(formData.contract_value || 0),
        start_date: formData.start_date || null,
        expected_end_date: formData.expected_end_date || null,
        status: 'EM_ANDAMENTO'
      }]);
      
    if (projError) {
      alert('Erro ao criar obra: ' + projError.message);
    } else {
      setFormData({
        nome: '',
        client_name: '',
        contract_value: '',
        start_date: '',
        expected_end_date: ''
      });
      setSlideOpen(false);
      await fetchObras();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Obras e Projetos</h1>
          <p className="text-slate-500 mt-1">Gerencie os centros de custo e acompanhe a rentabilidade de cada obra.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setSlideOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Obra
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por nome ou cliente..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none">
                <option value="">Status (Todos)</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-y border-slate-200 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome / Cliente</th>
                  <th className="px-6 py-4 font-medium text-center">Início</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Valor do Contrato</th>
                  <th className="px-6 py-4 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {obras.map((obra) => (
                  <tr key={obra.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-md">
                          <Briefcase className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{obra.nome}</p>
                          <p className="text-xs text-slate-500">{obra.cliente}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">{obra.dataInicio}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        obra.status === 'Em Andamento' ? 'bg-blue-100 text-blue-700' :
                        obra.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' :
                        obra.status === 'Atrasado' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {obra.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">
                      R$ {obra.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/obras/${obra.id}`}>
                        <Button variant="outline" size="sm">Acessar</Button>
                      </Link>
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
        title="Nova Obra"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome da Obra</label>
            <Input required name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Edifício Central" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Cliente</label>
            <Input required name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Ex: Construtora ABC" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Valor do Contrato (R$)</label>
            <Input required type="number" step="0.01" name="contract_value" value={formData.contract_value} onChange={handleChange} placeholder="0.00" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Início</label>
              <Input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Previsão Fim</label>
              <Input type="date" name="expected_end_date" value={formData.expected_end_date} onChange={handleChange} />
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setSlideOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar Obra'}
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}
