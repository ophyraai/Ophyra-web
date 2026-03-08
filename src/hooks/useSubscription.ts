'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useSubscription(userId: string | null) {
  const [isPremium, setIsPremium] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()
      .then(({ data }) => {
        if (data) {
          setIsPremium(data.plan === 'premium');
          setFollowUpDate(data.follow_up_date);
        }
        setLoading(false);
      });
  }, [userId]);

  return { isPremium, followUpDate, loading };
}
