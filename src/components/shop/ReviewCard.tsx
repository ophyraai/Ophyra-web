'use client';

import { BadgeCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import StarRating from './StarRating';
import type { Review } from '@/types/marketplace';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const t = useTranslations('reviews');

  const date = new Date(review.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-xl border border-ofira-card-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm font-semibold text-ofira-text">{review.author_name}</span>
        </div>
        <span className="text-xs text-ofira-text-secondary">{date}</span>
      </div>

      {review.is_verified_purchase && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          <BadgeCheck className="size-3" />
          {t('verifiedPurchase')}
        </div>
      )}

      <p className="text-sm leading-relaxed text-ofira-text-secondary">{review.body}</p>
    </div>
  );
}
