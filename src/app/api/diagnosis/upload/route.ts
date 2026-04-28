import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sanitizeFilename } from '@/lib/security/sanitize';
import { checkRateLimit, uploadLimiter, getClientIp } from '@/lib/security/rate-limit';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const rl = await checkRateLimit(uploadLimiter, getClientIp(req));
  if (rl) return rl;

  try {
    const formData = await req.formData();
    const files = formData.getAll('photos') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 5MB limit` },
          { status: 400 }
        );
      }

      if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        return NextResponse.json(
          { error: `File "${file.name}" is not a valid image` },
          { status: 400 }
        );
      }
    }

    const urls: string[] = [];

    for (const file of files) {
      const path = `diagnosis-photos/${crypto.randomUUID()}/${sanitizeFilename(file.name)}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabaseAdmin.storage
        .from('diagnosis-photos')
        .upload(path, buffer, { contentType: file.type });

      if (error) {
        console.error(`Failed to upload "${file.name}":`, error.message);
        continue;
      }

      // Store the relative path (not a public URL) — the bucket is private.
      // Signed URLs are generated on-demand when needed (e.g., AI analysis).
      urls.push(path);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
