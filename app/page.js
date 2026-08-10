'use client';

import { useEffect, useRef, useState } from 'react';

const SIZES = {
  pfp: { w: 1080, h: 1080 },
  card: { w: 1080, h: 1350 },
};

const TITLE_PREFIX = ['Chief', 'Head of', 'Lead', 'Senior', 'Resident', 'Certified', 'Full-Stack', '24/7'];
const TITLE_ROLE = [
  'Vibe Compiler', 'Bug Whisperer', 'Pixel Alchemist', 'Merge Conflict Mediator',
  'Ship-It Specialist', 'Chaos Engineer', 'Midnight Committer', 'Prompt Whisperer',
  'Demo Day Daredevil', 'Stack Overflow Diplomat', 'Caffeine-to-Code Converter', 'Rubber Duck Consultant',
];
function randomTitle() {
  const p = TITLE_PREFIX[Math.floor(Math.random() * TITLE_PREFIX.length)];
  const r = TITLE_ROLE[Math.floor(Math.random() * TITLE_ROLE.length)];
  return `${p} ${r}`;
}

/* ---------------- canvas drawing helpers (pure functions) ---------------- */
function drawDots(ctx, x, y, w, h, color, step, alpha) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = color; ctx.globalAlpha = alpha;
  for (let yy = y; yy < y + h; yy += step) {
    for (let xx = x; xx < x + w; xx += step) {
      ctx.beginPath(); ctx.arc(xx, yy, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function coverRect(img, boxW, boxH, zoom, offX, offY) {
  const ir = img.width / img.height, br = boxW / boxH;
  let bw, bh;
  if (ir > br) { bh = boxH; bw = boxH * ir; } else { bw = boxW; bh = boxW / ir; }
  const w = bw * zoom, h = bh * zoom;
  let x = (boxW - w) / 2 + offX;
  let y = (boxH - h) / 2 + offY;
  x = Math.min(0, Math.max(boxW - w, x));
  y = Math.min(0, Math.max(boxH - h, y));
  return { x, y, w, h };
}

function drawPinkStamp(ctx, cx, cy, rot, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(scale, scale);
  roundRectPath(ctx, -78, -34, 156, 68, 12);
  ctx.fillStyle = '#ff2f92';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.setLineDash([7, 6]);
  ctx.strokeStyle = '#f4d724';
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#f4d724';
  ctx.font = '700 34px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('गोवा', 0, 2);
  ctx.restore();
}

function drawPfp(ctx, canvas, p) {
  const W = canvas.width, H = canvas.height;
  const grad = ctx.createRadialGradient(W * 0.35, H * 0.25, 40, W * 0.5, H * 0.5, W * 0.75);
  grad.addColorStop(0, '#173d24'); grad.addColorStop(1, '#0c2a19');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  drawDots(ctx, 0, 0, W, H, '#f4d724', 26, 0.10);

  const cx = W / 2, cy = H * 0.52, r = W * 0.355;

  if (p.img) {
    const box = coverRect(p.img, r * 2, r * 2, p.zoom, p.offX, p.offY);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(p.img, cx - r + box.x, cy - r + box.y, box.w, box.h);
    ctx.restore();
  } else {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#1b4a2a'; ctx.fill(); ctx.restore();
  }

  ctx.beginPath(); ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
  ctx.lineWidth = 18; ctx.strokeStyle = '#f4d724'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r + 30, 0, Math.PI * 2);
  ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.strokeStyle = '#ff2f92'; ctx.stroke(); ctx.setLineDash([]);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4d724';
  ctx.font = '900 76px "Playfair Display", serif';
  ctx.fillText('HACKER HOUSE', cx, H * 0.145);
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.fillStyle = '#dfe9d8';
  ctx.fillText('B U I L D E R   E D I T I O N', cx, H * 0.185);

  const bandH = 92, bandY = H - bandH - 40;
  roundRectPath(ctx, W * 0.08, bandY, W * 0.84, bandH, 16);
  ctx.fillStyle = 'rgba(0,0,0,0.32)'; ctx.fill();
  ctx.fillStyle = '#f4d724';
  ctx.font = '700 30px "Space Mono", monospace';
  ctx.fillText('GOA, INDIA · 28–31 OCT 2026', cx, bandY + bandH / 2 + 10);

  drawPinkStamp(ctx, cx + r * 0.62, cy + r * 0.62, -8, 1.35);
}

function drawCard(ctx, canvas, p) {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#faf3df'; ctx.fillRect(0, 0, W, H);
  drawDots(ctx, 0, 0, W, H, '#0c2a19', 22, 0.05);

  const headerH = 190;
  ctx.fillStyle = '#0c2a19'; ctx.fillRect(0, 0, W, headerH);
  drawDots(ctx, 0, 0, W, headerH, '#f4d724', 22, 0.08);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f4d724';
  ctx.font = '900 58px "Playfair Display", serif';
  ctx.fillText('HACKER GOA HOUSE', 60, 100);
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.fillStyle = '#dfe9d8';
  ctx.fillText('OFFICIAL BUILDER PASS · 2026', 62, 140);
  drawPinkStamp(ctx, W - 140, 95, 8, 1.05);

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.arc(0, headerH + 330, 34, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W, headerH + 330, 34, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(50, headerH + 330); ctx.lineTo(W - 50, headerH + 330);
  ctx.setLineDash([10, 10]); ctx.lineWidth = 3; ctx.strokeStyle = '#cdbd7c'; ctx.stroke(); ctx.setLineDash([]);

  const boxSize = 620, boxX = (W - boxSize) / 2, boxY = headerH + 55;
  ctx.save();
  roundRectPath(ctx, boxX - 10, boxY - 10, boxSize + 20, boxSize + 20, 26);
  ctx.fillStyle = '#0c2a19'; ctx.fill();
  ctx.restore();

  if (p.img) {
    const box = coverRect(p.img, boxSize, boxSize, p.zoom, p.offX, p.offY);
    ctx.save();
    roundRectPath(ctx, boxX, boxY, boxSize, boxSize, 18); ctx.clip();
    ctx.drawImage(p.img, boxX + box.x, boxY + box.y, box.w, box.h);
    ctx.restore();
  } else {
    roundRectPath(ctx, boxX, boxY, boxSize, boxSize, 18);
    ctx.fillStyle = '#dfe9d8'; ctx.fill();
    ctx.fillStyle = '#8a9a8e'; ctx.font = '600 22px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Your photo appears here', W / 2, boxY + boxSize / 2);
    ctx.textAlign = 'left';
  }

  let y = boxY + boxSize + 78;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0c2a19';
  ctx.font = '800 54px "Playfair Display", serif';
  ctx.fillText(p.name || 'Your Name Here', W / 2, y);

  y += 54;
  ctx.font = '700 24px "Space Mono", monospace';
  const titleText = (p.title || 'BUILDER').toUpperCase();
  const tw = ctx.measureText(titleText).width + 50;
  roundRectPath(ctx, W / 2 - tw / 2, y - 6, tw, 46, 23);
  ctx.fillStyle = '#ff2f92'; ctx.fill();
  ctx.fillStyle = '#f4d724';
  ctx.fillText(titleText, W / 2, y + 26);

  y += 76;
  ctx.font = '600 30px Inter, sans-serif';
  ctx.fillStyle = '#3c4a3f';
  ctx.fillText(p.stack || 'Stack / Role', W / 2, y);

  const footH = 120;
  ctx.fillStyle = '#0c2a19'; ctx.fillRect(0, H - footH, W, footH);
  ctx.textAlign = 'left';
  ctx.font = '700 26px "Space Mono", monospace';
  ctx.fillStyle = '#f4d724';
  ctx.fillText('GOA, INDIA · 28–31 OCT 2026', 55, H - footH / 2 + 8);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#dfe9d8';
  ctx.fillText('#FrameInGoa', W - 55, H - footH / 2 + 8);
}

function render(canvas, p) {
  const ctx = canvas.getContext('2d');
  const sz = SIZES[p.format];
  if (canvas.width !== sz.w) canvas.width = sz.w;
  if (canvas.height !== sz.h) canvas.height = sz.h;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (p.format === 'pfp') drawPfp(ctx, canvas, p); else drawCard(ctx, canvas, p);
}

/* ---------------- React component ---------------- */
export default function Page() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const paramsRef = useRef({ format: 'pfp', img: null, zoom: 1, offX: 0, offY: 0, name: '', stack: '', title: '' });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });

  const [format, setFormatState] = useState('pfp');
  const [hasImage, setHasImage] = useState(false);
  const [name, setName] = useState('');
  const [stack, setStack] = useState('');
  const [title, setTitle] = useState('');
  const [zoom, setZoom] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const toastTimer = useRef(null);
  function toast(msg, ms = 3200) {
    setToastMsg(msg); setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), ms);
  }

  function redraw() {
    if (canvasRef.current) render(canvasRef.current, paramsRef.current);
  }

  useEffect(() => {
    paramsRef.current.title = title || randomTitle();
    if (!title) setTitle(paramsRef.current.title);
    document.fonts.ready.then(redraw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { paramsRef.current.format = format; redraw(); }, [format]);
  useEffect(() => { paramsRef.current.name = name; redraw(); }, [name]);
  useEffect(() => { paramsRef.current.stack = stack; redraw(); }, [stack]);
  useEffect(() => { paramsRef.current.title = title; redraw(); }, [title]);
  useEffect(() => { paramsRef.current.zoom = zoom; redraw(); }, [zoom]);

  function setFormat(fmt) {
    paramsRef.current.zoom = 1; paramsRef.current.offX = 0; paramsRef.current.offY = 0;
    setZoom(1);
    setFormatState(fmt);
  }

  function rerollTitle() { setTitle(randomTitle()); }
  function fillExample() {
    setName('Satoshi Nakamoto');
    setStack('Full-Stack / Rust / AI');
    rerollTitle();
  }

  async function handleFile(file) {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) { toast("That file's a bit large — try a photo under 12MB."); return; }
    let workingFile = file;
    const isHeic = /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
    try {
      if (isHeic) {
        toast('Converting HEIC photo…', 4000);
        const heic2any = (await import('heic2any')).default;
        let out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
        if (Array.isArray(out)) out = out[0];
        workingFile = out;
      }
      const url = URL.createObjectURL(workingFile);
      const img = new Image();
      img.onload = () => {
        paramsRef.current.img = img;
        paramsRef.current.zoom = 1; paramsRef.current.offX = 0; paramsRef.current.offY = 0;
        setZoom(1);
        setHasImage(true);
        redraw();
      };
      img.onerror = () => toast("Couldn't read that photo — try exporting it as JPG or PNG.");
      img.src = url;
    } catch (err) {
      console.error(err);
      toast("Couldn't read that photo — try exporting it as JPG or PNG.");
    }
  }

  function canvasScale() {
    const c = canvasRef.current;
    return c.width / c.getBoundingClientRect().width;
  }
  function onPointerDown(e) {
    if (!paramsRef.current.img) return;
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX; dragRef.current.lastY = e.clientY;
    e.target.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragRef.current.dragging) return;
    const s = canvasScale();
    paramsRef.current.offX += (e.clientX - dragRef.current.lastX) * s;
    paramsRef.current.offY += (e.clientY - dragRef.current.lastY) * s;
    dragRef.current.lastX = e.clientX; dragRef.current.lastY = e.clientY;
    redraw();
  }
  function onPointerUp() { dragRef.current.dragging = false; }

  function currentBlob() {
    return new Promise((res) => canvasRef.current.toBlob((b) => res(b), 'image/png', 0.95));
  }

  async function downloadImage() {
    const blob = await currentBlob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hacker-house-goa-2026-${format}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    toast('Image downloaded ✅');
  }

  function buildCaption() {
    if (format === 'card') {
      return `I'm building at Hacker House Goa 2026 🇮🇳🔥\n${name ? name + ' — ' : ''}${stack || 'Builder'}\n#FrameInGoa #HHGoa2026`;
    }
    return `New PFP, who dis? Building at Hacker House Goa 2026 🇮🇳🔥\n#FrameInGoa #HHGoa2026`;
  }

  // Always routes through X specifically (not the OS share sheet).
  // Opens the tab synchronously on click so Safari/Chrome popup blockers
  // don't kill it while we're awaiting the upload.
  async function shareToX() {
    setBusy(true);
    const xTab = window.open('', '_blank');
    try {
      const blob = await currentBlob();
      const caption = buildCaption();

      let shareUrl = null;
      try {
        const qs = new URLSearchParams({ caption, format }).toString();
        const res = await fetch(`/api/upload?${qs}`, {
          method: 'POST',
          headers: { 'Content-Type': 'image/png' },
          body: blob,
        });
        if (!res.ok) throw new Error('upload failed');
        const { id } = await res.json();
        shareUrl = `${window.location.origin}/p/${id}`;
      } catch (err) {
        console.error('upload failed, posting text-only intent', err);
      }

      const intent = shareUrl
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(shareUrl)}`
        : `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;

      if (xTab) xTab.location.href = intent; else window.open(intent, '_blank');

      if (!shareUrl) {
        await downloadImage();
        toast('Posted without a link preview — image also downloaded, attach it manually 👇', 5000);
      }
    } catch (err) {
      console.error(err);
      if (xTab) xTab.close();
      toast('Something went wrong generating the share link — try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="hero">
        <div className="hero-brand">2:47 PM STUDIO PRESENTS</div>
        <h1 className="hero-title">HACKER HOUSE</h1>
        <div className="hero-stamp">गोवा</div>
        <div className="hero-sub">GOA, INDIA &nbsp;•&nbsp; 28–31 OCT 2026 &nbsp;•&nbsp; #FrameInGoa</div>
      </div>

      <div className="app-wrap dots-bg">
        <div className="app-header">
          <h1>Builder Frame Generator</h1>
          <div className="tag">UPLOAD → GENERATE → SHARE</div>
        </div>

        <div className="format-toggle">
          <button className={format === 'pfp' ? 'active' : ''} onClick={() => setFormat('pfp')}>
            PFP Frame <span>Circular X profile photo</span>
          </button>
          <button className={format === 'card' ? 'active' : ''} onClick={() => setFormat('card')}>
            Builder Pass <span>Badge-style ID card</span>
          </button>
        </div>

        <div className="grid">
          <div className="panel">
            <div className="field">
              <label>Your photo</label>
              <div
                className={`dropzone${dragActive ? ' drag' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0c2a19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4M12 4l-5 5M12 4l5 5" />
                  <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                </svg>
                <div className="dz-title">Drop your photo here or tap to browse</div>
                <div className="dz-sub">JPG, PNG, WEBP or HEIC · works entirely on your device</div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                id="fileInput"
                accept="image/*,.heic,.heif"
                onChange={(e) => handleFile(e.target.files[0])}
              />

              <div className={`reposition${hasImage ? ' show' : ''}`}>
                <div className="hint">Drag the photo to reposition · zoom to crop</div>
                <input
                  type="range" min="1" max="2.5" step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {format === 'card' && (
              <div>
                <div className="field">
                  <label>Full name</label>
                  <input type="text" maxLength={34} placeholder="e.g. Satoshi Nakamoto" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                  <label>Stack / role</label>
                  <input type="text" maxLength={30} placeholder="e.g. Full-Stack / Rust / AI" value={stack} onChange={(e) => setStack(e.target.value)} />
                </div>
                <div className="field">
                  <label>Builder title <span style={{ textTransform: 'none' }}>(generated)</span></label>
                  <div className="row-btns">
                    <input type="text" style={{ flex: 1 }} readOnly value={title} />
                    <button className="btn btn-ghost" onClick={rerollTitle}>🎲 Reroll</button>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ width: '100%' }} onClick={fillExample}>⚡ Fill example</button>
              </div>
            )}
          </div>

          <div className="panel preview-panel">
            <div className="canvas-wrap">
              <canvas
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={onPointerUp}
              />
            </div>
            <div className="actions">
              <button className="btn btn-primary" disabled={!hasImage} onClick={downloadImage}>⬇ Download image</button>
              <button className="btn btn-share" disabled={!hasImage || busy} onClick={shareToX}>
                {busy ? 'Preparing…' : '𝕏 Share to X'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="site-footer">Built for HH Goa 2026 builders &amp; attendees · image generation runs fully in your browser</footer>

      <div className={`toast${toastShow ? ' show' : ''}`}>{toastMsg}</div>
    </>
  );
}
