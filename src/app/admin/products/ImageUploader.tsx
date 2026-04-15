'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export default function ImageUploader({ value, onChange, max = 8 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = max - value.length;
    if (remaining <= 0) {
      setError(`Máximo ${max} imágenes`);
      return;
    }

    const filesArr = Array.from(files).slice(0, remaining);

    // Validación rápida en cliente
    for (const f of filesArr) {
      if (!f.type.startsWith('image/')) {
        setError(`"${f.name}" no es una imagen`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`"${f.name}" supera los 5MB`);
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      for (const f of filesArr) formData.append('images', f);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      const data = await res.json();
      const newUrls: string[] = Array.isArray(data.urls) ? data.urls : [];
      onChange([...value, ...newUrls]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...value];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Galería actual */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative aspect-square overflow-hidden rounded-lg border border-ofira-card-border bg-ofira-surface1"
            >
              <Image
                src={url}
                alt={`Imagen ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded bg-ofira-violet px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Portada
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-ofira-text hover:bg-white"
                  >
                    ↑
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="rounded bg-rose-600 p-1.5 text-white hover:bg-rose-700"
                  title="Eliminar"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón de upload */}
      {value.length < max && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ofira-card-border bg-white p-6 text-sm text-ofira-text-secondary transition-colors hover:border-ofira-violet hover:bg-ofira-surface1">
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Subiendo…
            </>
          ) : (
            <>
              {value.length === 0 ? (
                <ImagePlus className="size-4" />
              ) : (
                <Upload className="size-4" />
              )}
              {value.length === 0
                ? 'Subir imágenes'
                : `Añadir más (${value.length}/${max})`}
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      {error && (
        <p className="text-xs text-rose-600">{error}</p>
      )}

      <p className="text-xs text-ofira-text-secondary">
        PNG / JPG / WebP. Máx 5MB por imagen, hasta {max} imágenes. La primera será la
        portada.
      </p>
    </div>
  );
}
