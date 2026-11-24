// Browser helpers for CMS forms. The form definition itself is loaded on the server.

// UTM / campaign params from the current URL, for lead attribution.
export function readUtm() {
  const out = {};
  try {
    const p = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach((k) => {
      const v = p.get(k);
      if (v) out[k] = v.slice(0, 200);
    });
  } catch { /* ignore */ }
  return out;
}

export async function submitForm(payload) {
  const res = await fetch('/api/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Submission failed. Please try again.');
  return out;
}
