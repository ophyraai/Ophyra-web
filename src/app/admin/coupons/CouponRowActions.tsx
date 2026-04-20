'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Power, Trash2, Loader2 } from 'lucide-react';

interface Props {
  id: string;
  code: string;
  active: boolean;
}

export default function CouponRowActions({ id, code, active }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    setBusy(true);
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function softDelete() {
    if (!confirm(`¿Desactivar y archivar el cupón "${code}"?`)) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/coupons/${id}/edit`}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ofira-text-secondary hover:bg-ofira-surface1 hover:text-ofira-text"
      >
        <Pencil className="size-3.5" />
        Editar
      </Link>
      <button
        type="button"
        onClick={toggleActive}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ofira-text-secondary hover:bg-ofira-surface1 hover:text-ofira-text disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Power className="size-3.5" />
        )}
        {active ? 'Desactivar' : 'Activar'}
      </button>
      <button
        type="button"
        onClick={softDelete}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
        Archivar
      </button>
    </div>
  );
}
