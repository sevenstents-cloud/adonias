'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  Settings, 
  LogOut,
  Users
} from 'lucide-react';
import { cn } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Obras & Projetos', href: '/obras', icon: Briefcase },
  { name: 'Lançamentos', href: '/lancamentos', icon: Wallet },
  { name: 'Usuários', href: '/admin/users', icon: Users },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, role } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-50 border-r border-slate-200">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <LayoutDashboard className="h-6 w-6 text-zinc-900 mr-2" />
        <span className="text-lg font-bold text-zinc-900 tracking-tight">Financeiro</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            if (item.href === '/admin/users' && role !== 'ADMIN') return null;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-200 text-zinc-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-zinc-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-zinc-900' : 'text-slate-400'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-zinc-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
          Sair
        </button>
      </div>
    </div>
  );
}
