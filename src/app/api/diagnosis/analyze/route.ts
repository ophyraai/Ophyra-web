import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { deepseek } from '@ai-sdk/deepseek';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSystemPrompt } from '@/lib/ai/system-prompt';
import { diagnosisAnalyzeSchema } from '@/lib/validation/diagnosis';
import { checkRateLimit, analyzeLimiter, getClientIp } from '@/lib/security/rate-limit';
import { getSignedPhotoUrls } from '@/lib/supabase/storage';

export async function POST(req: Request) {
  const rl = await checkRateLimit(analyzeLimiter, getClientIp(req));
  if (rl) return rl;

  try {
    const body = await req.json();
    const parsed = diagnosisAnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 },
      );
    }
    const { diagnosisId, answers, scores, locale, photoUrls } = parsed.data;

    // Verify diagnosis exists (ownership is loose since anonymous users can trigger this)
    const { data: diagnosis } = await supabaseAdmin
      .from('diagnoses')
      .select('id')
      .eq('id', diagnosisId)
      .is('ai_analysis', null)
      .single();

    if (!diagnosis) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const hasPhotos = Array.isArray(photoUrls) && photoUrls.length > 0;

    // Build message content: multimodal if photos exist, text-only otherwise
    const contentParts: Array<{ type: 'text'; text: string } | { type: 'image'; image: URL }> = [];

    if (hasPhotos) {
      // Convert stored paths/URLs to short-lived signed URLs (bucket is private)
      const signedUrls = await getSignedPhotoUrls(photoUrls);
      for (const url of signedUrls) {
        contentParts.push({ type: 'image', image: new URL(url) });
      }
    }

    contentParts.push({ type: 'text', text: JSON.stringify({ answers, scores }) });

    // Try DeepSeek first (cheaper), fall back to Claude if it fails
    let text: string;
    try {
      const result = await generateText({
        model: hasPhotos ? anthropic('claude-sonnet-4-20250514') : deepseek('deepseek-chat'),
        system: getSystemPrompt(locale || 'es'),
        messages: [{ role: 'user', content: contentParts }],
      });
      text = result.text;
    } catch (primaryErr) {
      console.warn('Primary model failed, falling back to Claude:', primaryErr instanceof Error ? primaryErr.message : primaryErr);
      const result = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: getSystemPrompt(locale || 'es'),
        messages: [{ role: 'user', content: contentParts }],
      });
      text = result.text;
    }

    try {
      const aiData = JSON.parse(text);
      await supabaseAdmin
        .from('diagnoses')
        .update({
          ai_analysis: text,
          ai_summary: aiData.summary,
        })
        .eq('id', diagnosisId);
    } catch {
      console.error('Failed to parse AI response, saving raw text');
      await supabaseAdmin
        .from('diagnoses')
        .update({ ai_analysis: text })
        .eq('id', diagnosisId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Analyze diagnosis error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
