'use client';

import { useState, useRef, useEffect, useMemo, useId } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly string[];
  placeholder?: string;
  className?: string;
}

/**
 * Combobox accesible con sugerencias filtradas + entrada libre.
 *
 * UX:
 *   - Click o focus → abre el dropdown con todas las sugerencias
 *   - Escribir → filtra (case-insensitive, busca substring)
 *   - Click en sugerencia → la selecciona y cierra
 *   - ↑/↓ navegación, Enter selecciona, Esc cierra
 *   - Si escribes algo que no está en la lista, se queda como valor
 *     personalizado (con badge "personalizada")
 *   - Click fuera cierra
 */
export default function CategoryCombobox({
  value,
  onChange,
  suggestions,
  placeholder = 'Elige o escribe...',
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((s) => s.toLowerCase().includes(q));
  }, [value, suggestions]);

  const isCustom = value.trim().length > 0 && !suggestions.includes(value.trim());

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // Reset highlight cuando cambia el filtro
  useEffect(() => {
    setHighlightedIdx(0);
  }, [value]);

  function selectValue(v: string) {
    onChange(v);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && filtered[highlightedIdx]) {
        e.preventDefault();
        selectValue(filtered[highlightedIdx]);
      }
      // Si no hay match, deja el form submit normal
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          required
          minLength={2}
          maxLength={50}
          className="w-full rounded-lg border border-ofira-card-border bg-white px-3 py-2 pr-9 text-sm text-ofira-text placeholder:text-ofira-text-secondary/60 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setOpen((o) => !o);
            inputRef.current?.focus();
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-ofira-text-secondary hover:bg-ofira-surface1 hover:text-ofira-text"
          aria-label="Mostrar sugerencias"
        >
          <ChevronDown
            className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Badge "personalizada" si el valor no está en las sugerencias */}
      {isCustom && !open && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-ofira-violet">
          <Sparkles className="size-3" />
          Categoría personalizada
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-ofira-card-border bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-ofira-text-secondary">
              {value.trim().length > 0 ? (
                <>
                  Sin sugerencias.{' '}
                  <span className="font-medium text-ofira-violet">
                    &quot;{value}&quot; será tu categoría personalizada.
                  </span>
                </>
              ) : (
                'Empieza a escribir...'
              )}
            </div>
          ) : (
            filtered.map((s, idx) => {
              const selected = s === value;
              const highlighted = idx === highlightedIdx;
              return (
                <button
                  key={s}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setHighlightedIdx(idx)}
                  onClick={() => selectValue(s)}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm transition-colors ${
                    highlighted
                      ? 'bg-ofira-violet/10 text-ofira-text'
                      : 'text-ofira-text hover:bg-ofira-surface1'
                  }`}
                >
                  <span>{s}</span>
                  {selected && <Check className="size-4 text-ofira-violet" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
