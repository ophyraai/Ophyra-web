import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { sanitizeFilename } from '@/lib/security/sanitize';

const MAX_FILES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  // Defense-in-depth #3: la API también verifica admin (no solo el middleware)
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;

  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 5MB limit` },
          { status: 400 },
        );
      }
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `File "${file.name}" is not an image` },
          { status: 400 },
        );
      }
    }

    const urls: string[] = [];

    for (const file of files) {
      const safeName = sanitizeFilename(file.name);
      const path = `${crypto.randomUUID()}/${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabaseAdmin.storage
        .from('product-images')
        .upload(path, buffer, {
          contentType: file.type,
          cacheControl: '31536000', // 1 año
        });

      if (error) {
        console.error(`Failed to upload "${file.name}":`, error.message);
        continue;
      }

      const { data } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(path);

      urls.push(data.publicUrl);
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'All uploads failed' },
        { status: 500 },
      );
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Admin upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 },
    );
  }
}
