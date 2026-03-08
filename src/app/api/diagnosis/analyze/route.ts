import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSystemPrompt } from '@/lib/ai/system-prompt';

export async function POST(req: Request) {
  try {
    const { diagnosisId, answers, scores, locale, photoUrls } = await req.json();

    if (!diagnosisId || !answers || !scores) {
      return NextResponse.json(
        { error: 'Missing required fields: diagnosisId, answers, scores' },
        { status: 400 }
      );
    }

    const hasPhotos = Array.isArray(photoUrls) && photoUrls.length > 0;

    // Build message content: multimodal if photos exist, text-only otherwise
    const contentParts: Array<{ type: 'text'; text: string } | { type: 'image'; image: URL }> = [];

    if (hasPhotos) {
      for (const url of photoUrls) {
        contentParts.push({ type: 'image', image: new URL(url) });
      }
    }

    contentParts.push({ type: 'text', text: JSON.stringify({ answers, scores }) });

    const result = streamText({
      model: anthropic(hasPhotos ? 'claude-sonnet-4-20250514' : 'claude-3-5-haiku-20241022'),
      system: getSystemPrompt(locale || 'es'),
      messages: [
        {
          role: 'user',
          content: contentParts,
        },
      ],
      onFinish: async ({ text }) => {
        try {
          const parsed = JSON.parse(text);
          await supabaseAdmin
            .from('diagnoses')
            .update({
              ai_analysis: text,
              ai_summary: parsed.summary,
            })
            .eq('id', diagnosisId);
        } catch (parseErr) {
          console.error('Failed to parse AI response or update DB:', parseErr);
          await supabaseAdmin
            .from('diagnoses')
            .update({ ai_analysis: text })
            .eq('id', diagnosisId);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('Analyze diagnosis error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
