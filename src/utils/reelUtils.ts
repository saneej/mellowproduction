export interface ParsedReel {
  embedUrl: string;
  source: 'instagram' | 'youtube' | 'direct' | 'video';
  videoId?: string;
  thumbnailUrl?: string;
  originalUrl: string;
}

/**
 * Parses Instagram Reel, Instagram Post, YouTube Shorts, YouTube Video,
 * Google Drive Video, or Direct MP4/Video URLs into standard embeddable format.
 */
export function parseReelUrl(inputUrl: string): ParsedReel {
  if (!inputUrl) {
    return {
      embedUrl: '',
      source: 'direct',
      originalUrl: '',
    };
  }

  const url = inputUrl.trim();

  // 1. Direct Video File (.mp4, .mov, .webm, blob)
  const isDirectVideo = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) || url.startsWith('blob:');
  if (isDirectVideo) {
    return {
      embedUrl: url,
      source: 'video',
      originalUrl: url,
    };
  }

  // 2. Google Drive Video
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      source: 'direct',
      videoId: fileId,
      originalUrl: url,
    };
  }

  // 3. Instagram Reel or Post
  // e.g. https://www.instagram.com/reel/C123456789/
  // e.g. https://www.instagram.com/p/C123456789/
  // e.g. https://instagram.com/reels/C123456789/
  const igMatch = url.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i);
  if (igMatch && igMatch[1]) {
    const code = igMatch[1];
    return {
      embedUrl: `https://www.instagram.com/reel/${code}/embed/`,
      source: 'instagram',
      videoId: code,
      thumbnailUrl: undefined,
      originalUrl: url,
    };
  }

  // 4. YouTube Shorts or standard YouTube Video
  // e.g. https://www.youtube.com/shorts/VIDEO_ID
  // e.g. https://youtu.be/VIDEO_ID
  // e.g. https://www.youtube.com/watch?v=VIDEO_ID
  const ytMatch = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?v=)([A-Za-z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&playsinline=1`,
      source: 'youtube',
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: url,
    };
  }

  // 5. Fallback direct link
  return {
    embedUrl: url,
    source: 'direct',
    originalUrl: url,
  };
}

/**
 * Sample default reel templates for quick admin testing
 */
export const SAMPLE_REELS = [
  {
    id: 'sample-1',
    url: 'https://www.instagram.com/reel/C8X_sample1/',
    title: 'Wedding Highlights & First Dance',
    caption: 'Magical moment under the starlight ✨',
    source: 'instagram' as const,
  },
  {
    id: 'sample-2',
    url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    title: 'Behind The Scenes Reel',
    caption: 'Unfiltered laughter and joy 🤍',
    source: 'youtube' as const,
  }
];
