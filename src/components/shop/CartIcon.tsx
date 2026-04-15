'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Props {
  variant?: 'default' | 'mobile';
}

export default function CartIcon({ variant = 'default' }: Props) {
  const { count, hydrated } = useCart();

  // Hasta hidratar mostramos count=0 para evitar mismatch SSR/CSR
  const display = hydrated ? count : 0;

  if (variant === 'mobile') {
    return (
      <Link
        href="/cart"
        className="relative flex items-center gap-2 text-2xl font-semibold text-ofira-text transition-colors hover:text-ofira-violet"
      >
        <ShoppingCart className="size-6" />
        Carrito
        {display > 0 && (
          <span className="ml-1 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-ofira-violet px-2 text-xs font-bold text-white">
            {display}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      aria-label={`Carrito${display > 0 ? ` (${display} artículos)` : ''}`}
      className="relative flex items-center justify-center rounded-lg p-2 text-ofira-text-secondary transition-colors hover:bg-ofira-surface1 hover:text-ofira-violet"
    >
      <ShoppingCart className="size-5" />
      {display > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-ofira-violet px-1 text-[10px] font-bold text-white">
          {display > 99 ? '99+' : display}
        </span>
      )}
    </Link>
  );
}
