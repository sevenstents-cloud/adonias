'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from './Button';

export function SlideOver({ isOpen, onClose, title, children, className }) {
  // Previne rolagem do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className={cn('pointer-events-auto w-screen max-w-md transform transition ease-in-out duration-300 translate-x-0', className)}>
            <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
              <div className="px-6 py-6 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
                  <div className="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      className="rounded-md bg-white text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Fechar painel</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative flex-1 px-6 py-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
