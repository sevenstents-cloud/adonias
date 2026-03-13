'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function MainLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-slate-50 border-b border-slate-200 p-4 absolute top-0 w-full z-20">
        <span className="text-lg font-bold text-zinc-900">Financeiro</span>
        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 flex">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex w-64 flex-col bg-white">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
