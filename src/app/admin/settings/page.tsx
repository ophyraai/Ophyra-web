'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, ChevronUp, ChevronDown, Megaphone } from 'lucide-react';

const inputCls =
  'w-full rounded-lg border border-ofira-card-border bg-white px-3 py-2 text-sm text-ofira-text placeholder:text-ofira-text-secondary/60 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20';

interface AnnouncementData {
  messages: string[];
  enabled: boolean;
}

export default function SettingsPage() {
  const [data, setData] = useState<AnnouncementData>({ messages: [], enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings?key=announcement_bar')
      .then((r) => r.json())
      .then((r) => {
        if (r.value) setData(r.value);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'announcement_bar', value: data }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateMessage(index: number, value: string) {
    setData((d) => ({
      ...d,
      messages: d.messages.map((m, i) => (i === index ? value : m)),
    }));
  }

  function removeMessage(index: number) {
    setData((d) => ({
      ...d,
      messages: d.messages.filter((_, i) => i !== index),
    }));
  }

  function moveMessage(index: number, direction: -1 | 1) {
    setData((d) => {
      const msgs = [...d.messages];
      const target = index + direction;
      if (target < 0 || target >= msgs.length) return d;
      [msgs[index], msgs[target]] = [msgs[target], msgs[index]];
      return { ...d, messages: msgs };
    });
  }

  function addMessage() {
    setData((d) => ({
      ...d,
      messages: [...d.messages, ''],
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-ofira-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ofira-text">Ajustes</h1>
        <p className="mt-1 text-sm text-ofira-text-secondary">
          Configura elementos globales del sitio.
        </p>
      </div>

      {/* Announcement Bar */}
      <div className="space-y-4 rounded-2xl border border-ofira-card-border bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-ofira-violet/10 text-ofira-violet">
              <Megaphone className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
                Barra de anuncios
              </h2>
              <p className="text-xs text-ofira-text-secondary">
                La barra negra que aparece arriba del todo en la web.
              </p>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-xs font-medium text-ofira-text-secondary">
              {data.enabled ? 'Activa' : 'Desactivada'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={data.enabled}
              onClick={() => setData((d) => ({ ...d, enabled: !d.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                data.enabled ? 'bg-ofira-violet' : 'bg-ofira-surface2'
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  data.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>

        {/* Preview */}
        {data.enabled && data.messages.length > 0 && (
          <div className="overflow-hidden rounded-lg">
            <div className="flex items-center justify-center bg-ofira-text py-2 text-center text-[13px] font-medium tracking-wide text-white">
              {data.messages[0]}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-ofira-text-secondary">
            Mensajes (rotan cada 4.5s). Usa las flechas para reordenar.
          </p>
          {data.messages.map((msg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => moveMessage(i, -1)}
                  disabled={i === 0}
                  className="rounded p-0.5 text-ofira-text-secondary hover:text-ofira-violet disabled:opacity-20"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveMessage(i, 1)}
                  disabled={i === data.messages.length - 1}
                  className="rounded p-0.5 text-ofira-text-secondary hover:text-ofira-violet disabled:opacity-20"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
              <span className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-ofira-surface1 text-[11px] font-bold text-ofira-text-secondary">
                {i + 1}
              </span>
              <input
                type="text"
                value={msg}
                onChange={(e) => updateMessage(i, e.target.value)}
                className={inputCls}
                placeholder="ej: Envío gratis a partir de 40€"
              />
              <button
                type="button"
                onClick={() => removeMessage(i)}
                className="flex-shrink-0 rounded-lg p-2 text-ofira-text-secondary hover:bg-rose-50 hover:text-rose-500"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMessage}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ofira-violet hover:bg-ofira-violet/5"
          >
            <Plus className="size-4" />
            Añadir mensaje
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm font-medium text-emerald-600">Guardado</span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ofira-violet/90 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Guardar ajustes
        </button>
      </div>
    </div>
  );
}
