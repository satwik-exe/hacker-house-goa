import { list } from '@vercel/blob';
import { headers } from 'next/headers';

async function getMeta(id) {
  if (!id) return null;
  try {
    const { blobs } = await list({ prefix: `meta/${id}.json`, limit: 1 });
    if (!blobs[0]) return null;
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('meta lookup failed', err);
    return null;
  }
}

function getOrigin() {
  const hdrs = headers();
  const host = hdrs.get('host');
  const proto = hdrs.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : '';
}

export async function generateMetadata({ params }) {
  const meta = await getMeta(params.id);
  const caption = meta?.caption || "I'm building at Hacker House Goa 2026 🇮🇳🔥 #FrameInGoa";
  const origin = getOrigin();
  const canonical = origin ? `${origin}/p/${params.id}` : undefined;

  if (!meta?.img) {
    return {
      title: 'Hacker House Goa 2026',
      description: caption,
    };
  }

  return {
    title: 'My Hacker House Goa 2026 pass',
    description: caption,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: 'Hacker House Goa 2026',
      description: caption,
      ...(canonical ? { url: canonical } : {}),
      images: [{ url: meta.img, width: 1080, height: meta.format === 'card' ? 1350 : 1080 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hacker House Goa 2026',
      description: caption,
      images: [meta.img],
    },
  };
}

export default async function SharePage({ params }) {
  const meta = await getMeta(params.id);
  const caption = meta?.caption || '';
  const origin = getOrigin();
  const pageUrl = origin ? `${origin}/p/${params.id}` : '';
  const tweetHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(pageUrl)}`;

  return (
    <main className="share-page">
      <div className="share-card">
        {meta?.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.img} alt="Your Hacker House Goa 2026 graphic" className="share-img" />
        ) : (
          <p>This pass link has expired or wasn&apos;t found — go back and generate a new one.</p>
        )}
        <div className="share-actions">
          {meta?.img && (
            <a className="btn btn-primary" href={meta.img} download target="_blank" rel="noopener noreferrer">
              ⬇ Download image
            </a>
          )}
          {meta?.img && (
            <a className="btn btn-share" href={tweetHref} target="_blank" rel="noopener noreferrer">
              𝕏 Post to X
            </a>
          )}
          <a className="btn btn-ghost" href="/">
            ← Make your own
          </a>
        </div>
      </div>
    </main>
  );
}
