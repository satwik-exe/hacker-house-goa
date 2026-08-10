import { put } from '@vercel/blob';

export const runtime = 'nodejs';

function makeId() {
  // short, url-safe, collision-unlikely
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  ).slice(-12);
}

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const caption = searchParams.get('caption') || '';
    const format = searchParams.get('format') || 'pfp';

    const contentType = req.headers.get('content-type') || 'image/png';
    const arrayBuffer = await req.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return Response.json({ error: 'Empty upload' }, { status: 400 });
    }
    if (arrayBuffer.byteLength > 8 * 1024 * 1024) {
      return Response.json({ error: 'Image too large' }, { status: 413 });
    }

    const id = makeId();

    const imgBlob = await put(`img/${id}.png`, Buffer.from(arrayBuffer), {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });

    const meta = { img: imgBlob.url, caption, format, createdAt: Date.now() };

    await put(`meta/${id}.json`, JSON.stringify(meta), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return Response.json({ id });
  } catch (err) {
    console.error('upload error', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
