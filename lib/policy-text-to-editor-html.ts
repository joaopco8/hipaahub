/**
 * Converts the plain-text policy template format to TipTap-compatible HTML.
 *
 * The view/preview page uses rich plain-text templates with a custom renderer.
 * The TipTap editor needs semantic HTML (h1-h4, p, ul/li).
 * This function bridges the two so the editor always shows the real policy.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function policyTextToEditorHtml(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  const bulletBuf: string[] = [];

  // Document-control section: accumulate key→value alternating lines
  let inDocControl = false;
  let dcBuf: string[] = [];

  const flushBullets = () => {
    if (bulletBuf.length === 0) return;
    out.push('<ul>');
    for (const b of bulletBuf) out.push(`<li>${b}</li>`);
    out.push('</ul>');
    bulletBuf.length = 0;
  };

  const flushDocControl = () => {
    if (dcBuf.length === 0) return;
    // Render as a simple table-like block of key: value paragraphs
    out.push('<p>');
    for (let j = 0; j + 1 < dcBuf.length; j += 2) {
      const k = dcBuf[j];
      const v = dcBuf[j + 1] ?? '';
      out.push(`<strong>${esc(k)}:</strong> ${esc(v)}<br>`);
    }
    out.push('</p>');
    dcBuf.length = 0;
    inDocControl = false;
  };

  for (const raw of lines) {
    const t = raw.trim();

    /* ── blank line ──────────────────────────────────────────────── */
    if (!t) {
      flushBullets();
      // Blank line ends doc-control only if we have pairs buffered
      if (inDocControl && dcBuf.length > 0 && dcBuf.length % 2 === 0) {
        // keep collecting until a structural break
      }
      continue;
    }

    /* ── decorator / separator ───────────────────────────────────── */
    if (/^[═─━=\-_]{4,}$/.test(t)) {
      flushBullets();
      if (inDocControl) flushDocControl();
      continue;
    }

    /* ── skip metadata lines ─────────────────────────────────────── */
    if (/^Pages?:\s*\d/i.test(t)) continue;
    if (t === 'Field' || t === 'Value') continue;

    /* ── start of Document Control table ────────────────────────── */
    if (t === 'Document Control') {
      flushBullets();
      inDocControl = true;
      dcBuf = [];
      out.push('<h2>Document Control</h2>');
      continue;
    }

    /* ── inside Document Control ─────────────────────────────────── */
    if (inDocControl) {
      // A numbered section or all-caps header signals end of table
      const isNewSection =
        /^POLICY\s+\d+:/i.test(t) ||
        /^\d+\.\s+[A-Z]/.test(t) ||
        /^[═─━=\-_]{4,}$/.test(t) ||
        (t === t.toUpperCase() && t.length > 4 && /[A-Z]/.test(t) && !/[{}<>]/.test(t) && !/^\d/.test(t));

      if (isNewSection) {
        flushDocControl();
        // fall through to process this line normally
      } else {
        dcBuf.push(t);
        continue;
      }
    }

    /* ── main policy title ───────────────────────────────────────── */
    if (/^POLICY\s+\d+:/i.test(t)) {
      flushBullets();
      out.push(`<h1>${esc(t)}</h1>`);
      continue;
    }

    /* ── numbered section  "1. TITLE" ───────────────────────────── */
    if (/^\d+\.\s+[A-Z]/.test(t) && !/^\d+\.\d+/.test(t)) {
      flushBullets();
      out.push(`<h2>${esc(t)}</h2>`);
      continue;
    }

    /* ── numbered sub-section  "1.1 Title" or "1.1. Title" ──────── */
    if (/^\d+\.\d+\.?\s+/.test(t) && !/^\d+\.\d+\.\d+/.test(t)) {
      flushBullets();
      out.push(`<h3>${esc(t)}</h3>`);
      continue;
    }

    /* ── numbered sub-sub-section  "1.1.1 Title" ────────────────── */
    if (/^\d+\.\d+\.\d+/.test(t)) {
      flushBullets();
      out.push(`<h4>${esc(t)}</h4>`);
      continue;
    }

    /* ── all-caps section header (e.g. "EXECUTIVE SUMMARY") ─────── */
    if (
      t === t.toUpperCase() &&
      t.length > 4 &&
      /[A-Z]/.test(t) &&
      !/[{}<>]/.test(t) &&
      !/^\d/.test(t)
    ) {
      flushBullets();
      out.push(`<h2>${esc(t)}</h2>`);
      continue;
    }

    /* ── bullet list item ────────────────────────────────────────── */
    if (/^[•\-\*]\s+/.test(t)) {
      const content = t.replace(/^[•\-\*]\s+/, '');
      bulletBuf.push(esc(content));
      continue;
    }

    /* ── regular paragraph line ──────────────────────────────────── */
    flushBullets();
    out.push(`<p>${esc(t)}</p>`);
  }

  flushBullets();
  if (inDocControl) flushDocControl();

  return out.join('\n');
}
