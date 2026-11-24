// Extract an 11-char YouTube id from a watch/share/embed URL (null if not YouTube).
export function parseYouTubeId(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export const youTubeThumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
