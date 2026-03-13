'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Briefcase, Search, Plus } from 'lucide-react';

const obras = [
  { id: '1', nome: 'Residência Alphaville - Lote 14', cliente: 'João Silva', dataInicio: '10/01/2026', status: 'Em Andamento', valor: 85000 },
  { id: '2', nome: 'Edifício Comercial Center', cliente: 'Construtora ABC', dataInicio: '05/02/2026', status: 'Planejamento', valor: 240000 },
  { id: '3', nome: 'Reforma Apto 402', cliente: 'Maria Oliveira', dataInicio: '20/02/2026', status: 'Atrasado', valor: 15500 },
  { id: '4', nome: 'Galpão Logístico', cliente: 'Logística SA', dataInicio: '01/11/2025', status: 'Concluído', valor: 120000 },
];

export default function ObrasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Obras e Projetos</h1>
          <p className="text-slate-500 mt-1">Gerencie os centros de custo e acompanhe a rentabilidade de cada obra.</p>
        </div>
        <Button className="flex items-center gap-2">
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
    </div>
  );
}
