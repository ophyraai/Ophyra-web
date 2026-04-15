'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

interface Props {
  id: string;
  name: string;
  isActive: boolean;
}

export default function ProductRowActions({ id, name, isActive }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useState(isActive);

  async function toggleActive() {
    const next = !optimisticActive;
    setOptimisticActive(next);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      startTransition(() => router.refresh());
    } catch (err) {
      setOptimisticActive(!next);
      alert('No se pudo cambiar el estado: ' + (err as Error).message);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `¿Borrar "${name}"?\n\nSi tiene pedidos históricos se hará soft-delete (queda inactivo). Si no, se borra del todo.`,
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      startTransition(() => router.refresh());
    } catch (err) {
      alert('No se pudo borrar: ' + (err as Error).message);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleActive}
        disabled={pending}
        title={optimisticActive ? 'Desactivar (no aparecerá en /shop)' : 'Activar'}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ofira-text-secondary transition-colors hover:bg-ofira-surface1 hover:text-ofira-text disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : optimisticActive ? (
          <Eye className="size-3.5" />
        ) : (
          <EyeOff className="size-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        title="Borrar"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </>
  );
}
