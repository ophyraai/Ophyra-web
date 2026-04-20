'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingBag, Ticket, ArrowLeft } from 'lucide-react';

const tabs = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Productos', href: '/admin/products', icon: Package },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Cupones', href: '/admin/coupons', icon: Ticket },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-ofira-card-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-ofira-violet">
            Ophyra
          </Link>
          <span className="rounded-md bg-ofira-violet/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-ofira-violet">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                <Icon
                  className={`size-4 ${
                    isActive ? 'text-ofira-violet' : 'text-ofira-text-secondary'
                  }`}
                />
                <span
                  className={
                    isActive
                      ? 'text-ofira-violet'
                      : 'text-ofira-text-secondary hover:text-ofira-text'
                  }
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="admin-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-ofira-violet"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ofira-text-secondary transition-colors hover:bg-ofira-surface1 hover:text-ofira-text"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </div>
    </nav>
  );
}
