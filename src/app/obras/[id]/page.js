'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, PieChart, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export default function ObraDetailsPage({ params }) {
  // O Next.js recomenda desembrulhar `params` no App Router a partir do Next 15 para Server/Client components
  const { id } = use(params);

  // Mock dados da Obra Específica
  const obra = {
    nome: id === '1' ? 'Residência Alphaville - Lote 14' : `Obra ${id}`,
    cliente: 'João Silva',
    valorContrato: 85000,
    custoMateriais: 45000,
    custoMaoDeObra: 15000,
    custoTotal: 60000,
  };

  const lucroEstimado = obra.valorContrato - obra.custoTotal;
  const margemLucro = (lucroEstimado / obra.valorContrato) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/obras" className="hover:text-slate-900 flex items-center transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Obras
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{obra.nome}</h1>
          <p className="text-slate-500 mt-1">Cliente: {obra.cliente}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Editar Obra</Button>
          <Button>Novo Lançamento (Custo)</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Valor do Contrato</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {obra.valorContrato.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-slate-500">100% faturado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Custos Totais</CardTitle>
            <Wallet className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {obra.custoTotal.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-slate-500">Materiais e Mão de obra</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lucro Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {lucroEstimado.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Margem</CardTitle>
            <PieChart className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {margemLucro.toFixed(1)}%
            </div>
            <div className="w-full bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full" 
                style={{ width: `${margemLucro}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção adicional para listar transações da obra específica seria aqui */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Lançamentos (Esta Obra)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Wallet className="h-10 w-10 text-slate-300 mb-3" />
            <p>Os custos de materiais e receitas lançadas especificamente nesta obra aparecerão aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
