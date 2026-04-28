import { Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import ReviewCard from './ReviewCard';
import type { Review } from '@/types/marketplace';

interface ReviewSectionProps {
  reviews: Review[];
  rating: number | null;
  reviewCount: number;
  productId: string;
  canReview: boolean;
  userId?: string | null;
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-right font-medium text-ofira-text-secondary">{stars}</span>
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ofira-surface2">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs text-ofira-text-secondary">{count}</span>
    </div>
  );
}

export default async function ReviewSection({
  reviews,
  rating,
  reviewCount,
  productId,
  canReview,
  userId,
}: ReviewSectionProps) {
  const t = await getTranslations('reviews');

  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
  }
  const totalDisplayed = reviews.length;
  const reviewLabel = reviewCount === 1 ? t('review') : t('reviewsPlural');

  return (
    <section id="reviews" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-ofira-card-border bg-white p-6 sm:p-8">
        <h2 className="mb-6 text-2xl font-bold text-ofira-text">
          {t('title')}
        </h2>

        <div className="mb-8 grid gap-8 sm:grid-cols-[240px_1fr]">
          {/* Aggregate */}
          <div className="text-center sm:text-left">
            <div className="text-5xl font-bold text-ofira-text">
              {rating != null ? rating.toFixed(1) : '—'}
            </div>
            <div className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-5 ${
                    i < Math.round(rating ?? 0)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-sm text-ofira-text-secondary">
              {reviewCount} {reviewLabel}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="flex flex-col justify-center gap-1.5">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar key={stars} stars={stars} count={dist[stars]} total={totalDisplayed} />
            ))}
          </div>
        </div>

        {/* Review form CTA */}
        {canReview && userId && (
          <div className="mb-6 rounded-xl border border-dashed border-ofira-card-border bg-ofira-surface1 p-4 text-center">
            <p className="mb-2 text-sm font-medium text-ofira-text">
              {t('canReviewCta')}
            </p>
            <a
              href="#review-form"
              className="inline-flex items-center gap-1.5 rounded-lg bg-ofira-violet px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ofira-violet/90"
            >
              {t('writeReview')}
            </a>
          </div>
        )}

        {/* Showing X of Y */}
        {reviews.length > 0 && reviews.length < reviewCount && (
          <p className="mb-4 text-xs text-ofira-text-secondary">
            {t('showingOf', { shown: reviews.length, total: reviewCount })}
          </p>
        )}

        {/* Review list */}
        {reviews.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-ofira-text-secondary">
            {t('noReviews')}
          </p>
        )}
      </div>
    </section>
  );
}
