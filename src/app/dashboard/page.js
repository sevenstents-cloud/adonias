'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from 'lucide-react';

const data = [
  { name: 'Jan', receitas: 40000, despesas: 24000 },
  { name: 'Fev', receitas: 30000, despesas: 13980 },
  { name: 'Mar', receitas: 20000, despesas: 9800 },
  { name: 'Abr', receitas: 27800, despesas: 3908 },
  { name: 'Mai', receitas: 18900, despesas: 4800 },
  { name: 'Jun', receitas: 23900, despesas: 3800 },
];

const contas = [
  { id: 1, descricao: 'Fornecedor Alumínios SA', valor: -4500, data: '15 Mar 2026', tipo: 'despesa' },
  { id: 2, descricao: 'Pagamento Obra XPTO', valor: 12000, data: '18 Mar 2026', tipo: 'receita' },
  { id: 3, descricao: 'Energia Elétrica', valor: -450, data: '20 Mar 2026', tipo: 'despesa' },
  { id: 4, descricao: 'Instalação Vidros ABC', valor: 8500, data: '22 Mar 2026', tipo: 'receita' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral do fluxo de caixa e saúde financeira.</p>
        </div>
        <Button>Novo Lançamento</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-slate-500">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Receitas (Mês)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ 23.900,00</div>
            <p className="text-xs text-slate-500">12 projetos faturados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Despesas (Mês)</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 13.800,00</div>
            <p className="text-xs text-slate-500">Custo operacional e materiais</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 54.000,00</div>
            <p className="text-xs text-slate-500">Próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Fluxo de Caixa (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesas" />
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
            <div className="space-y-4">
              {contas.map((conta) => (
                <div key={conta.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${conta.tipo === 'receita' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {conta.tipo === 'receita' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{conta.descricao}</p>
                      <p className="text-xs text-slate-500">{conta.data}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${conta.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {conta.tipo === 'receita' ? '+' : '-'} R$ {Math.abs(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-6">
              Ver Todos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
