'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Star, Loader2, Check } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  userName?: string;
}

export default function ReviewForm({ productId, userName }: ReviewFormProps) {
  const t = useTranslations('reviews');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState(userName || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError(t('selectRating'));
      return;
    }
    if (body.trim().length < 10) {
      setError(t('minLength'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating,
          body: body.trim(),
          ...(authorName.trim() && { author_name: authorName.trim() }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error');
        return;
      }

      setSuccess(true);
    } catch {
      setError(t('connectionError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div id="review-form" className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <Check className="mx-auto mb-2 size-8 text-emerald-600" />
        <p className="font-semibold text-emerald-800">{t('successTitle')}</p>
        <p className="mt-1 text-sm text-emerald-700">{t('successMessage')}</p>
      </div>
    );
  }

  return (
    <form id="review-form" onSubmit={handleSubmit} className="rounded-xl border border-ofira-card-border bg-white p-5">
      <h3 className="mb-4 text-lg font-semibold text-ofira-text">{t('formTitle')}</h3>

      {/* Star selector */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-ofira-text-secondary">{t('ratingLabel')}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <Star
                className={`size-7 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-ofira-text-secondary">
          {t('nameLabel')} <span className="text-ofira-text-secondary/50">{t('nameOptional')}</span>
        </label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder={t('namePlaceholder')}
          maxLength={50}
          className="w-full rounded-lg border border-ofira-card-border bg-white px-3 py-2 text-sm text-ofira-text placeholder:text-ofira-text-secondary/40 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20"
        />
      </div>

      {/* Body */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-ofira-text-secondary">{t('bodyLabel')}</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('bodyPlaceholder')}
          rows={4}
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-ofira-card-border bg-white px-3 py-2 text-sm text-ofira-text placeholder:text-ofira-text-secondary/40 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20"
        />
        <p className="mt-1 text-right text-xs text-ofira-text-secondary">{body.length}/2000</p>
      </div>

      {error && (
        <p className="mb-3 text-sm font-medium text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ofira-violet/90 disabled:opacity-60"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {t('submit')}
      </button>
    </form>
  );
}
