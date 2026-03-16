'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingDown, Plus, PiggyBank } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [contas, setContas] = useState([]);
  const [totais, setTotais] = useState({ saldo: 0, receitasMes: 0, despesasMes: 0, aReceber: 0 });

  useEffect(() => {
    async function fetchDashboard() {
      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Totais do mês atual
      const { data: txMes } = await supabase
        .from('transactions')
        .select('amount, type, status')
        .gte('due_date', inicioMes)
        .lte('due_date', fimMes);

      if (txMes) {
        const receitas = txMes
          .filter(t => t.type === 'RECEITA' && (t.status === 'RECEBIDO' || t.status === 'PAGO'))
          .reduce((a, t) => a + Number(t.amount), 0);
        const despesas = txMes
          .filter(t => t.type === 'DESPESA' && (t.status === 'PAGO' || t.status === 'RECEBIDO'))
          .reduce((a, t) => a + Number(t.amount), 0);
        const aReceber = txMes
          .filter(t => t.status === 'PENDENTE')
          .reduce((a, t) => a + Number(t.amount), 0);
        setTotais({ saldo: receitas - despesas, receitasMes: receitas, despesasMes: despesas, aReceber });
      }

      // Próximos vencimentos
      const { data: transData } = await supabase
        .from('transactions')
        .select('id, description, amount, type, due_date, status')
        .eq('status', 'PENDENTE')
        .order('due_date', { ascending: true })
        .limit(6);

      setContas(transData?.map(t => ({
        id: t.id,
        descricao: t.description,
        valor: t.amount,
        data: t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
        tipo: t.type?.toLowerCase() || 'despesa',
      })) || []);

      // Gráfico dos últimos 6 meses (placeholder — aguarda RPC)
      const meses = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        meses.push({ name: d.toLocaleString('pt-BR', { month: 'short' }), receitas: 0, despesas: 0 });
      }
      setData(meses);
    }
    fetchDashboard();
  }, []);

  const fmt = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
          <p className="text-slate-500 mt-1">Seu resumo financeiro pessoal do mês.</p>
        </div>
        <Button onClick={() => router.push('/lancamentos')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo do Mês</CardTitle>
            <PiggyBank className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {fmt(totais.saldo)}
            </div>
            <p className="text-xs text-slate-500">Receitas – Despesas pagas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Receitas (Mês)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ {fmt(totais.receitasMes)}</div>
            <p className="text-xs text-slate-500">Total recebido no mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Gastos (Mês)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {fmt(totais.despesasMes)}</div>
            <p className="text-xs text-slate-500">Total pago no mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Pagar / Receber</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ {fmt(totais.aReceber)}</div>
            <p className="text-xs text-slate-500">Lançamentos pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico + Próximos Vencimentos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Fluxo dos Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `R$${v / 1000}k`} dx={-10} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contas.length === 0 ? (
                <div className="text-center text-slate-400 py-8 text-sm">
                  🎉 Nenhuma conta pendente por aqui!
                </div>
              ) : (
                contas.map(conta => (
                  <div key={conta.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-full ${conta.tipo === 'receita' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {conta.tipo === 'receita' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-1">{conta.descricao}</p>
                        <p className="text-xs text-slate-500">{conta.data}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold whitespace-nowrap ml-2 ${conta.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {conta.tipo === 'receita' ? '+' : '-'} R$ {fmt(conta.valor)}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/lancamentos')}>
              Ver Todos os Lançamentos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
