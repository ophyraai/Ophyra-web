'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';

interface SubscriptionData {
  isPremium: boolean;
  followUpDate: string | null;
  startedAt: string | null;
  renewalOfferExpires: string | null;
  renewalCount: number;
  isExpired: boolean;
  email: string | null;
  loading: boolean;
}

export function useSubscription(userId: string | null): SubscriptionData {
  const [isPremium, setIsPremium] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [renewalOfferExpires, setRenewalOfferExpires] = useState<string | null>(null);
  const [renewalCount, setRenewalCount] = useState(0);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setIsPremium(data.plan === 'premium');
          setFollowUpDate(data.follow_up_date);
          setStartedAt(data.started_at);
          setRenewalOfferExpires(data.renewal_offer_expires);
          setRenewalCount(data.renewal_count ?? 0);
          setEmail(data.email);
        }
        setLoading(false);
      });
  }, [userId]);

  const isExpired = useMemo(() => {
    if (!startedAt) return false;
    const start = new Date(startedAt);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return elapsed > 30;
  }, [startedAt]);

  return { isPremium, followUpDate, startedAt, renewalOfferExpires, renewalCount, isExpired, email, loading };
}
