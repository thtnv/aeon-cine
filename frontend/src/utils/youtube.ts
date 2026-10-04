/**
 * Convert any YouTube video link (watch?v=, youtu.be, embed, shorts) to an embeddable YouTube URL
 */
export const formatYouTubeEmbedUrl = (url?: string | null): string | null => {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // Pattern to extract 11-character video ID from diverse YouTube link formats
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // If already an embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  // If user entered only the 11-char ID
  if (/^[\w-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  return trimmed;
};
