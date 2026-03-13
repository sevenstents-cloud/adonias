'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SlideOver } from '@/components/ui/SlideOver';
import { Search, Plus, Filter, Download } from 'lucide-react';

const transacoes = [
  { id: '1', descricao: 'Compra de Perfis de Alumínio', categoria: 'Material', obra: 'Residência Alphaville', tipo: 'despesa', valor: 15400, data: '12/03/2026', status: 'Pago' },
  { id: '2', descricao: 'Sinal de Contrato - Vidros', categoria: 'Venda', obra: 'Residência Alphaville', tipo: 'receita', valor: 35000, data: '10/03/2026', status: 'Recebido' },
  { id: '3', descricao: 'Energia Elétrica', categoria: 'Despesa Fixa', obra: '-', tipo: 'despesa', valor: 450, data: '15/03/2026', status: 'Pendente' },
  { id: '4', descricao: 'Pagamento Mão de Obra', categoria: 'Mão de Obra', obra: 'Edifício Comercial Center', tipo: 'despesa', valor: 12000, data: '20/03/2026', status: 'Pendente' },
  { id: '5', descricao: 'Parcela 2 - Instalação', categoria: 'Venda', obra: 'Edifício Comercial Center', tipo: 'receita', valor: 50000, data: '05/04/2026', status: 'A Receber' },
];

export default function LancamentosPage() {
  const [slideOpen, setSlideOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lançamentos</h1>
          <p className="text-slate-500 mt-1">Contas a pagar, contas a receber e fluxo de caixa.</p>
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
                  <th className="px-6 py-4 font-medium">Obra / Centro de Custo</th>
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
                    <td className="px-6 py-4 text-slate-600">{t.obra}</td>
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
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSlideOpen(false); }}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tipo de Lançamento</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="tipo" value="receita" className="text-blue-600" />
                <span className="text-sm">Receita</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="tipo" value="despesa" defaultChecked className="text-blue-600" />
                <span className="text-sm">Despesa</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <Input required placeholder="Ex: Compra de Vidros Temperados" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
              <Input required type="number" step="0.01" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data de Vencimento</label>
              <Input required type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Categoria</label>
            <Select>
              <option>Material Operacional</option>
              <option>Mão de Obra</option>
              <option>Despesa Fixa (Escritório)</option>
              <option>Receita de Venda/Contrato</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Obra / Centro de Custo (Opcional)</label>
            <Select>
              <option value="">Geral</option>
              <option>Residência Alphaville - Lote 14</option>
              <option>Edifício Comercial Center</option>
            </Select>
          </div>
          
          <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setSlideOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Lançamento
            </Button>
          </div>
        </form>
      </SlideOver>
    </div>
  );
}
