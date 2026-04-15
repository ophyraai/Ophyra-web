'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard, FileText, Package } from 'lucide-react';

const tabs = [
  { label: 'Mi Cuenta', href: '/dashboard/account', icon: User, exact: true },
  { label: 'Editar Perfil', href: '/dashboard/account/profile', icon: User },
  { label: 'Pedidos', href: '/dashboard/account/orders', icon: Package },
  { label: 'Pagos', href: '/dashboard/account/payments', icon: CreditCard },
  { label: 'Diagnósticos', href: '/dashboard/account/diagnoses', icon: FileText },
];

export default function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="card-elevated mb-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 border-b px-4 py-3 text-sm font-medium transition-colors sm:border-b-0 sm:border-r last:border-0 ${
                isActive
                  ? 'bg-ofira-violet/5 text-ofira-violet'
                  : 'text-ofira-text-secondary hover:bg-ofira-surface1 hover:text-ofira-text'
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
