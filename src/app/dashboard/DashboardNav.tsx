'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, ListChecks, TrendingUp, CalendarDays, UserCircle } from 'lucide-react';

const tabs = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mi Plan', href: '/dashboard/plan', icon: CalendarDays },
  { label: 'Habits', href: '/dashboard/habits', icon: ListChecks },
  { label: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const isAccountActive = pathname.startsWith('/dashboard/account');

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-ofira-card-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-ofira-violet">
          Ophyra
        </Link>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                <Icon className={`size-4 ${isActive ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`} />
                <span className={isActive ? 'text-ofira-violet' : 'text-ofira-text-secondary hover:text-ofira-text'}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="dashboard-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-ofira-violet"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Account icon */}
        <Link
          href="/dashboard/account"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            isAccountActive
              ? 'bg-ofira-violet/10 text-ofira-violet'
              : 'text-ofira-text-secondary hover:bg-ofira-surface1 hover:text-ofira-text'
          }`}
        >
          <UserCircle className="size-5" />
        </Link>
      </div>
    </nav>
  );
}
