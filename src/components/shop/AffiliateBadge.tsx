import { Tag } from 'lucide-react';

interface Props {
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * Aviso obligatorio (DSA + RDL 24/2021) sobre enlaces de afiliación.
 * Debe ser visible ANTES de que el usuario haga click en el enlace,
 * no enterrado en una página legal.
 */
export default function AffiliateBadge({ variant = 'compact', className }: Props) {
  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ${className || ''}`}
      >
        <Tag className="size-3" />
        Afiliado
      </span>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 ${className || ''}`}
    >
      <Tag className="mt-0.5 size-3.5 shrink-0" />
      <span>
        <strong>Enlace de afiliación.</strong> Ophyra puede recibir una comisión si
        compras a través de este enlace, sin coste extra para ti. La selección es
        independiente y refleja productos que recomendamos.
      </span>
    </div>
  );
}
